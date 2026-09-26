import gsap from 'gsap'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three'

import {
  NODE_BY_ID,
  buildLayout,
  buildLayoutMobile,
  layoutsForViewport,
  resolvePerformanceCounts,
  understandLayout,
  understandLayoutMobile,
} from './layouts'
import type {
  HotspotInfo,
  IntelligenceClusterId,
  IntelligenceMode,
  IntelligenceSceneApi,
  IntelligenceSceneOptions,
  NodeLayout,
  PerformanceTier,
} from './types'

const COLOR = {
  snow: new Color('#fcfdfe'),
  frost: new Color('#edf4f8'),
  glacier: new Color('#ddeeff'),
  stream: new Color('#b8deff'),
  aurora: new Color('#79beff'),
  sky: new Color('#4ea5f5'),
  mountain: new Color('#276fae'),
  text: new Color('#10243a'),
}

// ── 诗云《行星指引》同款参数：平面段先向四周发散，垂直段再上升（L 形折线，非弧线） ──
const GUIDE_SPLIT = 0.6 // 平面段占生长窗口 [0, SPLIT]，垂直段占 [SPLIT, 1]
const GUIDE_GROW = 1.2 // s — 指引线从核心向外生长的时长
const GUIDE_FADE = 1.2 // s — 收起时的淡出时长
const NODE_FADE_IN = 0.4 // s — 星点闪光渐入
const NODE_REVEAL_DELAY = GUIDE_GROW // 先完整展示引导线，再点亮子节点
const NODE_HOLD_FLARE = 0.6 // 选中期间持续的高亮余量（诗云 HOLD_FLARE）
const RING_SEGMENTS = 96 // 赤道参考环分段
const RING_ALPHA = 0.16
const RING_INTENSITY = 0.35
const PLANE_SEG_DIM = 0.38 // 平面段亮度（最暗：只表达方位/半径）
const VERT_SEG_BRIGHT = 0.8 // 垂直段亮度（较亮：表达高度信息）
const BRIDGE_SEGMENTS = 24
const MIN_VIEW_SCALE = 0.36
const MAX_VIEW_SCALE = 1.2
const WHEEL_ZOOM_FACTOR = 0.0012

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

function bezierPoint(
  a: Vector3,
  c1: Vector3,
  c2: Vector3,
  b: Vector3,
  t: number,
  out: Vector3,
) {
  const u = 1 - t
  const tt = t * t
  const uu = u * u
  const uuu = uu * u
  const ttt = tt * t
  out.set(
    uuu * a.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + ttt * b.x,
    uuu * a.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + ttt * b.y,
    uuu * a.z + 3 * uu * t * c1.z + 3 * u * tt * c2.z + ttt * b.z,
  )
  return out
}

function createSoftPointTexture(): Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  // Bright Aurora/Glacier core — avoid dark electronic centers
  gradient.addColorStop(0, 'rgba(252,253,254,1)')
  gradient.addColorStop(0.18, 'rgba(221,238,255,0.95)')
  gradient.addColorStop(0.42, 'rgba(121,190,255,0.42)')
  gradient.addColorStop(0.72, 'rgba(78,165,245,0.12)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new Texture(canvas)
  texture.needsUpdate = true
  return texture
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

/**
 * 由布局节点构造对外的 HotspotInfo。
 *
 * 集中在此处是为了保证 tooltip 所需字段（名词释义 concept、关联节点 related）
 * 在所有产出路径上一致 —— 拾取、悬停、初始标签列表都走这一个函数，
 * 避免某条路径漏字段导致 tooltip 空白。
 */
function toHotspotInfo(node: NodeLayout, mode: IntelligenceMode): HotspotInfo {
  const related = (node.related ?? [])
    .map((id) => {
      const target = NODE_BY_ID.get(id)
      return target?.label ? { id, label: target.label } : null
    })
    .filter((item): item is { id: string; label: string } => item !== null)
  return {
    id: node.id,
    clusterId: node.clusterId,
    label: node.label ?? node.id,
    microcopy: node.microcopy ?? '',
    mode,
    concept: node.concept,
    related,
  }
}

export function createIntelligenceScene(
  options: IntelligenceSceneOptions,
): IntelligenceSceneApi {
  let tier: PerformanceTier = options.tier
  let reducedMotion = options.reducedMotion
  let mode: IntelligenceMode = 'build'
  let morph = 0
  let awaken = reducedMotion ? 1 : 0
  let visible = false
  let documentVisible = typeof document === 'undefined' ? true : !document.hidden
  let width = 1
  let height = 1
  let compact = false
  let viewH = 0.95
  let disposed = false
  let projectionScale = -1
  let projectionAspect = -1
  let raf = 0
  let lastTime = 0

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 }
  const cameraParallax = { x: 0, y: 0 }
  const counts = () => resolvePerformanceCounts(tier)

  let container: HTMLElement | null = null
  let renderer: WebGLRenderer | null = null
  let scene: Scene | null = null
  let camera: PerspectiveCamera | null = null
  let root: Group | null = null
  let primaryPoints: Points | null = null
  let secondaryPoints: Points | null = null
  let ambientPoints: Points | null = null
  let guideLines: LineSegments | null = null
  let bridgeLines: Line | null = null
  let hazePoints: Points | null = null

  let nodePositions: Float32Array | null = null
  let nodeColors: Float32Array | null = null
  let nodeVel: Float32Array | null = null
  let primaryPos: Float32Array | null = null
  let primaryCol: Float32Array | null = null
  let secondaryPos: Float32Array | null = null
  let secondaryCol: Float32Array | null = null
  let ambientPositions: Float32Array | null = null
  let ambientBase: Float32Array | null = null
  let guidePositions: Float32Array | null = null
  let guideColors: Float32Array | null = null
  let bridgePositions: Float32Array | null = null
  let bridgeColors: Float32Array | null = null

  let pointTexture: Texture | null = null
  let modeTween: gsap.core.Tween | null = null
  let awakenTween: gsap.core.Tween | null = null
  let focusTween: gsap.core.Tween | null = null
  /** 退出星团视图时延迟回到全景取景，避免打乱收缩动画。 */
  let collapseViewTimer: gsap.core.Tween | null = null
  let pulseT = 0
  let sceneT = 0
  let hoveredId: string | null = null
  let focusedHotspot: string | null = null
  let activeClusterId: IntelligenceClusterId | null = null
  const focus = { scale: 1, x: 0, y: 0 }

  // ── 3D 漫游轨道（诗云式自由视角）────────────────────────────────────────
  // 相机贴在以 target 为球心的球面上：spherical(radius, phi, theta)。
  // 全屏星团视图与首页内联星图共用同一套轨道，只是初始半径不同，
  // 因此两处都是真 3D —— 区别仅在于聚焦时会把相机推近到星团尺度。
  //
  // 取景不变量：visibleH = 2 * radius * tan(fov/2)。
  // focus.scale 表达「期望可见高度相对 viewH 的倍数」，半径与 FOV
  // 都从它派生，三者始终自洽（见 updateCameraProjection）。
  const RADIUS_MIN = 0.22
  const RADIUS_MAX = 24
  // 轨道半径基准：把 scale 映射为半径时的参考距离。
  // 取 1 是因为布局坐标本身就在 ~1 的量级，半径 1 配合 fov 即为「贴脸看」。
  const RADIUS_UNIT = 1
  function radiusForScale(scale: number) {
    return RADIUS_UNIT / Math.max(scale, 0.02)
  }
  const orbit = {
    radius: radiusForScale(1),
    // 极角：0 = 正上方俯视，Math.PI/2 = 水平正视。
    // 0.46π 让视角略微俯视，星团的垂直引导线因此呈现为立体纵深而非纯粹的水平线。
    phi: Math.PI * 0.46,
    // 方位角必须为 0：双星团沿 X 轴对称分布（-0.72 / +0.72），
    // 任何非零 theta 都会绕 Y 轴转动整个世界，使两个星团一前一后、
    // 透视下大小与明暗不对称（曾用 -0.42，导致左侧星团几乎看不见）。
    // 用户仍可拖动改变 theta，但初始构图必须对称。
    theta: 0,
    // 视线中心（相机始终看向这里）
    tx: 0,
    ty: 0,
    tz: 0.33,
    // 旋转与平移动量，用于松手后的惯性阻尼
    vTheta: 0,
    vPhi: 0,
    vPanX: 0,
    vPanY: 0,
  }
  let momentumActive = false
  /**
   * 首帧之前 layout 尚未就绪，此时取景无意义（尺寸还是 1x1）。
   * 置位后 applySize 才会触发重新取景。
   */
  let surfaceReady = false
  /**
   * 用户平移的持久偏移，叠加在取景目标之上。
   * 与 orbit.tx/ty（取景补间的目标）分离，避免两者互相覆盖。
   */
  const panOffset = { x: 0, y: 0, z: 0 }

  const nodeOrder = buildLayout.nodes.map((n) => n.id)
  const primaryIds = nodeOrder.filter(
    (id) => buildLayout.nodes.find((n) => n.id === id)?.role === 'primary',
  )
  const secondaryIds = nodeOrder.filter(
    (id) => buildLayout.nodes.find((n) => n.id === id)?.role === 'secondary',
  )
  const clusterIds: IntelligenceClusterId[] = ['research', 'agent']

  /** 星团状态机：expand → 平面段发散 → 垂直段上升 → 节点闪光渐入（诗云《行星指引》同款时序） */
  interface ClusterState {
    id: IntelligenceClusterId
    coreIdx: number
    nodeIdxs: number[]
    expanded: boolean
    alpha: number
    nodesAlpha: number
    flare: number
    grow: number
    born: number
    collapseAt: number | null
    ringRadius: number
  }

  const clusters = new Map<string, ClusterState>()
  const nodeClusterById = new Map<string, ClusterState>()
  const ringLoops = new Map<string, LineLoop>()
  const clusterTints = {
    plane: [
      COLOR.glacier.clone().lerp(COLOR.stream, 0.45),
      COLOR.stream.clone().lerp(COLOR.aurora, 0.4),
    ],
    vert: [
      COLOR.aurora.clone().lerp(COLOR.sky, 0.35),
      COLOR.aurora.clone().lerp(COLOR.stream, 0.5),
    ],
  }

  function initClusters() {
    clusters.clear()
    nodeClusterById.clear()
    for (const cid of clusterIds) {
      const coreIdx = nodeOrder.indexOf(cid)
      if (coreIdx < 0) continue
      const nodeIdxs: number[] = []
      for (const edge of buildLayout.edges) {
        if (edge.from !== cid) continue
        const idx = nodeOrder.indexOf(edge.to)
        const target = idx >= 0 ? buildLayout.nodes[idx] : undefined
        // The dual-core bridge also originates at research. It is not a child
        // of that cluster and must never enter its focus bounds or buffers.
        if (!target || target.clusterId !== cid || target.role !== 'secondary') continue
        nodeIdxs.push(idx)
      }
      const state: ClusterState = {
        id: cid,
        coreIdx,
        nodeIdxs,
        expanded: false,
        alpha: 0,
        nodesAlpha: 0,
        flare: 1,
        grow: 0,
        born: 0,
        collapseAt: null,
        ringRadius: 0.3,
      }
      clusters.set(cid, state)
      for (const idx of nodeIdxs) nodeClusterById.set(nodeOrder[idx]!, state)
    }
  }
  initClusters()

  function activeBuild() {
    return compact ? buildLayoutMobile : buildLayout
  }

  function activeUnderstand() {
    return compact ? understandLayoutMobile : understandLayout
  }

  let buildById = new Map(buildLayout.nodes.map((n) => [n.id, n]))
  let understandById = new Map(understandLayout.nodes.map((n) => [n.id, n]))

  function syncLayoutMaps() {
    const b = activeBuild()
    const u = activeUnderstand()
    buildById = new Map(b.nodes.map((n) => [n.id, n]))
    understandById = new Map(u.nodes.map((n) => [n.id, n]))
  }

  const tmpA = new Vector3()
  const tmpB = new Vector3()
  const tmpC1 = new Vector3()
  const tmpC2 = new Vector3()
  const tmpP = new Vector3()
  const world = new Vector3()
  const colorA = new Color()
  const colorB = new Color()
  const colorMix = new Color()

  function layoutAt(id: string, t: number): NodeLayout {
    const a = buildById.get(id)!
    const b = understandById.get(id)!
    return {
      id,
      clusterId: a.clusterId,
      role: a.role,
      position: {
        x: lerp(a.position.x, b.position.x, t),
        y: lerp(a.position.y, b.position.y, t),
        z: lerp(a.position.z, b.position.z, t),
      },
      scale: lerp(a.scale, b.scale, t),
      opacity: lerp(a.opacity, b.opacity, t),
      label: t < 0.5 ? a.label : b.label,
      hotspot: t < 0.5 ? a.hotspot : b.hotspot,
      microcopy: t < 0.5 ? a.microcopy : b.microcopy,
      // 释义与关联属于内容而非几何，不参与插值；取切换过半后的那一侧即可
      concept: t < 0.5 ? a.concept : b.concept,
      related: t < 0.5 ? a.related : b.related,
    }
  }

  function getPrimaryLabels(forMode: IntelligenceMode): HotspotInfo[] {
    const source = forMode === 'build' ? activeBuild() : activeUnderstand()
    return source.nodes
      .filter((n) => n.role === 'primary' && n.label)
      .map((n) => toHotspotInfo(n, forMode))
  }

  function maxDpr() {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    if (tier === 'reduced') return Math.min(dpr, 1.15)
    if (tier === 'balanced') return Math.min(dpr, 1.35)
    return Math.min(dpr, 1.5)
  }

  function shouldLoop() {
    return !disposed && visible && documentVisible && !!renderer
  }

  function ensureLoop() {
    if (!shouldLoop() || raf) return
    lastTime = performance.now()
    raf = requestAnimationFrame(tick)
  }

  function stopLoop() {
    if (!raf) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  function onVisibility() {
    documentVisible = !document.hidden
    if (documentVisible) ensureLoop()
    else stopLoop()
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    stopLoop()
    options.onError?.(new Error('WebGL context lost'))
  }

  function onContextRestored() {
    // Prefer stable fallback over complex recovery.
    options.onError?.(new Error('WebGL context restored — using fallback'))
  }

  function buildGeometries() {
    if (!scene || !root) return

    const { ambient } = counts()
    const nodeCount = nodeOrder.length

    nodePositions = new Float32Array(nodeCount * 3)
    nodeColors = new Float32Array(nodeCount * 3)
    nodeVel = new Float32Array(nodeCount * 3)

    primaryPos = new Float32Array(primaryIds.length * 3)
    primaryCol = new Float32Array(primaryIds.length * 3)
    secondaryPos = new Float32Array(secondaryIds.length * 3)
    secondaryCol = new Float32Array(secondaryIds.length * 3)

    pointTexture = createSoftPointTexture()

    const primaryGeo = new BufferGeometry()
    primaryGeo.setAttribute('position', new BufferAttribute(primaryPos, 3))
    primaryGeo.setAttribute('color', new BufferAttribute(primaryCol, 3))
    primaryPoints = new Points(
      primaryGeo,
      new PointsMaterial({
        map: pointTexture,
        size: tier === 'reduced' ? 34 : compact ? 46 : 52,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    root.add(primaryPoints)

    const secondaryGeo = new BufferGeometry()
    secondaryGeo.setAttribute('position', new BufferAttribute(secondaryPos, 3))
    secondaryGeo.setAttribute('color', new BufferAttribute(secondaryCol, 3))
    secondaryPoints = new Points(
      secondaryGeo,
      new PointsMaterial({
        map: pointTexture,
        size: tier === 'reduced' ? 16 : compact ? 20 : 22,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    root.add(secondaryPoints)

    ambientPositions = new Float32Array(ambient * 3)
    ambientBase = new Float32Array(ambient * 3)
    for (let i = 0; i < ambient; i++) {
      // Most in field; a few outliers expand spatial boundary
      const outlier = i % 7 === 0
      const spreadX = outlier ? 1.35 : 1.05
      const spreadY = outlier ? 0.72 : 0.5
      const x = (Math.random() * 2 - 1) * spreadX
      const y = (Math.random() * 2 - 1) * spreadY
      const z = -0.42 - Math.random() * 0.28
      ambientBase[i * 3] = x
      ambientBase[i * 3 + 1] = y
      ambientBase[i * 3 + 2] = z
      ambientPositions[i * 3] = x
      ambientPositions[i * 3 + 1] = y
      ambientPositions[i * 3 + 2] = z
    }
    const ambGeo = new BufferGeometry()
    ambGeo.setAttribute('position', new BufferAttribute(ambientPositions, 3))
    ambientPoints = new Points(
      ambGeo,
      new PointsMaterial({
        map: pointTexture,
        color: COLOR.stream,
        size: compact ? 4.5 : 5.5,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    root.add(ambientPoints)

    const hazeCount = tier === 'reduced' ? 10 : 20
    const hazePos = new Float32Array(hazeCount * 3)
    for (let i = 0; i < hazeCount; i++) {
      hazePos[i * 3] = (Math.random() * 2 - 1) * 1.15
      hazePos[i * 3 + 1] = (Math.random() * 2 - 1) * 0.48
      hazePos[i * 3 + 2] = -0.55 - Math.random() * 0.25
    }
    const hazeGeo = new BufferGeometry()
    hazeGeo.setAttribute('position', new BufferAttribute(hazePos, 3))
    hazePoints = new Points(
      hazeGeo,
      new PointsMaterial({
        map: pointTexture,
        color: COLOR.glacier,
        size: tier === 'reduced' ? 48 : 64,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.055,
        depthWrite: false,
      }),
    )
    root.add(hazePoints)

    for (let i = 0; i < nodeOrder.length; i++) {
      const layout = layoutAt(nodeOrder[i]!, 0)
      nodePositions[i * 3] = layout.position.x
      nodePositions[i * 3 + 1] = layout.position.y
      nodePositions[i * 3 + 2] = layout.position.z
    }

    // ── 电路式指引线（诗云平面坐标式）：每个次级节点 4 顶点 = 平面段 + 垂直段 ──
    guidePositions = new Float32Array(secondaryIds.length * 4 * 3)
    guideColors = new Float32Array(secondaryIds.length * 4 * 3)
    const guideGeo = new BufferGeometry()
    guideGeo.setAttribute('position', new BufferAttribute(guidePositions, 3))
    guideGeo.setAttribute('color', new BufferAttribute(guideColors, 3))
    guideLines = new LineSegments(
      guideGeo,
      new LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    guideLines.frustumCulled = false
    root.add(guideLines)

    // 双核桥连线（两团星之间的弧线，展开后才显现）
    bridgePositions = new Float32Array((BRIDGE_SEGMENTS + 1) * 3)
    bridgeColors = new Float32Array((BRIDGE_SEGMENTS + 1) * 3)
    const bridgeGeo = new BufferGeometry()
    bridgeGeo.setAttribute('position', new BufferAttribute(bridgePositions, 3))
    bridgeGeo.setAttribute('color', new BufferAttribute(bridgeColors, 3))
    bridgeLines = new Line(
      bridgeGeo,
      new LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    bridgeLines.frustumCulled = false
    root.add(bridgeLines)

    // 赤道参考环（诗云：极淡的平面参考环，随平面段一起淡入）
    for (const cid of clusterIds) {
      const ringGeo = new BufferGeometry()
      ringGeo.setAttribute('position', new BufferAttribute(new Float32Array(RING_SEGMENTS * 3), 3))
      const ringMat = new LineBasicMaterial({
        color: COLOR.aurora.clone().multiplyScalar(RING_INTENSITY),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: AdditiveBlending,
      })
      const ring = new LineLoop(ringGeo, ringMat)
      ring.frustumCulled = false
      ringLoops.set(cid, ring)
      root.add(ring)
    }
  }

  // ── 星团时序：grow（平面段→垂直段）+ 闪光渐入 + 收起淡出（诗云同款） ──
  function updateClusters(dt: number) {
    sceneT += dt
    if (reducedMotion) return
    for (const c of clusters.values()) {
      if (c.expanded) {
        const age = Math.max(0, sceneT - c.born)
        c.grow = Math.min(1, age / GUIDE_GROW)
        c.alpha = Math.min(1, age / GUIDE_GROW)
        if (activeClusterId === c.id) c.alpha = 1
        const nodeAge = Math.max(0, age - NODE_REVEAL_DELAY)
        c.nodesAlpha = Math.min(1, nodeAge / NODE_FADE_IN)
        c.flare = nodeAge <= 0
          ? 1
          : Math.max(NODE_HOLD_FLARE, 1 - (1 - NODE_HOLD_FLARE) * (nodeAge / NODE_FADE_IN))
      } else if (c.collapseAt != null) {
        const k = (sceneT - c.collapseAt) / GUIDE_FADE
        if (k >= 1) {
          c.collapseAt = null
          c.alpha = 0
          c.nodesAlpha = 0
          c.grow = 0
          c.flare = 1
        } else {
          c.alpha = 1 - k
          c.nodesAlpha = c.alpha
          c.flare = 1
        }
      }
    }
  }

  // ── 诗云《行星指引》平面坐标式：先向四周发散（平面段），再垂直方向发散（垂直段） ──
  function updateGuides() {
    if (!guidePositions || !guideColors || !guideLines || !nodePositions) return
    const mat = guideLines.material as LineBasicMaterial
    mat.opacity = activeClusterId ? 1 : 0.9
    for (const c of clusters.values()) {
      const env = c.alpha * awaken
      const ci = clusterIds.indexOf(c.id)
      const planeTint = clusterTints.plane[ci] ?? COLOR.glacier
      const vertTint = clusterTints.vert[ci] ?? COLOR.aurora
      const hotCore = focusedHotspot === c.id ? 1.2 : 1
      const planeP = Math.max(0, Math.min(1, c.grow / GUIDE_SPLIT))
      const vertP = Math.max(0, Math.min(1, (c.grow - GUIDE_SPLIT) / (1 - GUIDE_SPLIT)))
      const coreIdx = c.coreIdx * 3
      const cx = nodePositions[coreIdx]!
      const cy = nodePositions[coreIdx + 1]!
      const cz = nodePositions[coreIdx + 2]!
      for (let k = 0; k < c.nodeIdxs.length; k++) {
        const idx = c.nodeIdxs[k]!
        const p = idx * 3
        const ox = nodePositions[p]! - cx
        const oy = nodePositions[p + 1]! - cy
        const oz = nodePositions[p + 2]! - cz
        const hotNode = focusedHotspot === nodeOrder[idx] ? 1.5 : 1
        // The guide geometry is shared by both constellations. Address each
        // secondary by its global buffer index; using the cluster-local `k`
        // made the second cluster overwrite the first cluster's guide lines.
        const guideIndex = secondaryIds.indexOf(nodeOrder[idx]!)
        if (guideIndex < 0) continue
        const v = guideIndex * 12
        // v0 = 核心（平面段起点）
        guidePositions[v] = cx
        guidePositions[v + 1] = cy
        guidePositions[v + 2] = cz
        // v1 = 平面段终点：先向四周发散
        guidePositions[v + 3] = cx + ox * planeP
        guidePositions[v + 4] = cy
        guidePositions[v + 5] = cz + oz * planeP
        // v2 = 折点 H（节点在水平参考面上的投影）——直角折弯，非弧线
        guidePositions[v + 6] = cx + ox
        guidePositions[v + 7] = cy
        guidePositions[v + 8] = cz + oz
        // v3 = 节点：垂直段再向上/下发散
        guidePositions[v + 9] = cx + ox
        guidePositions[v + 10] = cy + oy * vertP
        guidePositions[v + 11] = cz + oz
        const gain = env * hotCore * hotNode
        // 平面段暗（只表达方位/半径），垂直段亮（表达高度信息）——诗云同款亮度分级
        for (let s = 0; s < 2; s++) {
          const tint = s === 0 ? planeTint : vertTint
          const stage = s === 0 ? PLANE_SEG_DIM : VERT_SEG_BRIGHT
          const g = stage * gain
          const base = v + s * 6
          guideColors[base] = tint.r * g
          guideColors[base + 1] = tint.g * g
          guideColors[base + 2] = tint.b * g
          guideColors[base + 3] = tint.r * g
          guideColors[base + 4] = tint.g * g
          guideColors[base + 5] = tint.b * g
        }
      }
    }
    const geo = guideLines.geometry as BufferGeometry
    ;(geo.getAttribute('position') as BufferAttribute).needsUpdate = true
    ;(geo.getAttribute('color') as BufferAttribute).needsUpdate = true
  }

  // 双核桥连线（两团星之间的连接弧线，星团展开后显现）
  function updateBridge() {
    if (!bridgeLines || !bridgePositions || !bridgeColors || !nodePositions) return
    const mat = bridgeLines.material as LineBasicMaterial
    const research = clusters.get('research')
    const agent = clusters.get('agent')
    if (activeClusterId) {
      mat.opacity = 0
      return
    }
    const alpha = Math.max(research?.alpha ?? 0, agent?.alpha ?? 0) * awaken
    if (alpha <= 0.004) {
      mat.opacity = 0
      return
    }
    const t = smoothstep(morph)
    const a = layoutAt('research', t).position
    const b = layoutAt('agent', t).position
    tmpA.set(a.x, a.y, a.z)
    tmpB.set(b.x, b.y, b.z)
    const midX = (tmpA.x + tmpB.x) * 0.5
    const midY = (tmpA.y + tmpB.y) * 0.5
    const bow = midY >= 0 ? 1 : -1
    const lift = 0.14 * bow
    tmpC1.set(
      lerp(tmpA.x, midX, 0.38),
      lerp(tmpA.y, midY, 0.38) + lift,
      lerp(tmpA.z, tmpB.z, 0.35),
    )
    tmpC2.set(
      lerp(midX, tmpB.x, 0.62),
      lerp(midY, tmpB.y, 0.62) + lift * 0.75,
      lerp(tmpA.z, tmpB.z, 0.65),
    )
    for (let s = 0; s <= BRIDGE_SEGMENTS; s++) {
      const tt = s / BRIDGE_SEGMENTS
      bezierPoint(tmpA, tmpC1, tmpC2, tmpB, tt, tmpP)
      const vi = s * 3
      bridgePositions[vi] = tmpP.x
      bridgePositions[vi + 1] = tmpP.y
      bridgePositions[vi + 2] = tmpP.z
      colorMix.copy(COLOR.aurora).lerp(COLOR.sky, tt)
      const gain = (0.4 + 0.45 * Math.sin(Math.PI * tt)) * alpha
      bridgeColors[vi] = colorMix.r * gain
      bridgeColors[vi + 1] = colorMix.g * gain
      bridgeColors[vi + 2] = colorMix.b * gain
    }
    const geo = bridgeLines.geometry as BufferGeometry
    ;(geo.getAttribute('position') as BufferAttribute).needsUpdate = true
    ;(geo.getAttribute('color') as BufferAttribute).needsUpdate = true
    mat.opacity = 1
  }

  // 赤道参考环（诗云：随平面段淡入，极淡，不与连线抢戏）
  function updateRings() {
    const t = smoothstep(morph)
    for (const c of clusters.values()) {
      const ring = ringLoops.get(c.id)
      if (!ring) continue
      const mat = ring.material as LineBasicMaterial
      const appear = Math.min(1, c.grow / GUIDE_SPLIT)
      const alpha = c.alpha * awaken * appear * RING_ALPHA * (focusedHotspot === c.id ? 1.5 : 1)
      if (alpha <= 0.004) {
        mat.opacity = 0
        continue
      }
      const core = layoutAt(c.id, t)
      const attr = ring.geometry.getAttribute('position') as BufferAttribute
      const arr = attr.array as Float32Array
      for (let i = 0; i < RING_SEGMENTS; i++) {
        const a = (i / RING_SEGMENTS) * Math.PI * 2
        arr[i * 3] = core.position.x + Math.cos(a) * c.ringRadius
        arr[i * 3 + 1] = core.position.y
        arr[i * 3 + 2] = core.position.z + Math.sin(a) * c.ringRadius
      }
      attr.needsUpdate = true
      mat.opacity = alpha
    }
  }

  function updateNodes(dt: number) {
    if (
      !nodePositions ||
      !nodeColors ||
      !nodeVel ||
      !primaryPos ||
      !primaryCol ||
      !secondaryPos ||
      !secondaryCol ||
      !primaryPoints ||
      !secondaryPoints
    ) {
      return
    }
    const t = smoothstep(morph)
    const { secondaryVisible, idleStrength } = counts()
    let secondaryShown = 0
    const primaryPositions: number[] = []
    const primaryColors: number[] = []
    const primaryIdsForBuffer: string[] = []
    const secondaryPositions: number[] = []
    const secondaryColors: number[] = []
    const secondaryIdsForBuffer: string[] = []

    pointer.x = lerp(pointer.x, pointer.tx, reducedMotion ? 1 : 0.08)
    pointer.y = lerp(pointer.y, pointer.ty, reducedMotion ? 1 : 0.08)

    for (let i = 0; i < nodeOrder.length; i++) {
      const id = nodeOrder[i]!
      const layout = layoutAt(id, t)
      const isSecondary = layout.role === 'secondary'
      let hide = false
      if (activeClusterId && layout.clusterId !== activeClusterId) hide = true
      if (isSecondary) {
        secondaryShown++
        if (secondaryShown > secondaryVisible) hide = true
      }

      const targetX = layout.position.x
      const targetY = layout.position.y
      const targetZ = layout.position.z
      // The focused overlay uses the immutable layout as its framing source.
      // Keep the active cluster pinned to that source so the inline spring
      // cannot shift it after frameCluster() calculates its viewport center.
      const freezeForFocus = activeClusterId === layout.clusterId
      // Depth layer: foreground responds more to pointer (~1–4px visual)
      const depthT = Math.max(0, Math.min(1, (targetZ + 0.35) / 0.75))

      let ox = 0
      let oy = 0
      if (!reducedMotion && !hide) {
        const layerPx = 0.003 + depthT * 0.009
        ox += pointer.x * layerPx
        oy += pointer.y * layerPx * 0.7

        const dx = targetX - pointer.x * 0.7
        const dy = targetY - pointer.y * 0.45
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
        const influence = Math.max(0, 1 - dist / 0.62) * (0.018 + depthT * 0.012)
        ox += dx * influence
        oy += dy * influence
        const breath =
          Math.sin(pulseT * 0.55 + i * 0.9) * 0.004 * idleStrength * awaken * depthT
        ox += breath
        oy += Math.cos(pulseT * 0.45 + i) * 0.003 * idleStrength * awaken
      }

      const px = targetX + ox
      const py = targetY + oy
      const pz = targetZ
      const ix = i * 3

      if (reducedMotion || hide || freezeForFocus) {
        nodePositions[ix] = targetX
        nodePositions[ix + 1] = targetY
        nodePositions[ix + 2] = targetZ
        nodeVel[ix] = 0
        nodeVel[ix + 1] = 0
        nodeVel[ix + 2] = 0
      } else {
        const forceX = (px - nodePositions[ix]!) * 7.5
        const forceY = (py - nodePositions[ix + 1]!) * 7.5
        const forceZ = (pz - nodePositions[ix + 2]!) * 7.5
        nodeVel[ix] = (nodeVel[ix]! + forceX * dt) * 0.88
        nodeVel[ix + 1] = (nodeVel[ix + 1]! + forceY * dt) * 0.88
        nodeVel[ix + 2] = (nodeVel[ix + 2]! + forceZ * dt) * 0.88
        nodePositions[ix] += nodeVel[ix]! * dt
        nodePositions[ix + 1] += nodeVel[ix + 1]! * dt
        nodePositions[ix + 2] += nodeVel[ix + 2]! * dt
      }

      const hot = focusedHotspot === id
      // Soft luminous Aurora/Glacier — no dark electronic core
      colorA.copy(COLOR.snow).lerp(COLOR.glacier, 0.35)
      colorB.copy(COLOR.aurora).lerp(COLOR.stream, hot ? 0.15 : 0.35)
      colorMix.copy(colorA).lerp(colorB, layout.role === 'primary' ? 0.55 : 0.35)
      if (hot) colorMix.lerp(COLOR.sky, 0.12)
      // Keep RGB high so additive sprites stay luminous, not charcoal
      colorMix.lerp(COLOR.snow, 0.22)
      const depthFade = 0.62 + depthT * 0.38
      let alpha = hide ? 0 : layout.opacity * awaken * depthFade * (hot ? 1 : 0.9)
      // Point draw ranges are contiguous while primary vertices are interleaved
      // before every secondary. Explicitly black the inactive cluster so an
      // isolated full-screen view can never leak the opposite core.
      if (activeClusterId && layout.clusterId !== activeClusterId) alpha = 0
      let flareGain = 1
      if (layout.role === 'secondary') {
        // 未展开的星团：星点完全隐藏；展开时闪光渐入（诗云 FADE_IN + HOLD_FLARE）
        const cl = nodeClusterById.get(id)
        const nodeAlpha = cl ? cl.nodesAlpha : 0
        alpha *= nodeAlpha
        if (activeClusterId && layout.clusterId === activeClusterId) {
          alpha = Math.max(alpha, nodeAlpha * 0.9)
        }
        if (nodeAlpha > 0.004 && cl) flareGain = 1 + cl.flare * 1.2
      }
      const twinkle = 0.82 + Math.sin(pulseT * (1.9 + (i % 4) * 0.27) + i * 1.7) * 0.18
      // PointsMaterial has a single material opacity, so encode per-node
      // visibility in vertex brightness. A fully collapsed secondary must be
      // black rather than merely dim, otherwise additive blending still shows it.
      const gain = alpha <= 0.004
        ? 0
        : (0.85 + alpha * 0.35) * twinkle * flareGain
      nodeColors[ix] = Math.min(1, colorMix.r * gain)
      nodeColors[ix + 1] = Math.min(1, colorMix.g * gain)
      nodeColors[ix + 2] = Math.min(1, colorMix.b * gain)

      const positions = layout.role === 'primary' ? primaryPositions : secondaryPositions
      const colors = layout.role === 'primary' ? primaryColors : secondaryColors
      const ids = layout.role === 'primary' ? primaryIdsForBuffer : secondaryIdsForBuffer
      positions.push(
        nodePositions[ix]!,
        nodePositions[ix + 1]!,
        nodePositions[ix + 2]!,
      )
      colors.push(nodeColors[ix]!, nodeColors[ix + 1]!, nodeColors[ix + 2]!)
      ids.push(id)
    }

    // BufferGeometry draw ranges are contiguous. Repack the active cluster at
    // the front of each buffer so focused mode submits exactly one core and its
    // children instead of relying on invisible vertices in the other cluster.
    const writePointBuffer = (
      positions: number[],
      colors: number[],
      nodeIds: string[],
      sourcePositions: Float32Array,
      sourceColors: Float32Array,
      activeId: IntelligenceClusterId | null,
    ) => {
      let target = 0
      for (let index = 0; index < positions.length / 3; index++) {
        const offset = index * 3
        const layout = layoutAt(nodeIds[index]!, t)
        if (activeId && layout.clusterId !== activeId) continue
        sourcePositions[target] = positions[offset]!
        sourcePositions[target + 1] = positions[offset + 1]!
        sourcePositions[target + 2] = positions[offset + 2]!
        sourceColors[target] = colors[offset]!
        sourceColors[target + 1] = colors[offset + 1]!
        sourceColors[target + 2] = colors[offset + 2]!
        target += 3
      }
      return target / 3
    }
    const activePrimaryCount = writePointBuffer(
      primaryPositions,
      primaryColors,
      primaryIdsForBuffer,
      primaryPos,
      primaryCol,
      activeClusterId,
    )
    const activeSecondaryCount = writePointBuffer(
      secondaryPositions,
      secondaryColors,
      secondaryIdsForBuffer,
      secondaryPos,
      secondaryCol,
      activeClusterId,
    )

    if (!reducedMotion && morph < 0.45 && awaken > 0.7) {
      pulseT += dt
    } else if (!reducedMotion) {
      pulseT += dt * 0.35
    }

    const pGeo = primaryPoints.geometry as BufferGeometry
    ;(pGeo.getAttribute('position') as BufferAttribute).needsUpdate = true
    ;(pGeo.getAttribute('color') as BufferAttribute).needsUpdate = true
    const sGeo = secondaryPoints.geometry as BufferGeometry
    ;(sGeo.getAttribute('position') as BufferAttribute).needsUpdate = true
    ;(sGeo.getAttribute('color') as BufferAttribute).needsUpdate = true

    // Secondary draw ranges establish the collapsed default. The focused
    // buffers have just been packed to a contiguous selected-cluster prefix.
    if (activeClusterId) {
      const cluster = clusters.get(activeClusterId)
      pGeo.setDrawRange(0, activePrimaryCount)
      sGeo.setDrawRange(
        0,
        cluster && cluster.nodesAlpha > 0.004 ? activeSecondaryCount : 0,
      )
    } else {
      pGeo.setDrawRange(0, activePrimaryCount)
      sGeo.setDrawRange(0, 0)
    }
    ;(primaryPoints.material as PointsMaterial).opacity = 0.7 + awaken * 0.28
    ;(primaryPoints.material as PointsMaterial).size = tier === 'reduced' ? 34 : compact ? 46 : 52
    ;(secondaryPoints.material as PointsMaterial).opacity = 0.32 + awaken * 0.36
    ;(secondaryPoints.material as PointsMaterial).size = tier === 'reduced' ? 16 : compact ? 20 : 22
  }

  function updateAmbient(dt: number) {
    if (!ambientPositions || !ambientBase || !ambientPoints) return
    const { idleStrength } = counts()
    const n = ambientBase.length / 3
    for (let i = 0; i < n; i++) {
      const ix = i * 3
      if (reducedMotion) {
        ambientPositions[ix] = ambientBase[ix]!
        ambientPositions[ix + 1] = ambientBase[ix + 1]!
        ambientPositions[ix + 2] = ambientBase[ix + 2]!
        continue
      }
      const drift = pulseT * (0.04 + (i % 5) * 0.008) * idleStrength
      // Background layer — weaker parallax than foreground nodes
      ambientPositions[ix] =
        ambientBase[ix]! + Math.sin(drift + i) * 0.015 + pointer.x * 0.004
      ambientPositions[ix + 1] =
        ambientBase[ix + 1]! + Math.cos(drift * 0.8 + i) * 0.012 + pointer.y * 0.003
      ambientPositions[ix + 2] = ambientBase[ix + 2]!
    }
    ;(ambientPoints.geometry.getAttribute('position') as BufferAttribute).needsUpdate =
      true
    // The focused presentation is an isolated constellation, not the inline
    // field atmosphere. Hide ambient sprites so they cannot resemble a second core.
    ;(ambientPoints.material as PointsMaterial).opacity = activeClusterId
      ? 0
      : 0.08 + awaken * 0.18
    if (hazePoints) {
      ;(hazePoints.material as PointsMaterial).opacity = activeClusterId ? 0 : 0.055
    }
    void dt
  }

  /**
   * 透视取景。
   *
   * 设计：可见高度由 viewH * focus.scale 唯一决定，相机距离由轨道半径决定，
   * FOV 再由此二者反解 —— 三者必须满足 visibleH = 2 * radius * tan(fov/2)。
   *
   * 旧实现把 FOV 也 clamp 到 [FOV_MIN, FOV_MAX]，当 flyTo 把半径压到
   * RADIUS_MIN 时 clamp 生效，等式被破坏，实际可见高度远大于期望值，
   * 星团因此缩成一小团「跑到一旁」。这里去掉 FOV 的硬 clamp，
   * 改为只 clamp 半径，让等式恒成立。
   */
  function updateCameraProjection() {
    if (!camera) return
    const aspect = width / Math.max(height, 1)
    const r = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, orbit.radius))
    if (projectionScale === focus.scale && projectionAspect === aspect) return
    camera.aspect = aspect
    // 可见高度（世界单位）= 基础取景高度 * scale。
    // scale 的语义是「相对全场景取景的放大倍数」，>1 表示推近看局部。
    const visibleH = Math.max(viewH * focus.scale, 0.001)
    // 由 visibleH = 2 * r * tan(fov/2) 反解 fov，保证取景尺度与 scale 严格对应
    const fovRad = 2 * Math.atan(visibleH * 0.5 / Math.max(r, 0.001))
    camera.fov = Math.min(179, Math.max(1, (fovRad * 180) / Math.PI))
    camera.updateProjectionMatrix()
    projectionScale = focus.scale
    projectionAspect = aspect
  }

  /**
   * 把当前轨道参数写入相机。
   *
   * 关键点：这里【不再】把 root.rotation 归零。旧实现在聚焦时刻意将
   * rotationX/Y 强制为 0（`activeClusterId ? 0 : rotationX`），
   * 这正是「点了星团就变成平面」的直接原因 —— 3D 被压成了正面平视。
   * 现在旋转完全由相机轨道承担，root 只做模式位移，几何始终保持立体。
   */
  function updateCamera() {
    if (!camera || !root) return
    updateCameraProjection()

    // root 保持单位姿态：立体感来自相机绕行，而非几何旋转，
    // 这样投影/拾取的数学与渲染始终一致。
    root.position.set(0, 0, 0)
    root.rotation.set(0, 0, 0)
    // 模式切换的轻微位移保留，作为双星团之间的呼吸感
    root.position.x += (morph - 0.5) * 0.04

    if (reducedMotion) {
      // Reduced Motion：锁定为稳定的三分之四视角，不做任何运动
      orbit.phi = Math.PI * 0.46
      orbit.theta = -0.42
      orbit.vTheta = 0
      orbit.vPhi = 0
    } else {
      updateMomentum()
      // 指针视差：极轻微地推近/偏移，制造深度呼吸；不影响轨道本身
      cameraParallax.x = lerp(cameraParallax.x, pointer.x * 0.012, 0.05)
      cameraParallax.y = lerp(cameraParallax.y, pointer.y * 0.008, 0.05)
    }

    const sinPhi = Math.sin(orbit.phi)
    const r = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, orbit.radius))
    // 视线中心 = 取景目标 + 用户平移偏移
    const cx = orbit.tx + panOffset.x
    const cy = orbit.ty + panOffset.y
    const cz = orbit.tz + panOffset.z
    const px = cx + r * sinPhi * Math.sin(orbit.theta) + cameraParallax.x
    const py = cy + r * Math.cos(orbit.phi) + cameraParallax.y
    const pz = cz + r * sinPhi * Math.cos(orbit.theta)
    camera.position.set(px, py, pz)
    camera.lookAt(cx, cy, cz)
  }

  /**
   * 惯性阻尼：松手后动量按 index 衰减继续推进轨道与平移。
   * 之所以放在渲染循环里而非独立 tween，是为了让它与指针视差、
   * 模式补间共用同一个时间基准，避免多套动画互相打架。
   */
  function updateMomentum() {
    if (!momentumActive) return
    const DECAY = 0.92
    const EPS = 0.00035
    orbit.theta += orbit.vTheta
    orbit.phi = Math.max(0.16, Math.min(Math.PI - 0.16, orbit.phi + orbit.vPhi))
    // 平移动量累加到 panOffset（用户偏移），不触碰取景目标
    panOffset.x += orbit.vPanX
    panOffset.y += orbit.vPanY
    orbit.vTheta *= DECAY
    orbit.vPhi *= DECAY
    orbit.vPanX *= DECAY
    orbit.vPanY *= DECAY
    if (
      Math.abs(orbit.vTheta) < EPS &&
      Math.abs(orbit.vPhi) < EPS &&
      Math.abs(orbit.vPanX) < EPS &&
      Math.abs(orbit.vPanY) < EPS
    ) {
      orbit.vTheta = 0
      orbit.vPhi = 0
      orbit.vPanX = 0
      orbit.vPanY = 0
      momentumActive = false
    }
  }

  function renderFrame(dt: number) {
    if (!renderer || !scene || !camera) return
    updateClusters(dt)
    updateNodes(dt)
    updateGuides()
    updateBridge()
    updateRings()
    updateAmbient(dt)
    updateCamera()
    renderer.render(scene, camera)
  }

  function tick(now: number) {
    raf = 0
    if (!shouldLoop()) return
    const dt = Math.min(0.033, (now - lastTime) / 1000)
    lastTime = now
    renderFrame(dt)
    if (shouldLoop()) raf = requestAnimationFrame(tick)
  }

  function applySize(w: number, h: number) {
    width = Math.max(1, w)
    height = Math.max(1, h)
    const next = layoutsForViewport(width)
    compact = next.compact
    syncLayoutMaps()
    // Aggressive framing: field fills ~60–75% width without CSS scale
    const aspect = width / height
    if (compact) {
      viewH = aspect > 1.1 ? 0.68 : 0.74
    } else if (width < 1100) {
      viewH = 0.78
    } else {
      viewH = aspect > 2.0 ? 0.72 : 0.78
    }
    if (!renderer || !camera) return
    renderer.setPixelRatio(maxDpr())
    renderer.setSize(width, height, false)
    projectionScale = -1
    projectionAspect = -1
    updateCameraProjection()
    // 尺寸变化会改变 viewH，进而改变取景所需 scale。
    // 必须重新取景，否则首帧（mount 时尺寸尚为 1x1）算出的 scale 会一直沿用，
    // 表现为首页星图被裁成一个小点。
    if (!activeClusterId && !disposed && surfaceReady) {
      frameView(0)
    }
  }

  function mount(target: HTMLElement) {
    if (disposed) return
    if (!detectWebGL()) {
      options.onError?.(new Error('WebGL unavailable'))
      return
    }

    container = target
    scene = new Scene()
    scene.background = null

    camera = new PerspectiveCamera(45, 1, 0.05, 100)
    camera.position.set(0, 0, 3)
    camera.lookAt(0, 0, 0)

    root = new Group()
    scene.add(root)

    try {
      renderer = new WebGLRenderer({
        antialias: tier !== 'reduced',
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (err) {
      options.onError?.(err instanceof Error ? err : new Error(String(err)))
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false)
    document.addEventListener('visibilitychange', onVisibility)

    buildGeometries()
    applySize(container.clientWidth, container.clientHeight)
    // 几何与尺寸就绪：此后 applySize 可以安全地重新取景
    surfaceReady = true
    frameView(0)
    renderFrame(0.016)
    options.onReady?.()

    if (!reducedMotion) {
      awakenTween?.kill()
      awakenTween = gsap.to(
        { v: awaken },
        {
          v: 1,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate() {
            awaken = (this.targets()[0] as { v: number }).v
            if (!raf) renderFrame(0.016)
          },
          onComplete() {
            awakenTween = null
            ensureLoop()
          },
        },
      )
    } else {
      awaken = 1
      renderFrame(0)
    }
  }

  function setMode(next: IntelligenceMode, expandForMode = false) {
    if (disposed) return
    if (next === mode) {
      // 同一视角重复触发：确保对应星团展开
      if (expandForMode) {
        const target = clusters.get(next === 'build' ? 'research' : 'agent')
        if (target && !target.expanded) {
          expandCluster(target)
          frameView()
        }
      }
      return
    }
    mode = next
    focusedHotspot = null
    const targetMorph = next === 'understand' ? 1 : 0
    modeTween?.kill()

    if (reducedMotion) {
      morph = targetMorph
      modeTween = null
    } else {
      modeTween = gsap.to(
        { v: morph },
        {
          v: targetMorph,
          duration: 0.9,
          ease: 'power2.inOut',
          overwrite: true,
          onUpdate() {
            morph = (this.targets()[0] as { v: number }).v
            ensureLoop()
          },
          onComplete() {
            morph = targetMorph
            modeTween = null
          },
        },
      )
    }

    // 切换视角只保留当前路径的星团，避免两个星团在切换后同时常驻展开。
    if (expandForMode) {
      const targetId = next === 'build' ? 'research' : 'agent'
      const cluster = clusters.get(targetId)
      for (const candidate of clusters.values()) {
        if (candidate.id !== targetId) collapseCluster(candidate)
      }
      if (cluster) {
        expandCluster(cluster)
        flyToNode(cluster.id, 0.62)
      }
    }

    options.onHotspotChange?.(null)
    ensureLoop()
  }

  function setPointer(nx: number, ny: number) {
    pointer.tx = Math.max(-1, Math.min(1, nx))
    pointer.ty = Math.max(-1, Math.min(1, ny))
    if (!reducedMotion) ensureLoop()
  }

  /** 滚轮缩放：正值拉远（可见范围变大），负值靠近。 */
  function zoomBy(delta: number) {
    if (disposed || !Number.isFinite(delta) || delta === 0) return
    // 缩放的唯一真源是 focus.scale（= 可见高度的倍数）。
    // 不去动 radius：那里若也参与取景，就会与 FOV 反解互相抵消，
    // 出现「滚轮没反应」或「越滚越远」的怪象。
    const targetScale = Math.max(
      MIN_VIEW_SCALE,
      Math.min(MAX_VIEW_SCALE, focus.scale * Math.exp(-delta * WHEEL_ZOOM_FACTOR)),
    )
    if (Math.abs(targetScale - focus.scale) < 0.0001) return
    focusTween?.kill()
    focusTween = null
    focus.scale = targetScale
    orbit.radius = Math.max(
      RADIUS_MIN,
      Math.min(RADIUS_MAX, radiusForScale(targetScale)),
    )
    projectionScale = -1
    renderFrame(0)
    ensureLoop()
  }

  /** 取景 = 设定相机到球心距离；透视下由 radius 决定可见范围。 */
  function flyTo(scale: number, x: number, y: number, duration = 0.95, z?: number) {
    if (disposed) return
    focusTween?.kill()
    focusTween = null
    // 半径固定在中距离，取景完全由 focus.scale 通过 FOV 控制 ——
    // 半径若也随 scale 变化，会与 FOV 反解相互抵消，导致缩放失灵。
    const targetRadius = Math.max(
      RADIUS_MIN,
      Math.min(RADIUS_MAX, radiusForScale(1)),
    )
    const targetTx = orbit.tx
    const targetTy = orbit.ty
    const targetTz = z === undefined ? orbit.tz : z
    if (reducedMotion || duration === 0) {
      focus.scale = scale
      focus.x = x
      focus.y = y
      orbit.radius = targetRadius
      orbit.tx = x
      orbit.ty = y
      orbit.tz = targetTz
      projectionScale = -1
      renderFrame(0)
      return
    }
    const from = {
      scale: focus.scale,
      x: focus.x,
      y: focus.y,
      radius: orbit.radius,
      tx: orbit.tx,
      ty: orbit.ty,
      tz: orbit.tz,
    }
    const to = {
      scale,
      x,
      y,
      radius: targetRadius,
      tx: targetTx,
      ty: targetTy,
      tz: targetTz,
    }
    focus.scale = scale
    focus.x = x
    focus.y = y
    projectionScale = -1
    renderFrame(0)
    focus.scale = from.scale
    focus.x = from.x
    focus.y = from.y
    orbit.radius = from.radius
    orbit.tx = from.tx
    orbit.ty = from.ty
    orbit.tz = from.tz
    projectionScale = -1
    focusTween = gsap.to(from, {
      ...to,
      duration,
      ease: 'power2.inOut',
      overwrite: true,
      onUpdate() {
        focus.scale = from.scale
        focus.x = from.x
        focus.y = from.y
        orbit.radius = from.radius
        orbit.tx = from.tx
        orbit.ty = from.ty
        orbit.tz = from.tz
        projectionScale = -1
        ensureLoop()
      },
      onComplete() {
        focusTween = null
      },
    })
    ensureLoop()
  }

  /**
   * 把某个节点居中到画面。
   *
   * 在轨道相机下，节点投影位置取决于相机方位，因此不能像旧版那样只取
   * 世界坐标取负。这里把节点投影到「相机右向量 / 上向量」张成的屏幕平面上，
   * 求出它在屏幕空间相对视线中心的偏移量，再反向平移 target 抵消该偏移。
   */
  function flyToNode(id: string, scale: number, duration = 0.95) {
    const idx = nodeOrder.indexOf(id)
    if (!nodePositions) return
    if (idx < 0) return
    const nx = nodePositions[idx * 3]!
    const ny = nodePositions[idx * 3 + 1]!
    const nz = nodePositions[idx * 3 + 2]!

    // 相机基向量：与 panBy 保持一致，确保平移方向与画面视觉方向对齐
    const cosPhi = Math.cos(orbit.phi)
    const sinPhi = Math.sin(orbit.phi)
    const cosT = Math.cos(orbit.theta)
    const sinT = Math.sin(orbit.theta)
    const rightX = cosT
    const rightY = 0
    const rightZ = -sinT
    const upX = -cosPhi * sinT
    const upY = sinPhi
    const upZ = -cosPhi * cosT

    // 节点相对当前视线中心的偏移，在屏幕平面上的两个分量
    const dx = nx - orbit.tx
    const dy = ny - orbit.ty
    const dz = nz - orbit.tz
    const offRight = dx * rightX + dy * rightY + dz * rightZ
    const offUp = dx * upX + dy * upY + dz * upZ

    flyTo(scale, orbit.tx + offRight, orbit.ty + offUp, duration)
  }

  /**
   * 内联全场景取景：把「两个星团 + 中间桥」整体放进视口。
   *
   * 不能再像旧版那样硬编码 scale=1 —— 透视化之后可见高度 = viewH * scale，
   * 而双星团在 X 方向跨度约 1.9 世界单位，scale=1 只能看到 0.78 单位，
   * 结果是首页星图被裁到几乎不可见。这里按实际布局跨度反算 scale。
   */
  function frameView(duration = 0.95) {
    let anyExpanded = false
    for (const c of clusters.values()) if (c.expanded) anyExpanded = true

    // 取两个核心 + 各自节点的整体包围盒（模式下切换到当前布局）
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const t = smoothstep(morph)
    // 始终把全部节点（含未展开星团的成员）纳入包围盒：
    // 未展开的星团节点仍然以暗淡光点常驻显示，若把它们排除，
    // 取景会过近，边缘星点会被裁到视口之外。
    for (const node of (morph < 0.5 ? activeBuild() : activeUnderstand()).nodes) {
      const p = layoutAt(node.id, t).position
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    }
    if (!Number.isFinite(minX)) {
      flyTo(anyExpanded ? 0.85 : 1, 0, 0, duration)
      return
    }
    const halfW = Math.max(0.001, (maxX - minX) * 0.5)
    const halfH = Math.max(0.001, (maxY - minY) * 0.5)
    const aspect = width / Math.max(height, 1)
    // padding 决定星团相对视口的占比。
    // 双核间距为 1.44 世界单位（-0.72 / +0.72），但要给「核心 → 外围节点」
    // 的整团跨度留位置，因此按完整包围盒（含外围节点）取景。
    // 系数偏大一点（1.45）让星团不要顶到视口边缘 —— 顶边会削弱
    // 「两团星 + 中间桥」的构图，也让核心点难以点击。
    const padding = anyExpanded ? 1.35 : 1.45
    const scale = Math.max(
      0.35,
      Math.min(
        24,
        Math.max(
          (2 * halfH * padding) / Math.max(viewH, 0.001),
          (2 * halfW * padding) / Math.max(viewH * aspect, 0.001),
        ),
      ),
    )
    const cx = (minX + maxX) * 0.5
    const cy = (minY + maxY) * 0.5
    const cz = 0.33
    flyTo(scale, cx, cy, duration, cz)
  }

  /**
   * 为单个星团取景：把该星团在【相机屏幕平面】上的包围盒映射到视口。
   *
   * 旧版直接把世界坐标当作屏幕坐标（focusRotation 恒为 0），在相机固定
   * 正视时勉强成立；一旦相机可在轨道上自由移动，该假设失效。这里改为
   * 用当前相机的 right / up 基向量把节点投影到屏幕平面求包围盒，
   * 因此任意视角下取景都正确。
   */
  function frameCluster(cluster: ClusterState, duration = 0.95) {
    if (!nodePositions || !camera) return
    const points = [cluster.coreIdx, ...cluster.nodeIdxs]
    // The node spring positions were calculated in the smaller inline field.
    // Snap the selected cluster to its layout before measuring overlay bounds.
    for (const idx of points) {
      const node = layoutAt(nodeOrder[idx]!, smoothstep(morph))
      nodePositions[idx * 3] = node.position.x
      nodePositions[idx * 3 + 1] = node.position.y
      nodePositions[idx * 3 + 2] = node.position.z
      nodeVel?.fill(0, idx * 3, idx * 3 + 3)
    }

    // 相机屏幕平面基向量（与 panBy / flyToNode 使用同一套定义）
    const cosPhi = Math.cos(orbit.phi)
    const sinPhi = Math.sin(orbit.phi)
    const cosT = Math.cos(orbit.theta)
    const sinT = Math.sin(orbit.theta)
    const rightX = cosT
    const rightZ = -sinT
    const upX = -cosPhi * sinT
    const upY = sinPhi
    const upZ = -cosPhi * cosT
    // 视线方向（用于剔除深度，避免把背面的节点算进包围盒导致取景过远）
    const fwdX = sinPhi * sinT
    const fwdY = cosPhi
    const fwdZ = sinPhi * cosT

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    // 先求星团在世界坐标中的真实中心，围绕它度量跨度。
    // 若以 orbit.tx/ty 为原点，一旦相机已被平移过，包围盒就会含入
    // 中心到星团的偏移量，算出的跨度虚大 → 取景过远 → 星团缩成小点。
    const pts = points.map((idx) => layoutAt(nodeOrder[idx]!, smoothstep(morph)).position)
    let cxs = 0
    let cys = 0
    let czs = 0
    for (const p of pts) {
      cxs += p.x
      cys += p.y
      czs += p.z
    }
    const n = Math.max(pts.length, 1)
    const ccx = cxs / n
    const ccy = cys / n
    const ccz = czs / n

    for (const p of pts) {
      const dx = p.x - ccx
      const dy = p.y - ccy
      const dz = p.z - ccz
      const sx = dx * rightX + dz * rightZ
      const sy = dx * upX + dy * upY + dz * upZ
      // 深度加权：背向相机的节点在透视下更小，按比例折算到屏幕跨度
      const depth = dx * fwdX + dy * fwdY + dz * fwdZ
      const persp = orbit.radius / Math.max(orbit.radius + depth, orbit.radius * 0.35)
      minX = Math.min(minX, sx * persp)
      maxX = Math.max(maxX, sx * persp)
      minY = Math.min(minY, sy * persp)
      maxY = Math.max(maxY, sy * persp)
    }
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return

    const halfWidth = Math.max(0.001, (maxX - minX) * 0.5)
    const halfHeight = Math.max(0.001, (maxY - minY) * 0.5)
    const aspect = width / Math.max(height, 1)
    const padding = 1.35
    // scale 语义 = 放大倍数：可见高度 = viewH * scale。
    // 要让半高 halfHeight 恰好落在可见半高的 1/padding 处：
    //   viewH * scale * 0.5 = halfHeight * padding  →  scale = 2*halfHeight*padding/viewH
    // 宽度方向同理再除以 aspect。取两者较大值（更保守 = 更远）。
    const neededScale = Math.max(
      (2 * halfHeight * padding) / Math.max(viewH, 0.001),
      (2 * halfWidth * padding) / Math.max(viewH * aspect, 0.001),
    )
    // 上限放宽到 24，否则小尺度星团（跨度仅约 0.3 世界单位）无法被推近到铺满视口
    const scale = Math.max(0.35, Math.min(24, neededScale))
    // 视线中心落在星团质心上（世界坐标）。panOffset 由 updateCamera 叠加，
    // 因此这里只给取景目标，不需要把用户偏移算进来。
    flyTo(scale, ccx, ccy, duration, ccz)
  }

  function expandCluster(cluster: ClusterState) {
    if (cluster.expanded) return
    cluster.expanded = true
    cluster.born = sceneT
    cluster.collapseAt = null
    // 赤道参考环半径 = 星团的水平延展（诗云：maxHoriz → ring）
    const core = layoutAt(cluster.id, smoothstep(morph))
    let maxH = 0.14
    for (const idx of cluster.nodeIdxs) {
      const n = layoutAt(nodeOrder[idx]!, smoothstep(morph))
      maxH = Math.max(maxH, Math.hypot(n.position.x - core.position.x, n.position.z - core.position.z))
    }
    cluster.ringRadius = maxH * 1.08
    if (reducedMotion) {
      cluster.grow = 1
      cluster.alpha = 1
      cluster.nodesAlpha = 1
      cluster.flare = NODE_HOLD_FLARE
      renderFrame(0)
    }
    ensureLoop()
  }

  function collapseCluster(cluster: ClusterState) {
    if (!cluster.expanded) return
    cluster.expanded = false
    if (reducedMotion) {
      cluster.alpha = 0
      cluster.nodesAlpha = 0
      cluster.grow = 0
      cluster.flare = 1
      cluster.collapseAt = null
      renderFrame(0)
      return
    }
    cluster.collapseAt = sceneT
    ensureLoop()
  }

  function pick(nx: number, ny: number): { info: HotspotInfo; isPrimary: boolean } | null {
    if (!nodePositions || !camera) return null
    let best: { info: HotspotInfo; isPrimary: boolean } | null = null
    let bestDist = Infinity
    const source = morph < 0.5 ? activeBuild() : activeUnderstand()
    const m: IntelligenceMode = morph < 0.5 ? 'build' : 'understand'
    for (const n of source.nodes) {
      if (activeClusterId && n.clusterId !== activeClusterId) continue
      const isPrimary = n.role === 'primary'
      if (!isPrimary) {
        // 只有已展开（闪光渐入过半）的星团里的星点可被点选
        const cl = nodeClusterById.get(n.id)
        if (!cl || cl.alpha < 0.55) continue
      }
      const projected = projectNode(n.id)
      if (!projected) continue
      const px = (projected.x / width) * 2 - 1
      const py = -((projected.y / height) * 2 - 1)
      const distance = Math.hypot(px - nx, py - ny)
      const threshold = isPrimary ? 0.09 : 0.055
      if (distance < threshold && distance < bestDist) {
        bestDist = distance
        best = {
          info: toHotspotInfo(n, m),
          isPrimary,
        }
      }
    }
    return best
  }

  function hoverAt(nx: number, ny: number) {
    if (disposed) return
    const hit = pick(nx, ny)
    const nextId = hit?.info.id ?? null
    if (nextId === hoveredId) return
    hoveredId = nextId
    if (container) container.style.cursor = hoveredId ? 'pointer' : 'grab'
    options.onHoverChange?.(hit?.info ?? null)
  }

  function selectAt(nx: number, ny: number) {
    if (disposed) return
    const hit = pick(nx, ny)
    if (!hit) {
      // 点击空白：取消节点选中。
      // 关键修正：在全屏星团视图（activeClusterId 非空）下【不能】调用
      // frameView() —— 那是按整个双星团布局取景的，会让当前星团缩到一旁。
      // 聚焦态下只清除节点高亮，保持星团聚光灯构图不变。
      focusedHotspot = null
      options.onHotspotChange?.(null)
      if (activeClusterId) {
        const active = clusters.get(activeClusterId)
        if (active) frameCluster(active)
      } else {
        frameView()
      }
      ensureLoop()
      return
    }

    if (hit.isPrimary) {
      if (activeClusterId) {
        // 已在星团视图内：核心节点也应当可查看释义（此前这里直接 return，
        // 导致点核心点没有任何反馈，tooltip 永远不出现）。
        focusedHotspot = hit.info.id
        options.onHotspotChange?.(hit.info)
      } else {
        // 内联视图：点击核心 → 进入该星团
        options.onClusterActivate?.(hit.info.clusterId)
        return
      }
    } else {
      // 点击小节点 → 选中并展示释义，同时轻微推近
      focusedHotspot = hit.info.id
      options.onHotspotChange?.(hit.info)
      // 星团视图内已处于推近状态，不再重复飞行，避免视角被打断
      if (!activeClusterId) flyToNode(hit.info.id, 0.5)
    }
    ensureLoop()
  }

  /**
   * 按 id 精确选中并飞向节点。供 tooltip 的关联节点跳转使用 ——
   * 关联跳转必须命中，不依赖节点是否恰好落在拾取半径内。
   */
  function selectNodeById(id: string) {
    if (disposed) return
    const source = morph < 0.5 ? activeBuild() : activeUnderstand()
    const m: IntelligenceMode = morph < 0.5 ? 'build' : 'understand'
    const target = source.nodes.find((n) => n.id === id)
    if (!target) return
    focusedHotspot = id
    options.onHotspotChange?.(toHotspotInfo(target, m))
    flyToNode(id, target.role === 'primary' ? 0.6 : 0.5)
    ensureLoop()
  }

  function clearSelection() {
    focusedHotspot = null
    options.onHotspotChange?.(null)
    frameView()
    ensureLoop()
  }

  function enterClusterFocus(clusterId: IntelligenceClusterId) {
    if (disposed) return
    const isNewFocus = activeClusterId !== clusterId
    activeClusterId = clusterId
    visible = true
    focusedHotspot = clusterId
    hoveredId = null
    for (const cluster of clusters.values()) {
      if (cluster.id === clusterId) {
        if (isNewFocus) {
          cluster.expanded = false
          cluster.alpha = 0
          cluster.nodesAlpha = 0
          cluster.grow = 0
        }
        expandCluster(cluster)
      } else {
        cluster.expanded = false
        cluster.alpha = 0
        cluster.nodesAlpha = 0
        cluster.grow = 0
        cluster.flare = 1
        cluster.collapseAt = null
      }
    }
    options.onHoverChange?.(null)
    options.onHotspotChange?.(null)
    // 进入星团时重置用户平移，保证初始构图一定居中（否则沿用上次的偏移）
    panOffset.x = 0
    panOffset.y = 0
    panOffset.z = 0
    orbit.vPanX = 0
    orbit.vPanY = 0
    const active = clusters.get(clusterId)
    if (active) frameCluster(active, 0)
    // `frameCluster()` updates the focus target. Render synchronously only
    // after that target is committed so the Teleport overlay never flashes an
    // inline-camera frame before its RAF continues the reveal.
    renderFrame(0)
    ensureLoop()
  }

  function exitClusterFocus() {
    if (disposed) return
    activeClusterId = null
    focusedHotspot = null
    hoveredId = null
    panOffset.x = 0
    panOffset.y = 0
    panOffset.z = 0
    orbit.vPanX = 0
    orbit.vPanY = 0
    for (const cluster of clusters.values()) collapseCluster(cluster)
    options.onHoverChange?.(null)
    options.onHotspotChange?.(null)
    // 关键修正：旧实现立刻 frameView() 把镜头拉回全景，收缩动画被镜头切换
    // 覆盖，观感等同于「节点直接消失」。现在让收缩动画先跑完再回到全景取景，
    // 使退出与进入形成对称的可感知过程。
    if (reducedMotion) {
      frameView(0)
    } else {
      collapseViewTimer?.kill()
      collapseViewTimer = gsap.delayedCall(GUIDE_FADE, () => {
        collapseViewTimer = null
        if (!disposed && !activeClusterId) frameView(0.95)
      })
    }
    ensureLoop()
  }

  /**
   * 左键拖动 → 相机绕球面公转（真正的 3D 视角移动）。
   * 注意：这里改的是轨道角度，不是 root 的旋转 —— 前者改变观察方向，
   * 后者只是转动物体，透视关系完全不同。
   */
  function rotateBy(dx: number, dy: number) {
    if (reducedMotion) return
    const dTheta = dx * 1.35
    const dPhi = dy * 1.1
    orbit.theta += dTheta
    orbit.phi = Math.max(0.16, Math.min(Math.PI - 0.16, orbit.phi + dPhi))
    // 记录动量，供松手后惯性衰减
    orbit.vTheta = dTheta
    orbit.vPhi = dPhi
    momentumActive = true
    ensureLoop()
  }

  /**
   * 中键 / 右键拖动 → 沿相机屏幕平面平移视线中心（3D 漫游平移）。
   *
   * 平移写入独立的 panOffset，而不是直接改 orbit.tx/ty —— 后者是
   * flyTo 补间的目标值，补间每帧都会把它覆盖回取景中心，导致平移
   * 只能产生一帧的位移（表现为「中键几乎不动」）。
   */
  function panBy(dx: number, dy: number) {
    if (reducedMotion) return
    // 屏幕平面基向量：right 永远水平，up 由当前极角决定
    const cosPhi = Math.cos(orbit.phi)
    const sinPhi = Math.sin(orbit.phi)
    const cosT = Math.cos(orbit.theta)
    const sinT = Math.sin(orbit.theta)
    const rightX = cosT
    const rightZ = -sinT
    const upX = -cosPhi * sinT
    const upY = sinPhi
    const upZ = -cosPhi * cosT
    // 平移幅度与当前可见高度成正比 → 任意缩放下手感一致。
    // 系数 0.35：拖过整个视口宽度约移动「可见宽度」的三分之一，
    // 手感接近地图拖拽；过大（如 1.0）会让星团瞬间飞出画面。
    const k = Math.max(viewH * focus.scale, 0.05) * 0.35
    const dPanX = (-dx * rightX + dy * upX) * k
    const dPanY = dy * upY * k
    const dPanZ = (-dx * rightZ + dy * upZ) * k
    panOffset.x += dPanX
    panOffset.y += dPanY
    panOffset.z += dPanZ
    orbit.vPanX = dPanX
    orbit.vPanY = dPanY
    momentumActive = true
    ensureLoop()
  }

  /** 指针抬起：启动惯性衰减（在渲染循环中推进）。 */
  function releaseMomentum() {
    if (reducedMotion) {
      orbit.vTheta = 0
      orbit.vPhi = 0
      orbit.vPanX = 0
      orbit.vPanY = 0
      momentumActive = false
      return
    }
    momentumActive = true
    ensureLoop()
  }

  function setVisible(nextVisible: boolean) {
    visible = nextVisible
    if (nextVisible) {
      ensureLoop()
      renderFrame(0)
    } else {
      stopLoop()
    }
  }

  function setAwake(awake: boolean) {
    if (reducedMotion) {
      awaken = 1
      return
    }
    awakenTween?.kill()
    awakenTween = gsap.to(
      { v: awaken },
      {
        v: awake ? 1 : 0.25,
        duration: awake ? 0.85 : 0.4,
        ease: 'power2.out',
        onUpdate() {
          awaken = (this.targets()[0] as { v: number }).v
          if (!raf) renderFrame(0.016)
        },
        onComplete() {
          awakenTween = null
        },
      },
    )
    if (awake) ensureLoop()
  }

  function setReducedMotion(value: boolean) {
    reducedMotion = value
    if (value) {
      modeTween?.kill()
      awakenTween?.kill()
      focusTween?.kill()
      modeTween = null
      awakenTween = null
      focusTween = null
      awaken = 1
      morph = mode === 'understand' ? 1 : 0
      for (const cluster of clusters.values()) {
        cluster.collapseAt = null
        if (cluster.expanded) {
          cluster.grow = 1
          cluster.alpha = 1
          cluster.nodesAlpha = 1
          cluster.flare = NODE_HOLD_FLARE
        } else {
          cluster.grow = 0
          cluster.alpha = 0
          cluster.nodesAlpha = 0
          cluster.flare = 1
        }
      }
      stopLoop()
      renderFrame(0)
    } else {
      ensureLoop()
    }
  }

  function resize(w: number, h: number) {
    applySize(w, h)
    if (!raf) renderFrame(0)
  }

  function renderOnce() {
    renderFrame(0)
  }

  function projectNode(id: string) {
    if (!camera || !renderer || !nodePositions) return null
    const idx = nodeOrder.indexOf(id)
    if (idx < 0) return null
    world.set(
      nodePositions[idx * 3]!,
      nodePositions[idx * 3 + 1]!,
      nodePositions[idx * 3 + 2]!,
    )
    root?.updateMatrixWorld()
    camera.updateMatrixWorld()
    root?.localToWorld(world)
    world.project(camera)
    return {
      x: (world.x * 0.5 + 0.5) * width,
      y: (-world.y * 0.5 + 0.5) * height,
    }
  }

  function dispose() {
    if (disposed) return
    disposed = true
    stopLoop()
    modeTween?.kill()
    awakenTween?.kill()
    focusTween?.kill()
    modeTween = null
    awakenTween = null
    focusTween = null
    document.removeEventListener('visibilitychange', onVisibility)

    if (renderer) {
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)
      renderer.dispose()
      renderer.domElement.remove()
    }

    const disposeObj = (obj: Points | Line | LineSegments | LineLoop | null) => {
      if (!obj) return
      obj.geometry.dispose()
      const mat = obj.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat.dispose()
    }
    disposeObj(primaryPoints)
    disposeObj(secondaryPoints)
    disposeObj(ambientPoints)
    disposeObj(guideLines)
    disposeObj(bridgeLines)
    for (const ring of ringLoops.values()) disposeObj(ring)
    ringLoops.clear()
    disposeObj(hazePoints)
    pointTexture?.dispose()
    pointTexture = null

    primaryPoints = null
    secondaryPoints = null
    ambientPoints = null
    guideLines = null
    bridgeLines = null
    hazePoints = null
    scene = null
    camera = null
    root = null
    renderer = null
    container = null
  }

  return {
    mount,
    setMode,
    setPointer,
    zoomBy,
    enterClusterFocus,
    exitClusterFocus,
    selectAt,
    selectNodeById,
    hoverAt,
    rotateBy,
    panBy,
    releaseMomentum,
    clearSelection,
    setVisible,
    setAwake,
    setReducedMotion,
    resize,
    renderOnce,
    dispose,
    getMode: () => mode,
    projectNode,
    getPrimaryLabels,
  }
}

export function resolvePerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'balanced'
  const w = window.innerWidth
  const dpr = window.devicePixelRatio || 1
  const cores = navigator.hardwareConcurrency || 4
  if (w < 720 || dpr >= 2.5 || cores <= 4) return 'reduced'
  if (w < 1100 || dpr >= 2 || cores <= 6) return 'balanced'
  return 'high'
}
