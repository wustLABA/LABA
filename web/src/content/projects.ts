/**
 * 作品档案 —— 成员个人项目。
 *
 * 定位说明（重要）：
 * 这里的项目来自社团成员的个人 GitHub 仓库，属于**成员个人作品**，
 * 不是社团的官方交付物。页面文案与详情页均按此表述，避免把个人项目
 * 说成社团成果。
 *
 * 内容来源：以下每个项目的 summary、techStack 与 caseStudy 都依据该仓库
 * 的真实 README 与仓库元数据撰写，没有虚构的功能、指标或成果。
 * 仓库里没写的东西就不写 —— 宁可信息少，也不要编。
 *
 * 后续补充真实社团项目时，按同样的原则追加即可。
 */
import type { Project, ProjectCaseStudy } from '../types/project'
import {
  getProjectCategoryLabel,
  matchesProjectFilter,
  type ProjectFilterId,
} from '../types/project'

/** 成员个人 GitHub 账号。作品档案里的仓库均位于该账号下。 */
const MEMBER_GITHUB = 'https://github.com/jolaaa999'

const agentCase: ProjectCaseStudy = {
  overview:
    '基于 AI 智能体的专业图谱生成与个性化学习路径导航。采用 Monorepo 组织前端可视化、Go 网关、Python AI 解析引擎与 Neo4j 数据库四部分。',
  problem:
    '学习资料通常以线性文档组织，难以体现知识之间的依赖关系；想把「一个领域的结构」和「我该按什么顺序学」同时表达清楚，需要图结构而不是列表。',
  approach:
    '把图谱构建与路径导航拆成三个独立服务：Python 侧用 LangChain 做实体关系解析，Go 侧做网关与图数据读写，前端用 AntV G6 渲染图谱并做交互式导航。',
  architecture: {
    summary: 'Monorepo：前端可视化 + Go 网关 + Python AI 引擎 + Neo4j。',
    nodes: [
      { id: 'frontend', label: '前端', detail: 'Vue3 + TS + Vite + AntV G6' },
      { id: 'gateway', label: 'Go 网关', detail: 'Gin + Neo4j Driver（DDD 分层）' },
      { id: 'engine', label: 'AI 引擎', detail: 'FastAPI + LangChain Agent' },
      { id: 'graph', label: 'Neo4j', detail: 'Docker Compose 一键启动' },
    ],
  },
  workflow: [
    {
      title: '解析',
      detail: 'POST /api/parse —— 调用 DeepSeek 从原始文本抽取实体与关系。',
    },
    {
      title: '诊断',
      detail: 'POST /api/langchain/diagnose —— 三 Agent 诊断流水线。',
    },
    {
      title: '对话',
      detail: 'POST /api/langchain/chat —— 基于图谱上下文的问答。',
    },
    {
      title: '路径',
      detail: 'POST /api/langchain/learning-path —— 生成个性化学习路径。',
    },
  ],
  results: [
    { label: '可运行的多服务架构', detail: '四部分各有独立启动方式，Neo4j 用 docker compose 起。' },
    { label: '图谱驱动的问答与路径', detail: '对话与学习路径都以上游构建的图谱作为上下文。' },
  ],
  limitations: [
    '需要自行配置 DeepSeek API Key 与 Neo4j 实例才能完整跑通。',
    'README 未提供效果评测数据，因此这里也不给出任何准确率或性能结论。',
  ],
  artifacts: [
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/AGENT` },
  ],
  nextSteps: [
    '补充图谱质量与路径推荐的评测方式。',
    '简化本地启动流程，降低部署门槛。',
  ],
}

const crawlerCase: ProjectCaseStudy = {
  overview:
    '面向公版书与开放获取（Open Access）资源的图书抓取与本地 RAG 语料构建工具。核心代码零第三方依赖，仅用 Python 标准库即可运行。',
  problem:
    '想用合法来源的电子书搭建本地语料，需要跨多个站点搜索、判断授权、下载、清洗分片并建索引 —— 每一步都有踩坑空间，尤其是授权判断。',
  approach:
    '把「合规」写进代码而不是靠自觉：下载前必须通过 rights 校验，只有检测到 public domain / open access / creative commons / cc by / cc0 之一才放行；来源发现阶段先读 robots.txt，命中 Disallow 就停止自动适配；遇到人机校验或限速明确失败，不做绕过。',
  workflow: [
    { title: '多源搜索', detail: '插件式 Source 抽象，统一输出 BookResult 并跨源去重排序。' },
    { title: '权利校验', detail: '下载前检查页面许可文本，不命中白名单则拒绝。' },
    { title: '下载与探测', detail: '按 HEAD / Range 探测真实格式（txt / epub / pdf / mobi / html）。' },
    { title: '清洗分片', detail: '切分后建 TF-IDF 索引；装 sentence-transformers 可切稠密向量。' },
    { title: '检索问答', detail: '在本地索引上直接问答。' },
  ],
  results: [
    { label: '纯标准库的 RAG 流水线', detail: '不依赖第三方包即可完成抓取到问答的全流程。' },
    { label: '70 个测试用例', detail: '含 10 类网络链路回归场景（重定向循环、Cookie、SSRF、挑战页、限速等）。' },
    { label: 'SSRF 防护', detail: 'validate_public_http_url() 会拒绝 localhost、.local 与私有网段。' },
  ],
  limitations: [
    'arXiv 单篇授权不统一，其检索 API 不返回许可证字段，无法做白名单过滤；项目对它的处理是如实标注「授权随条目而异」并给出条目页链接，由使用者自行核对。',
    '自动发现只产出候选配置，一律以 enabled: false 落盘，必须人工复核后才可能启用。',
  ],
  artifacts: [
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/legal_book_crawler` },
  ],
  nextSteps: [
    '扩充声明式来源的覆盖范围，减少手写适配器。',
    '为稠密向量检索补充评测。',
  ],
}

const sectionNavCase: ProjectCaseStudy = {
  overview:
    'DeepSeek Harness 插件：在对话正文旁提供章节导航栏，并把章节书签保存在浏览器本地。是 Section-Nav-for-ChatGPT 的 DSH 移植版。',
  problem:
    '长回答滚动之后很难快速回到某个小节，浏览器自带的查找也无法体现回答的结构。',
  approach:
    '把 ChatGPT 扩展的适配层替换为 DSH 适配器与 dsh bundle manifest，保留原有的阅读位置跟踪与迟滞（hysteresis）行为，避免滚动时选中项频繁跳动。',
  workflow: [
    { title: '章节提取', detail: '解析当前回答中的标题，渲染为紧凑的侧边导航栏。' },
    { title: '位置跟踪', detail: '按阅读线高亮当前小节，带迟滞以避免抖动。' },
    { title: '点击跳转', detail: '点击标题滚动到对应位置并短暂高亮目标。' },
    { title: '本地书签', detail: '可收藏任意章节，之后从书签抽屉跳回。' },
  ],
  results: [
    { label: '常驻导航栏', detail: '不会收缩成标记条，标题始终可见，宽度随窗口变化。' },
    { label: '悬停卡片', detail: '显示该轮的用户提问与最终回答的两行摘录。' },
  ],
  limitations: [
    '依赖 DSH 的插件接口，宿主版本变化时可能需要同步适配。',
    '移植自第三方 MIT 项目，授权与出处见仓库 NOTICE 与 LICENSE。',
  ],
  artifacts: [
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/dsh-section-nav` },
  ],
  nextSteps: ['跟进上游 Section-Nav-for-ChatGPT 的功能更新。'],
}

const autoupdateCase: ProjectCaseStudy = {
  overview:
    'DSH 插件：为本地 deepseek-harness 检出提供安全自动更新的状态面板与手动触发入口。',
  problem:
    '本地克隆的 harness 需要跟进上游更新，但直接重新克隆或覆盖文件可能冲掉本地改动。',
  approach:
    '更新动作交给独立的 PowerShell 脚本 tools/sync-dsh.ps1 执行安全模式 git merge（fast-forward 或 merge commit，绝不使用文件复制或重新克隆），插件只负责把它接进 DSH Web UI。',
  workflow: [
    { title: '检查', detail: '设置 → 通用 中的「自动更新」面板显示状态、上次检查时间与落后提交数。' },
    { title: '触发', detail: '一键「立即检查更新」执行同步脚本。' },
    { title: '查看', detail: '独立状态页 /dsh-autoupdate 展示详情、被阻塞文件与错误信息，60 秒自动刷新。' },
  ],
  results: [
    { label: '并发锁', detail: '已有同步在跑时，第二次调用立即退出。' },
    { label: '冲突保护', detail: '本地未提交改动与上游文件重叠时中止，工作区保持原样（退出码 3）。' },
    { label: '失败可回滚', detail: '真实冲突走 git merge --abort 恢复到合并前状态；其他失败返回退出码 2 且不产生改动。' },
    { label: '不会拖垮 DSH', detail: '报告缺失或损坏时插件优雅降级，不会影响 DSH 启动。' },
  ],
  limitations: [
    '仅适用于本地 git 检出的 harness，不适用于发行版安装。',
    '同步脚本为 Windows PowerShell 实现。',
  ],
  artifacts: [
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/dsh-autoupdate` },
  ],
  nextSteps: ['补充非 Windows 平台的同步实现。'],
}

const botCase: ProjectCaseStudy = {
  overview:
    '基于 NapCat（OneBot v11）+ NoneBot2 的 QQ 群聊机器人。人设是热情可爱的深度学习学姐：群内 @ 必回，未被 @ 时低频率自然插嘴。',
  problem:
    '课程群里的常见提问高度重复，而纯检索式机器人回答生硬、不会把握插话时机。',
  approach:
    '用 NapCat 接入 QQ，反向 WebSocket 转发到 NoneBot2，由 dl_senpai 插件组装上下文后调用自己配置的 OpenAI 兼容中转站。插嘴行为用概率与冷却时间控制，避免打扰群聊。',
  architecture: {
    summary: 'QQ 群 → NapCat → 反向 WebSocket → NoneBot2 → dl_senpai → 中转站模型。',
    nodes: [
      { id: 'qq', label: 'QQ 群', detail: '消息来源' },
      { id: 'napcat', label: 'NapCat', detail: 'OneBot v11 实现' },
      { id: 'nonebot', label: 'NoneBot2', detail: '反向 WebSocket 接入' },
      { id: 'plugin', label: 'dl_senpai', detail: '人设与对话逻辑' },
      { id: 'llm', label: '中转站', detail: 'OpenAI 兼容接口' },
    ],
  },
  workflow: [
    { title: '@ 必回', detail: '被 @ 时必定响应。' },
    { title: '自然插嘴', detail: '未被 @ 时按概率插话，默认 0.03，冷却 180 秒。' },
    { title: '热梗注入', detail: '可选注入近期热梗备忘（默认开启）。' },
    { title: '按需联网', detail: '可选联网检索，支持 auto / bing / duckduckgo / searxng / tavily。' },
  ],
  results: [
    { label: '可配置的群白名单', detail: '支持限定生效群号，空值表示全部群生效。' },
    { label: '签到与私聊', detail: '含签到功能（默认白名单群）与私聊响应开关。' },
  ],
  limitations: [
    '需要自备 QQ 机器人账号、NapCat 部署与中转站 API Key。',
    'README 未给出对话质量评测数据，因此这里不提供任何效果指标。',
  ],
  artifacts: [
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/miao-senpai` },
  ],
  nextSteps: ['补充人设一致性的评测方式。'],
}

const tankCase: ProjectCaseStudy = {
  overview:
    '原版「坦克动荡」风格的浏览器坦克对战，支持远程联机。客户端部署在 Vercel，权威游戏房间跑在 Fly.io。',
  problem:
    '想和朋友远程对战，但房间状态需要服务端权威与固定 tick；静态托管平台无法满足长连接与定时的要求。',
  approach:
    '前后端分离：Client 用 Phaser 3 + Vite + TypeScript 部署到 Vercel，Server 用 Colyseus 0.15 + Node 22 部署到 Fly.io，共享层放确定性迷宫与物理仿真代码，保证两端行为一致。',
  architecture: {
    summary: '静态前端 + 权威游戏服，分层部署。',
    nodes: [
      { id: 'client', label: 'Client', detail: 'Phaser 3 + Vite + TS（Vercel）' },
      { id: 'server', label: 'Server', detail: 'Colyseus 0.15 + Node 22（Fly.io）' },
      { id: 'shared', label: 'Shared', detail: '确定性迷宫 / 物理仿真' },
    ],
  },
  workflow: [
    { title: '开始', detail: '击杀对手得 1 分，进入下一小局（新迷宫 + 乱序出生点）。' },
    { title: '获胜', detail: '先到 5 分获胜（GAME.scoreToWin 可改）。' },
    { title: '技能', detail: '场上彩色方块为可拾取技能，A–Z 共 26 种，各有加强版。' },
    { title: '联机', detail: '打开 https://tank-trouble-ten.vercel.app/?ws=wss://tanktrouble-server.fly.dev 后创建或加入房间。' },
  ],
  results: [
    { label: '可用的正式联机方案', detail: '游戏服 wss://tanktrouble-server.fly.dev，并提供 /health 健康检查。' },
    { label: '临时的本机隧道方案', detail: '本机开服 + cloudflared 隧道，用于正式服务不可用时的替代。' },
    { label: '文档站', detail: 'https://tank-trouble-ten.vercel.app/docs/，改功能时同步更新。' },
  ],
  limitations: [
    '静态托管的页面里 localhost 指向访问者自己的电脑，因此联机必须显式传入 ws 参数或配置环境变量。',
    '远程对战依赖已部署的 Fly.io 服务，服务下线则联机不可用。',
  ],
  artifacts: [
    { label: '在线试玩', kind: 'demo', href: 'https://tank-trouble-ten.vercel.app' },
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/TankTrouble` },
  ],
  nextSteps: ['补充房间列表与观战功能。'],
}

const tfmyCase: ProjectCaseStudy = {
  overview:
    '「塔菲喵译」—— 把文字转成塔菲语录形式的加密/解密玩具工具，纯前端实现。',
  problem:
    '一个轻量的趣味编码需求：把任意文字映射成一组固定语录，且必须能无损还原。',
  approach:
    '把明文按 UTF-8 转成二进制，再用字典把 1 / 0 / 字符间隔分别映射为三段塔菲语录，得到密文；解密即反向映射回二进制再还原 UTF-8。',
  workflow: [
    { title: '编码', detail: '明文 → UTF-8 → 二进制 → 字典映射 → 密文。' },
    { title: '解码', detail: '密文 → 语录识别 → 二进制 → UTF-8 → 明文。' },
  ],
  results: [
    { label: '纯前端零后端', detail: 'Vue 3 Composition API + Vite + TailwindCSS，无需服务端。' },
    { label: '可还原', detail: '用三种固定语录承载 0 / 1 / 间隔，信息不丢失。' },
  ],
  limitations: [
    '这是趣味工具，不是密码学意义上的加密 —— 映射规则公开，不具备保密性。',
  ],
  artifacts: [
    { label: '在线试玩', kind: 'demo', href: 'https://tfmy.vercel.app' },
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/tfmy` },
  ],
  nextSteps: ['支持自定义语录字典。'],
}

const deliciousCase: ProjectCaseStudy = {
  overview:
    '「人间烟火」—— 用于记录自己做的菜的软件。支持百科搜索菜谱、新增自己的菜品（材料、重量、过程）、给自己的菜品评分，以及在修改时与历史版本对比。',
  problem:
    '家常菜的做法往往散落在聊天记录和备忘录里，改了几次之后很难回忆「上一次是怎么做的、这次改了哪里」。',
  approach:
    '把每道菜当作带版本的记录来管理：新增与修改都保留历史，便于逐版对比；同时接入百科菜谱搜索，用于把自己的做法与通用做法对照。',
  workflow: [
    { title: '记录', detail: '新增菜品：材料、重量、制作过程。' },
    { title: '评分', detail: '给自己的菜品打分并留评价。' },
    { title: '对比', detail: '修改后与历史版本对比，或与百科菜谱对比。' },
  ],
  results: [
    { label: '版本化记录', detail: '每次修改都可与历史版本对照，看得出改了什么。' },
    { label: '已部署', detail: 'https://delicious-bay.vercel.app' },
  ],
  limitations: [
    'README 未说明数据存储与多用户方案，因此这里不做推断。',
  ],
  artifacts: [
    { label: '在线试用', kind: 'demo', href: 'https://delicious-bay.vercel.app' },
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/Delicious` },
  ],
  nextSteps: ['补充数据导出，避免记录被锁定在单一平台。'],
}

const blogCase: ProjectCaseStudy = {
  overview:
    '26 届团长的个人博客。个人站点 monorepo，前后端与内容分别组织，用于沉淀技术笔记与项目记录。',
  problem:
    '技术笔记散落在各类平台，格式与检索方式不统一，也不便长期保存。',
  approach:
    '用 monorepo 把站点各部分组成放在同一仓库内统一管理，内容以 Markdown 维护。',
  workflow: [
    { title: '安装', detail: 'npm run install:frontend' },
    { title: '开发', detail: 'npm run dev' },
  ],
  results: [
    { label: '已上线', detail: 'https://jol-ten.vercel.app' },
  ],
  limitations: [
    'README 目前只包含最基本的启动说明，仓库结构细节见其 docs/ 目录。',
  ],
  artifacts: [
    { label: '访问博客', kind: 'demo', href: 'https://jol-ten.vercel.app' },
    { label: '代码仓库', kind: 'repo', href: `${MEMBER_GITHUB}/jol` },
  ],
  collaborators: [{ name: '26 届团长', role: '作者' }],
  nextSteps: ['补充写作与发布的文档。'],
}

export const projects: Project[] = [
  {
    slug: 'agent-graph-navigation',
    title: 'AGENT · 图谱提取与导航',
    category: 'ai-engineering',
    summary:
      '基于 AI 智能体的专业图谱生成与个性化学习路径导航。Monorepo 组织前端可视化、Go 网关、Python AI 解析引擎与 Neo4j。',
    year: '2026',
    status: '进行中',
    techStack: ['Vue3', 'TypeScript', 'Go', 'Python', 'LangChain', 'Neo4j'],
    featured: true,
    featuredRank: 1,
    visualKind: 'agent',
    githubUrl: `${MEMBER_GITHUB}/AGENT`,
    caseStudy: agentCase,
  },
  {
    slug: 'legal-book-crawler',
    title: '公版书抓取与本地 RAG 语料',
    category: 'ai-engineering',
    summary:
      '面向公版书与开放获取资源的抓取与本地 RAG 语料构建工具。核心代码零第三方依赖，仅用 Python 标准库即可运行。',
    year: '2026',
    status: '进行中',
    techStack: ['Python', 'RAG', 'TF-IDF', '爬虫', '合规校验'],
    featured: true,
    featuredRank: 2,
    visualKind: 'agent',
    githubUrl: `${MEMBER_GITHUB}/legal_book_crawler`,
    caseStudy: crawlerCase,
  },
  {
    slug: 'tank-trouble-online',
    title: '坦克动荡 · 远程联机',
    category: 'developer-tool',
    summary:
      '原版「坦克动荡」风格的浏览器坦克对战 + 远程联机。Phaser 3 前端部署在 Vercel，Colyseus 权威房间部署在 Fly.io。',
    year: '2026',
    status: '已部署',
    techStack: ['Phaser 3', 'TypeScript', 'Colyseus', 'Node', 'Vite'],
    featured: true,
    featuredRank: 3,
    visualKind: 'tool',
    githubUrl: `${MEMBER_GITHUB}/TankTrouble`,
    demoUrl: 'https://tank-trouble-ten.vercel.app',
    caseStudy: tankCase,
  },
  {
    slug: 'miao-senpai-bot',
    title: '喵学姐 · QQ 群机器人',
    category: 'ai-engineering',
    summary:
      '基于 NapCat + NoneBot2 的 QQ 群聊机器人（深度学习学姐人设）。@ 必回，未被 @ 时低频率自然插嘴。',
    year: '2026',
    status: '已共享',
    techStack: ['Python', 'NoneBot2', 'NapCat', 'OneBot v11', 'LLM'],
    featured: false,
    featuredRank: 4,
    visualKind: 'agent',
    githubUrl: `${MEMBER_GITHUB}/miao-senpai`,
    caseStudy: botCase,
  },
  {
    slug: 'delicious-recipe-journal',
    title: '人间烟火 · 菜品记录',
    category: 'developer-tool',
    summary:
      '记录自己做的菜的软件：百科菜谱搜索、新增菜品（材料/重量/过程）、自我评分，以及与历史版本对比。',
    year: '2026',
    status: '已部署',
    techStack: ['Go', 'Web'],
    featured: false,
    featuredRank: 5,
    visualKind: 'tool',
    githubUrl: `${MEMBER_GITHUB}/Delicious`,
    demoUrl: 'https://delicious-bay.vercel.app',
    caseStudy: deliciousCase,
  },
  {
    slug: 'dsh-section-nav',
    title: 'DSH 章节导航插件',
    category: 'open-source',
    summary:
      'DeepSeek Harness 插件：为对话正文提供章节导航栏与本地书签。Section-Nav-for-ChatGPT 的 DSH 移植版。',
    year: '2026',
    status: '已共享',
    techStack: ['TypeScript', 'DSH Plugin', 'Vue'],
    featured: false,
    featuredRank: 6,
    visualKind: 'tool',
    githubUrl: `${MEMBER_GITHUB}/dsh-section-nav`,
    caseStudy: sectionNavCase,
  },
  {
    slug: 'dsh-autoupdate',
    title: 'DSH 安全自动更新插件',
    category: 'open-source',
    summary:
      '为本地 deepseek-harness 检出提供安全自动更新的状态面板与手动触发。同步走 git merge，绝不覆盖或重新克隆。',
    year: '2026',
    status: '已共享',
    techStack: ['JavaScript', 'DSH Plugin', 'PowerShell', 'Git'],
    featured: false,
    featuredRank: 7,
    visualKind: 'tool',
    githubUrl: `${MEMBER_GITHUB}/dsh-autoupdate`,
    caseStudy: autoupdateCase,
  },
  {
    slug: 'tfmy-cipher',
    title: '塔菲喵译',
    category: 'developer-tool',
    summary:
      '把文字按 UTF-8 → 二进制 → 语录字典映射成塔菲语录的加密/解密工具，纯前端实现。',
    year: '2026',
    status: '已部署',
    techStack: ['Vue 3', 'Vite', 'TailwindCSS'],
    featured: false,
    featuredRank: 8,
    visualKind: 'tool',
    githubUrl: `${MEMBER_GITHUB}/tfmy`,
    demoUrl: 'https://tfmy.vercel.app',
    caseStudy: tfmyCase,
  },
  {
    slug: 'jol-personal-site',
    title: '个人博客',
    category: 'developer-tool',
    summary:
      '26 届团长的个人博客：个人站点 monorepo，用于沉淀技术笔记与项目记录。',
    year: '2026',
    status: '已上线',
    techStack: ['Vue', 'Monorepo', 'Markdown'],
    featured: false,
    featuredRank: 9,
    visualKind: 'tool',
    githubUrl: `${MEMBER_GITHUB}/jol`,
    demoUrl: 'https://jol-ten.vercel.app',
    caseStudy: blogCase,
  },
]

/** Content revision stamp for archive header (local mock). */
export const PROJECTS_ARCHIVE_UPDATED = '2026-09'

export function getAllProjects(): Project[] {
  return [...projects].sort(
    (a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99),
  )
}

export function getFeaturedProjects(): Project[] {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
}

export function getProjectsByFilter(filter: ProjectFilterId): Project[] {
  return getAllProjects().filter((project) =>
    matchesProjectFilter(project, filter),
  )
}

export function getArchiveFeatured(filter: ProjectFilterId): Project | undefined {
  const list = getProjectsByFilter(filter)
  return list.find((project) => project.featured) ?? list[0]
}

export function getArchiveIndex(
  filter: ProjectFilterId,
  featuredSlug?: string,
): Project[] {
  return getProjectsByFilter(filter).filter(
    (project) => project.slug !== featuredSlug,
  )
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

/** Continue Exploring: same category first, then others; exclude self; take 2. */
export function getRelatedProjects(slug: string, limit = 2): Project[] {
  const current = getProjectBySlug(slug)
  if (!current) return []
  const others = getAllProjects().filter((project) => project.slug !== slug)
  const same = others.filter((project) => project.category === current.category)
  const rest = others.filter((project) => project.category !== current.category)
  return [...same, ...rest].slice(0, limit)
}

export function formatProjectMeta(project: Project): string {
  const parts = [
    getProjectCategoryLabel(project.category).toUpperCase(),
    project.year,
  ]
  if (project.status) parts.push(project.status.toUpperCase())
  return parts.join(' / ')
}

export function formatProjectTech(project: Project): string {
  return project.techStack.map((item) => item.toUpperCase()).join(' · ')
}
