/**
 * 学习资料（Learning Resources）—— 供两条学习路径共用的公共模型。
 *
 * 设计约束：
 * - 资料只描述「去哪看什么」，站内不托管课程、不做进度追踪，因此这里
 *   没有 status / progress 字段。文件本体放在 public/resources/ 下，
 *   由浏览器直接打开，不经过前端路由。
 * - 资料数量会持续增长，所以字段全部可选、可缺省，新增资料时不必填满。
 *   组件也按「缺失即不渲染」处理，避免出现空的元信息占位。
 */

export type ResourceKind = 'pdf' | 'ppt' | 'video' | 'link' | 'code' | 'dataset'

/** 难度分级。刻意只留三档，避免出现「中高级」这类模糊中间态。 */
export type ResourceLevel = '入门' | '进阶' | '深入'

export interface LearningResource {
  id: string
  /** 标题：一句话说清这是什么 */
  title: string
  /** 说明：为什么值得看。不是内容复述 */
  note: string
  kind: ResourceKind
  /** 站内文件用站内绝对路径（toAssetPath 生成）；外部资源写完整 URL */
  href: string
  /**
   * 归属阶段。与各页面自己的 stage id 对应（ResearchStageId / AiStageId）。
   * 两条路径的阶段 id 有重名（如都叫 foundations），因此资料数组必须
   * 按页面分开维护，不能放同一个池子里靠 stageId 区分。
   */
  stageId?: string
  /** 来源 / 作者 / 机构 */
  source?: string
  level?: ResourceLevel
  /** 预计投入，如「约 20 分钟」。用文字而非数字，便于表达「3 小时」这类粗略估计 */
  duration?: string
  /** 必读：阶段卡片内嵌时只显示这一类 */
  mustRead?: boolean
  /** 外部链接才需要；站内文件不需要新标签页 */
  external?: boolean
}

/**
 * 拼出指向 public/ 下资源的正确路径。
 *
 * 必须用 BASE_URL 而不是硬编码 '/resources/...'：站点部署在 GitHub Pages
 * 的项目页下，base 是 '/LABA/'，硬编码根路径在本地 dev 能打开、线上却 404。
 */
export function toAssetPath(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${normalizedBase}${normalizedPath}`
}

/** 类型徽标的展示文案与色调 key。色调由组件映射到设计令牌，不在这里写颜色。 */
export const RESOURCE_KIND_META: Record<
  ResourceKind,
  { label: string; tone: 'doc' | 'slide' | 'video' | 'link' | 'code' | 'data' }
> = {
  pdf: { label: 'PDF', tone: 'doc' },
  ppt: { label: 'PPT', tone: 'slide' },
  video: { label: '视频', tone: 'video' },
  link: { label: '链接', tone: 'link' },
  code: { label: '代码', tone: 'code' },
  dataset: { label: '数据集', tone: 'data' },
}

/** 按阶段筛选资料。阶段 id 是可选归属，未挂阶段的资料不会出现在阶段卡片里。 */
export function resourcesForStage(
  all: readonly LearningResource[],
  stageId: string,
  onlyMustRead = false,
): LearningResource[] {
  return all.filter(
    (item) => item.stageId === stageId && (!onlyMustRead || item.mustRead === true),
  )
}
