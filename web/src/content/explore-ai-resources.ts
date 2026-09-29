/**
 * AI 工程路径的学习资料。
 *
 * 阶段 id 对应 explore-ai.ts 的 AiStageId。
 *
 * 这里全部使用外部权威链接，不指向站内文件。
 *
 * 原因：本文件早期版本用了 15 条 toAssetPath('resources/ai/*.pdf|pptx')
 * 形式的站内链接，但 public/resources/ 下只有 .gitkeep，文件从未上传，
 * 导致线上每一条点击都 404。站内托管 PDF/PPTX 需要有人持续产出并维护，
 * 目前没有这个条件，因此改为「指向公认的高质量公开资料」—— 内容更权威，
 * 也不会因为缺少文件而失效。
 *
 * 新增资料时优先选外部链接，并确保 URL 可访问（链接会随上游改版失效，
 * 建议定期抽查）。
 *
 * 注意：本文件的阶段 id 与深度学习路径有重名（都含 foundations），
 * 因此两份资料必须分开维护，不能合并成一个池子按 stageId 混筛。
 */

import type { LearningResource } from './resources'

export const aiResources: LearningResource[] = [
  // ── 01 基础 ────────────────────────────────────────────────────────────
  {
    id: 'foundations-pro-git',
    stageId: 'foundations',
    title: 'Pro Git（中文版）',
    note: 'Git 官方推荐的权威教材。只读第 2、3 章即可覆盖工程里真正会用到的部分：分支、合并、提交粒度。',
    kind: 'link',
    href: 'https://git-scm.com/book/zh/v2',
    source: 'git-scm.com',
    level: '入门',
    duration: '按需查阅',
    mustRead: true,
    external: true,
  },
  {
    id: 'foundations-prompt-engineering',
    stageId: 'foundations',
    title: 'Prompt 工程：从模糊目标到可检验步骤',
    note: '把「让 AI 帮我做点事」拆成可验证的指令。重点是结构化约束，不是堆形容词。',
    kind: 'link',
    href: 'https://platform.openai.com/docs/guides/prompt-engineering',
    source: 'OpenAI 官方',
    level: '入门',
    duration: '约 25 分钟',
    mustRead: true,
    external: true,
  },
  {
    id: 'foundations-prompting-guide',
    stageId: 'foundations',
    title: '提示工程指南（中文）',
    note: '社区维护的系统性提示技巧合集，比零散博客完整。适合在官方文档之外补充实战技巧。',
    kind: 'link',
    href: 'https://www.promptingguide.ai/zh',
    source: 'DAIR.AI',
    level: '入门',
    duration: '按需查阅',
    external: true,
  },
  {
    id: 'foundations-learn-git-branching',
    stageId: 'foundations',
    title: 'Learn Git Branching（交互式练习）',
    note: '在浏览器里用可视化方式练分支操作，比看文档更快建立直觉。卡在 rebase 上时来刷几关。',
    kind: 'link',
    href: 'https://learngitbranching.js.org/',
    source: 'Peter Cottle',
    level: '入门',
    duration: '约 1 小时',
    external: true,
  },

  // ── 02 AI 原生编码 ─────────────────────────────────────────────────────
  {
    id: 'ai-native-coding-cursor-docs',
    stageId: 'ai-native-coding',
    title: 'Cursor 官方文档',
    note: '了解编辑器原生 AI 能力的边界 —— 哪些操作可靠，哪些仍需要人工兜底。',
    kind: 'link',
    href: 'https://docs.cursor.com/',
    source: 'Cursor',
    level: '入门',
    external: true,
  },
  {
    id: 'ai-native-coding-github-flow',
    stageId: 'ai-native-coding',
    title: 'GitHub 入门文档（中文）',
    note: '仓库、分支、Pull Request 的标准协作流程。AI 帮你写完代码之后，这一步决定改动能不能被安全地合入。',
    kind: 'link',
    href: 'https://docs.github.com/zh/get-started',
    source: 'GitHub 官方',
    level: '入门',
    duration: '约 30 分钟',
    external: true,
  },

  // ── 03 Agent 系统 ──────────────────────────────────────────────────────
  {
    id: 'agent-systems-building-effective',
    stageId: 'agent-systems',
    title: 'Building Effective Agents',
    note: 'Anthropic 的工程实践总结。核心观点：能用一个循环解决的，不要上多智能体。',
    kind: 'link',
    href: 'https://www.anthropic.com/engineering/building-effective-agents',
    source: 'Anthropic',
    level: '进阶',
    duration: '约 30 分钟',
    mustRead: true,
    external: true,
  },
  {
    id: 'agent-systems-langchain-agents',
    stageId: 'agent-systems',
    title: 'LangChain Agents 教程',
    note: '把工具调用真正跑起来的可执行示例。看代码比看概念更快理解「循环 + 工具」到底怎么落地。',
    kind: 'link',
    href: 'https://python.langchain.com/docs/tutorials/agents/',
    source: 'LangChain',
    level: '进阶',
    duration: '约 40 分钟',
    external: true,
  },

  // ── 04 RAG 与 MCP ──────────────────────────────────────────────────────
  {
    id: 'rag-mcp-langchain-rag',
    stageId: 'rag-mcp',
    title: 'LangChain RAG 教程',
    note: '分块、嵌入、检索、生成的完整流水线示例。先跑通再优化，避免一上来就调参。',
    kind: 'link',
    href: 'https://python.langchain.com/docs/tutorials/rag/',
    source: 'LangChain',
    level: '进阶',
    duration: '约 40 分钟',
    mustRead: true,
    external: true,
  },
  {
    id: 'rag-mcp-spec',
    stageId: 'rag-mcp',
    title: 'Model Context Protocol 规范',
    note: 'MCP 的官方规范。想自己写一个 server 前必读，重点是资源与工具的边界。',
    kind: 'link',
    href: 'https://modelcontextprotocol.io/introduction',
    source: 'Anthropic / MCP',
    level: '深入',
    duration: '按需查阅',
    external: true,
  },
  {
    id: 'rag-mcp-ragas',
    stageId: 'rag-mcp',
    title: 'RAGAS：检索质量评估',
    note: '专为 RAG 设计的评估框架。回答「我的检索到底够不够好」，而不是凭感觉判断。',
    kind: 'link',
    href: 'https://docs.ragas.io/',
    source: 'RAGAS',
    level: '深入',
    external: true,
  },

  // ── 05 工作流与评估 ────────────────────────────────────────────────────
  {
    id: 'workflow-eval-langsmith',
    stageId: 'workflow-eval',
    title: 'LangSmith 评估文档',
    note: '一个可直接上手的评估工具，用于观察真实调用链并建立回归测试。',
    kind: 'link',
    href: 'https://docs.smith.langchain.com/evaluation',
    source: 'LangChain',
    level: '进阶',
    mustRead: true,
    external: true,
  },
  {
    id: 'workflow-eval-twelve-factor',
    stageId: 'workflow-eval',
    title: 'The Twelve-Factor App（中文）',
    note: '配置、日志、依赖、环境一致性的经典原则。LLM 应用同样适用，尤其是「配置与代码分离」。',
    kind: 'link',
    href: 'https://12factor.net/zh_cn/',
    source: 'Adam Wiggins',
    level: '进阶',
    duration: '约 30 分钟',
    external: true,
  },

  // ── 06 交付 ────────────────────────────────────────────────────────────
  {
    id: 'ship-github-actions',
    stageId: 'ship',
    title: 'GitHub Actions 自动部署',
    note: '本站点用的就是这套流程。可作为你自己的项目模板直接复用。',
    kind: 'link',
    href: 'https://docs.github.com/en/actions',
    source: 'GitHub 官方',
    level: '进阶',
    duration: '按需查阅',
    mustRead: true,
    external: true,
  },
]
