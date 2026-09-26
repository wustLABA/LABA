export type IntelligenceMode = 'build' | 'understand'

export type IntelligenceClusterId = 'research' | 'agent'

export type PerformanceTier = 'high' | 'balanced' | 'reduced'

export type NodeRole = 'primary' | 'secondary'

export type EdgeHierarchy = 'primary' | 'secondary' | 'ambient'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface NodeLayout {
  id: string
  clusterId: IntelligenceClusterId
  position: Vec3
  scale: number
  opacity: number
  role: NodeRole
  label?: string
  hotspot?: boolean
  microcopy?: string
  /** 名词释义：点击节点后 tooltip 的正文，解释这个概念本身是什么。 */
  concept?: string
  /** 关联节点 id：tooltip 中可点击跳转的相邻概念。 */
  related?: string[]
}

export interface EdgeLayout {
  id: string
  from: string
  to: string
  opacity: number
  curved: boolean
  kind: 'flow' | 'attention'
  hierarchy: EdgeHierarchy
  weight: number
}

export interface SceneLayout {
  nodes: NodeLayout[]
  edges: EdgeLayout[]
}

export interface HotspotInfo {
  id: string
  clusterId: IntelligenceClusterId
  label: string
  microcopy: string
  mode: IntelligenceMode
  /** 名词释义（tooltip 正文）；旧数据可能缺省。 */
  concept?: string
  /** 关联节点（tooltip 中的可跳转条目）。 */
  related?: { id: string; label: string }[]
}

export interface IntelligenceSceneOptions {
  tier: PerformanceTier
  reducedMotion: boolean
  onReady?: () => void
  onError?: (error: Error) => void
  onHotspotChange?: (hotspot: HotspotInfo | null) => void
  onHoverChange?: (hotspot: HotspotInfo | null) => void
  onClusterActivate?: (clusterId: IntelligenceClusterId) => void
}

export interface IntelligenceSceneApi {
  mount: (container: HTMLElement) => void
  setMode: (mode: IntelligenceMode, expandForMode?: boolean) => void
  setPointer: (x: number, y: number) => void
  zoomBy: (delta: number) => void
  enterClusterFocus: (clusterId: IntelligenceClusterId) => void
  exitClusterFocus: () => void
  selectAt: (x: number, y: number) => void
  /** 按 id 精确选中并飞向节点（tooltip 关联跳转用，不依赖坐标拾取）。 */
  selectNodeById: (id: string) => void
  hoverAt: (x: number, y: number) => void
  rotateBy: (x: number, y: number) => void
  /**
   * 中键 / 右键拖动 → 沿相机屏幕平面平移视角（诗云式漫游）。
   * 与 rotateBy 分离：旋转绕球面公转，平移只挪动视线中心。
   */
  panBy: (dx: number, dy: number) => void
  /** 鼠标松开后调用：让轨道旋转与平移动量按阻尼自然衰减，产生惯性手感。 */
  releaseMomentum: () => void
  clearSelection: () => void
  setVisible: (visible: boolean) => void
  setAwake: (awake: boolean) => void
  setReducedMotion: (reduced: boolean) => void
  resize: (width: number, height: number) => void
  renderOnce: () => void
  dispose: () => void
  getMode: () => IntelligenceMode
  projectNode: (id: string) => { x: number; y: number } | null
  getPrimaryLabels: (mode: IntelligenceMode) => HotspotInfo[]
}
