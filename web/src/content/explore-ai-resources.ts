/**
 * AI 工程路径的学习资料。
 *
 * 阶段 id 对应 explore-ai.ts 的 AiStageId。
 * 文件资源放在 web/public/resources/ai/<stage>-<slug>.<ext>。
 *
 * 注意：本文件的阶段 id 与深度学习路径有重名（都含 foundations），
 * 因此两份资料必须分开维护，不能合并成一个池子按 stageId 混筛。
 */

import { toAssetPath, type LearningResource } from './resources'

export const aiResources: LearningResource[] = [
  // ── 01 基础 ────────────────────────────────────────────────────────────
  {
    id: 'foundations-git-guide',
    stageId: 'foundations',
    title: 'Git 简明指南',
    note: '只讲工程里真正会用到的部分：分支、提交粒度、如何让别人沿着你的记录走。',
    kind: 'pdf',
    href: toAssetPath('resources/ai/foundations-git-guide.pdf'),
    source: 'LABA 整理',
    level: '入门',
    duration: '约 30 分钟',
    mustRead: true,
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
    id: 'foundations-read-stacktrace',
    stageId: 'foundations',
    title: '读懂报错：一次排查实录（PPT）',
    note: '拿一个真实的报错栈逐步定位，演示「靠读错误修 bug」而不是靠猜或反复试。',
    kind: 'ppt',
    href: toAssetPath('resources/ai/foundations-read-stacktrace.pptx'),
    source: 'LABA',
    level: '入门',
    duration: '约 20 分钟',
  },

  // ── 02 AI 原生编码 ─────────────────────────────────────────────────────
  {
    id: 'ai-native-coding-workflow',
    stageId: 'ai-native-coding',
    title: 'AI 结对编程工作流',
    note: '何时该让模型写、何时必须自己审。含审查清单，避免把错误无声地合进仓库。',
    kind: 'pdf',
    href: toAssetPath('resources/ai/ai-native-coding-workflow.pdf'),
    source: 'LABA 整理',
    level: '进阶',
    duration: '约 35 分钟',
    mustRead: true,
  },
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
    id: 'agent-systems-tool-design',
    stageId: 'agent-systems',
    title: '工具调用：设计给模型用的接口',
    note: '工具的参数命名、错误返回、粒度如何影响模型的实际成功率。含正反例对照。',
    kind: 'pdf',
    href: toAssetPath('resources/ai/agent-systems-tool-design.pdf'),
    source: 'LABA 整理',
    level: '进阶',
    duration: '约 25 分钟',
  },
  {
    id: 'agent-systems-memory-patterns',
    stageId: 'agent-systems',
    title: 'Agent 记忆模式（PPT）',
    note: '短期上下文、长期存储、检索式记忆三种方案的取舍与典型失败场景。',
    kind: 'ppt',
    href: toAssetPath('resources/ai/agent-systems-memory-patterns.pptx'),
    source: 'LABA',
    level: '深入',
  },

  // ── 04 RAG 与 MCP ──────────────────────────────────────────────────────
  {
    id: 'rag-mcp-rag-survey',
    stageId: 'rag-mcp',
    title: 'RAG 实践要点',
    note: '分块、嵌入、重排三步里最容易做错的地方，以及怎么判断检索质量够不够。',
    kind: 'pdf',
    href: toAssetPath('resources/ai/rag-mcp-rag-survey.pdf'),
    source: 'LABA 整理',
    level: '进阶',
    duration: '约 40 分钟',
    mustRead: true,
  },
  {
    id: 'rag-mcp-spec',
    stageId: 'rag-mcp',
    title: 'Model Context Protocol 规范',
    note: 'MCP 的官方规范。想自己写一个 server 前必读，重点是资源与工具的边界。',
    kind: 'link',
    href: 'https://modelcontextprotocol.io/',
    source: 'Anthropic / MCP',
    level: '深入',
    external: true,
  },

  // ── 05 工作流与评估 ────────────────────────────────────────────────────
  {
    id: 'workflow-eval-eval-guide',
    stageId: 'workflow-eval',
    title: '如何评估一个 LLM 应用',
    note: '没有评估就没有迭代。讲清离线集、人工标注、线上指标三者怎么配合。',
    kind: 'pdf',
    href: toAssetPath('resources/ai/workflow-eval-eval-guide.pdf'),
    source: 'LABA 整理',
    level: '进阶',
    duration: '约 35 分钟',
    mustRead: true,
  },
  {
    id: 'workflow-eval-langsmith',
    stageId: 'workflow-eval',
    title: 'LangSmith 评估文档',
    note: '一个可直接上手的评估工具，用于观察真实调用链并建立回归测试。',
    kind: 'link',
    href: 'https://docs.smith.langchain.com/',
    source: 'LangChain',
    level: '进阶',
    external: true,
  },

  // ── 06 交付 ────────────────────────────────────────────────────────────
  {
    id: 'ship-deploy-checklist',
    stageId: 'ship',
    title: '上线检查清单',
    note: '密钥管理、成本上限、失败兜底、日志 —— 交付给别人用之前必须逐项确认。',
    kind: 'pdf',
    href: toAssetPath('resources/ai/ship-deploy-checklist.pdf'),
    source: 'LABA 整理',
    level: '进阶',
    duration: '约 20 分钟',
    mustRead: true,
  },
  {
    id: 'ship-github-actions',
    stageId: 'ship',
    title: 'GitHub Actions 自动部署',
    note: '本站点用的就是这套流程。可作为你自己的项目模板直接复用。',
    kind: 'link',
    href: 'https://docs.github.com/en/actions',
    source: 'GitHub 官方',
    level: '进阶',
    external: true,
  },
]
