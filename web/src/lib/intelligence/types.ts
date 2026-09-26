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
  hoverAt: (x: number, y: number) => void
  rotateBy: (x: number, y: number) => void
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
