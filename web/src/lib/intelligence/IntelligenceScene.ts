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
  OrthographicCamera,
  Points,
  PointsMaterial,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three'

import {
  buildLayout,
  buildLayoutMobile,
  layoutsForViewport,
  resolvePerformanceCounts,
  understandLayout,
  understandLayoutMobile,
} from './layouts'
import type {
  HotspotInfo,
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
const NODE_HOLD_FLARE = 0.6 // 选中期间持续的高亮余量（诗云 HOLD_FLARE）
const RING_SEGMENTS = 96 // 赤道参考环分段
const RING_ALPHA = 0.16
const RING_INTENSITY = 0.35
const PLANE_SEG_DIM = 0.38 // 平面段亮度（最暗：只表达方位/半径）
const VERT_SEG_BRIGHT = 0.8 // 垂直段亮度（较亮：表达高度信息）
const BRIDGE_SEGMENTS = 24
const MIN_VIEW_SCALE = 0.42
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
  let camera: OrthographicCamera | null = null
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
  let pulseT = 0
  let sceneT = 0
  let hoveredId: string | null = null
  let focusedHotspot: string | null = null
  const focus = { scale: 1, x: 0, y: 0 }
  let rotationX = -0.08
  let rotationY = -0.18

  const nodeOrder = buildLayout.nodes.map((n) => n.id)
  const primaryIds = nodeOrder.filter(
    (id) => buildLayout.nodes.find((n) => n.id === id)?.role === 'primary',
  )
  const secondaryIds = nodeOrder.filter(
    (id) => buildLayout.nodes.find((n) => n.id === id)?.role === 'secondary',
  )
  const clusterIds: string[] = ['research', 'agent']

  /** 星团状态机：expand → 平面段发散 → 垂直段上升 → 节点闪光渐入（诗云《行星指引》同款时序） */
  interface ClusterState {
    id: string
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
        if (idx < 0) continue
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
    }
  }

  function getPrimaryLabels(forMode: IntelligenceMode): HotspotInfo[] {
    const source = forMode === 'build' ? activeBuild() : activeUnderstand()
    return source.nodes
      .filter((n) => n.role === 'primary' && n.label)
      .map((n) => ({
        id: n.id,
        label: n.label!,
        microcopy: n.microcopy ?? '',
        mode: forMode,
      }))
  }

  function maxDpr() {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    if (tier === 'reduced') return Math.min(dpr, 1.15)
    if (tier === 'balanced') return Math.min(dpr, 1.35)
    return Math.min(dpr, 1.5)
  }

  function shouldLoop() {
    return (
      !disposed &&
      visible &&
      documentVisible &&
      !!renderer &&
      (!reducedMotion || modeTween !== null)
    )
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
        c.nodesAlpha = Math.min(1, age / NODE_FADE_IN)
        c.flare = Math.max(NODE_HOLD_FLARE, 1 - (1 - NODE_HOLD_FLARE) * (age / NODE_FADE_IN))
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
        const v = k * 12
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
    let pIdx = 0
    let sIdx = 0

    pointer.x = lerp(pointer.x, pointer.tx, reducedMotion ? 1 : 0.08)
    pointer.y = lerp(pointer.y, pointer.ty, reducedMotion ? 1 : 0.08)

    for (let i = 0; i < nodeOrder.length; i++) {
      const id = nodeOrder[i]!
      const layout = layoutAt(id, t)
      const isSecondary = layout.role === 'secondary'
      let hide = false
      if (isSecondary) {
        secondaryShown++
        if (secondaryShown > secondaryVisible) hide = true
      }

      const targetX = layout.position.x
      const targetY = layout.position.y
      const targetZ = layout.position.z
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

      if (reducedMotion || hide) {
        nodePositions[ix] = px
        nodePositions[ix + 1] = py
        nodePositions[ix + 2] = pz
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
      let flareGain = 1
      if (layout.role === 'secondary') {
        // 未展开的星团：星点完全隐藏；展开时闪光渐入（诗云 FADE_IN + HOLD_FLARE）
        const cl = nodeClusterById.get(id)
        const nodeAlpha = cl ? cl.nodesAlpha : 0
        alpha *= nodeAlpha
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

      if (layout.role === 'primary') {
        const pi = pIdx * 3
        primaryPos[pi] = nodePositions[ix]!
        primaryPos[pi + 1] = nodePositions[ix + 1]!
        primaryPos[pi + 2] = nodePositions[ix + 2]!
        primaryCol[pi] = nodeColors[ix]!
        primaryCol[pi + 1] = nodeColors[ix + 1]!
        primaryCol[pi + 2] = nodeColors[ix + 2]!
        pIdx++
      } else {
        const si = sIdx * 3
        secondaryPos[si] = nodePositions[ix]!
        secondaryPos[si + 1] = nodePositions[ix + 1]!
        secondaryPos[si + 2] = nodePositions[ix + 2]!
        secondaryCol[si] = nodeColors[ix]!
        secondaryCol[si + 1] = nodeColors[ix + 1]!
        secondaryCol[si + 2] = nodeColors[ix + 2]!
        sIdx++
      }
    }

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
    ;(ambientPoints.material as PointsMaterial).opacity = 0.08 + awaken * 0.18
    void dt
  }

  function updateCameraProjection() {
    if (!camera) return
    const aspect = width / Math.max(height, 1)
    if (projectionScale === focus.scale && projectionAspect === aspect) return
    const animatedViewW = viewH * aspect * focus.scale
    camera.left = -animatedViewW
    camera.right = animatedViewW
    camera.top = viewH * focus.scale
    camera.bottom = -viewH * focus.scale
    camera.updateProjectionMatrix()
    projectionScale = focus.scale
    projectionAspect = aspect
  }

  function updateCamera() {
    if (!camera || !root) return
    updateCameraProjection()
    // 聚焦位移由 gsap 补间驱动（点击星点 → 流畅放大并飞向目标）
    root.position.set(focus.x, focus.y, 0)
    root.rotation.x = rotationX
    root.rotation.y = rotationY
    if (reducedMotion) {
      camera.position.x = 0
      camera.position.y = 0
      return
    }
    // Extremely subtle framing shift only — no orbit / tilt
    cameraParallax.x = lerp(cameraParallax.x, pointer.x * 0.012, 0.05)
    cameraParallax.y = lerp(cameraParallax.y, pointer.y * 0.008, 0.05)
    const modeShift = (morph - 0.5) * 0.018
    camera.position.x = cameraParallax.x + modeShift
    camera.position.y = cameraParallax.y
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
    updateCameraProjection()
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

    camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
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

  function setMode(next: IntelligenceMode, expandForMode = true) {
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

  /** 滚轮缩放：正值拉远，负值靠近；保留当前聚焦位置作为镜头中心。 */
  function zoomBy(delta: number) {
    if (disposed || !Number.isFinite(delta) || delta === 0) return
    const targetScale = Math.max(
      MIN_VIEW_SCALE,
      Math.min(MAX_VIEW_SCALE, focus.scale * Math.exp(delta * WHEEL_ZOOM_FACTOR)),
    )
    if (Math.abs(targetScale - focus.scale) < 0.0001) return
    focusTween?.kill()
    focusTween = null
    if (reducedMotion) {
      focus.scale = targetScale
      renderFrame(0)
      return
    }
    // Wheel events arrive in quick succession; update the target immediately so
    // every tick compounds from the latest zoom level instead of a stale tween.
    focus.scale = targetScale
    updateCameraProjection()
    renderFrame(0)
  }

  /** 旋转后的坐标（root 仅含 Rx·Ry），用于把节点居中到画面 */
  function rotatedPoint(x: number, y: number, z: number, out: Vector3) {
    const cy = Math.cos(rotationY)
    const sy = Math.sin(rotationY)
    const cx = Math.cos(rotationX)
    const sx = Math.sin(rotationX)
    const x1 = x * cy + z * sy
    const z1 = -x * sy + z * cy
    out.set(x1, y * cx - z1 * sx, y * sx + z1 * cx)
  }

  /** 流畅的相机飞行：gsap 补间聚焦缩放 + 居中偏移（诗云 locate 同款手感） */
  function flyTo(scale: number, x: number, y: number, duration = 0.95) {
    if (disposed) return
    focusTween?.kill()
    focusTween = null
    if (reducedMotion) {
      focus.scale = scale
      focus.x = x
      focus.y = y
      renderFrame(0)
      return
    }
    // Apply the destination immediately so the target stays visible while
    // the frame animation is settling, then use the tween for the motion.
    const from = { scale: focus.scale, x: focus.x, y: focus.y }
    focus.scale = scale
    focus.x = x
    focus.y = y
    renderFrame(0)
    focus.scale = from.scale
    focus.x = from.x
    focus.y = from.y
    focusTween = gsap.to(focus, {
      scale,
      x,
      y,
      duration,
      ease: 'power2.inOut',
      overwrite: true,
      onUpdate() {
        ensureLoop()
      },
    })
    ensureLoop()
  }

  function flyToNode(id: string, scale: number, duration = 0.95) {
    const idx = nodeOrder.indexOf(id)
    if (!nodePositions || idx < 0) return
    rotatedPoint(
      nodePositions[idx * 3]!,
      nodePositions[idx * 3 + 1]!,
      nodePositions[idx * 3 + 2]!,
      tmpA,
    )
    flyTo(scale, -tmpA.x, -tmpA.y, duration)
  }

  function frameView(duration = 0.95) {
    let anyExpanded = false
    for (const c of clusters.values()) if (c.expanded) anyExpanded = true
    if (anyExpanded) flyTo(0.85, 0, 0, duration)
    else flyTo(1, 0, 0, duration)
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
          info: { id: n.id, label: n.label!, microcopy: n.microcopy ?? '', mode: m },
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
      // 点击空白：取消选中并回到取景（已展开的星团保持展开）
      focusedHotspot = null
      options.onHotspotChange?.(null)
      frameView()
      ensureLoop()
      return
    }

    if (hit.isPrimary) {
      const cluster = clusters.get(hit.info.id)
      if (!cluster) return
      if (cluster.expanded) {
        // 再次点击核心 → 收起星团
        collapseCluster(cluster)
        focusedHotspot = null
        options.onHotspotChange?.(null)
        frameView()
      } else {
        // 点击核心 → 诗云式展开（先四周发散，再垂直发散）+ 相机飞向星团
        expandCluster(cluster)
        focusedHotspot = cluster.id
        options.onHotspotChange?.(hit.info)
        flyToNode(cluster.id, 0.62)
      }
    } else {
      // 点击小节点 → 流畅放大并聚焦过去，名称显示在节点上方
      focusedHotspot = hit.info.id
      options.onHotspotChange?.(hit.info)
      flyToNode(hit.info.id, 0.5)
    }
    ensureLoop()
  }

  function clearSelection() {
    focusedHotspot = null
    options.onHotspotChange?.(null)
    frameView()
    ensureLoop()
  }

  function rotateBy(dx: number, dy: number) {
    if (reducedMotion) return
    rotationY += dx * 1.25
    rotationX = Math.max(-0.65, Math.min(0.65, rotationX + dy * 0.85))
    ensureLoop()
  }

  function setVisible(v: boolean) {
    visible = v
    if (v) ensureLoop()
    else stopLoop()
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
    selectAt,
    hoverAt,
    rotateBy,
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
