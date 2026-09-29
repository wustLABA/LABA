/**
 * Community page — People & Work public content.
 * No fabricated people, metrics, or social claims.
 */
import type { ContributionModeId } from '../types/member'
import { getPublishedCommunityMembers } from './members'

export const communityHero = {
  eyebrow: '社区',
  title: '实践背后的人。',
  lede: '社区不止是一份名单。人们学习、构建、质疑、记录，并留下别人能继续推进的成果——跨越工程、科研与混合实践。',
}

export interface ContributionMode {
  id: ContributionModeId
  index: string
  label: string
  statement: string
  related: string[]
  fieldHint: 'build' | 'research' | 'explain' | 'document' | 'connect'
}

export const contributionModes: ContributionMode[] = [
  {
    id: 'build',
    index: '01',
    label: '构建',
    statement:
      '把想法变成别人能用或能测的东西——工具、工作流、原型。',
    related: ['AI 工程', '作品', '工作坊'],
    fieldHint: 'build',
  },
  {
    id: 'research',
    index: '02',
    label: '科研',
    statement:
      '提出问题、做复现、做实验，并保留证据及其局限。',
    related: ['Deep Learning', '论文精读', '科研分享'],
    fieldHint: 'research',
  },
  {
    id: 'explain',
    index: '03',
    label: '解释',
    statement:
      '把一个模型、工具、实验或失败，讲清楚到另一个人能跟上的程度。',
    related: ['工作坊', '阅读', '分享'],
    fieldHint: 'explain',
  },
  {
    id: 'document',
    index: '04',
    label: '记录',
    statement:
      '留下 README 笔记、配置、实验日志、失败案例与决策，供他人继续。',
    related: ['证据', '代码仓库', '配置'],
    fieldHint: 'document',
  },
  {
    id: 'connect',
    index: '05',
    label: '连接',
    statement:
      '促成一次活动、找到协作者，并让工程与科研保持对话。',
    related: ['场次', '协作', '节奏'],
    fieldHint: 'connect',
  },
]

export const collaborationField = {
  eyebrow: '协作',
  title: '工作把人连接起来。',
  lede: '社区不是按头衔组织的。人们通过问题、作品、场次、证据与共享工具相遇。',
  statement: '人们因工作而相遇，而非因名片而相遇。',
}

export const publicMembersState = {
  eyebrow: '成员',
  title: '公开成员档案暂未发布。',
  body: '当成员选择公开自己的作品与贡献信息时，档案会显示在这里。',
  optIn: '公开档案为自愿加入。',
}

export interface CommunityPrinciple {
  id: string
  index: string
  label: string
  statement: string
}

export const communityPrinciples: CommunityPrinciple[] = [
  {
    id: 'inspectable',
    index: '01',
    label: '让成果可被检视',
    statement: '别人应该能运行、阅读、质疑并继续这份工作。',
  },
  {
    id: 'failed',
    index: '02',
    label: '分享失败',
    statement: '失败案例是工程与科研的证据——而不是需要藏起来的东西。',
  },
  {
    id: 'teach',
    index: '03',
    label: '教你所学的',
    statement: '能把事情讲清楚，往往比只会用更重要。',
  },
  {
    id: 'leave',
    index: '04',
    label: '留下点什么',
    statement:
      '一次活动或一件作品，至少该留下一条痕迹：代码、笔记、配置、一个问题，或一份证据。',
  },
]

/**
 * Q&A surface — GitHub Discussions via giscus embed (no self-hosted backend).
 * Account = GitHub through the giscus OAuth app.
 */
export const communityAsk = {
  eyebrow: '提问与回答',
  title: '有问题，就发出来。',
  lede:
    '在社区页直接留言。用 GitHub 账号登录即可提问与回复；讨论保存在仓库 Discussions。',
  askLabel: '去提问',
  browseLabel: '看全部讨论 ↗',
  askUrl: 'https://github.com/wustLABA/LABA/discussions/new?category=q-a',
  browseUrl: 'https://github.com/wustLABA/LABA/discussions',
  note: '账号即你的 GitHub。本站通过 giscus 嵌入 Discussions，无需自建登录后端。',
  steps: [
    {
      index: '01',
      label: '用 GitHub 登录',
      text: '在下方评论区点击登录，授权 giscus 即可发言。',
    },
    {
      index: '02',
      label: '提出一个具体问题',
      text: '写清你在做什么、卡在哪、已经试过什么——越具体，越容易被回答。',
    },
    {
      index: '03',
      label: '回答或补充别人',
      text: '看到能接住的问题，留下答案、链接或失败经验。',
    },
  ],
}

export const communityClosing = {
  eyebrow: '下一步',
  title: '我接下来去哪里？',
  lede: '找一个方向、感受社区的节奏，或在准备好时加入。',
}

export function getCommunityPublicMembers() {
  return getPublishedCommunityMembers()
}
