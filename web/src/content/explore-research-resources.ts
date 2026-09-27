/**
 * 深度学习 / 科研路径的学习资料。
 *
 * 阶段 id 对应 explore-research.ts 的 ResearchStageId。
 * 文件资源放在 web/public/resources/research/<stage>-<slug>.<ext>，
 * 目录按「路径 / 阶段-主题」分层，便于从文件名直接看出归属。
 *
 * 新增资料时：
 *   1. 把文件放进 public/resources/research/ 对应阶段下
 *   2. 在下面数组里补一条，href 用 toAssetPath('resources/research/...')
 *   3. 想让它出现在阶段卡片里就加 mustRead: true
 */

import { toAssetPath, type LearningResource } from './resources'

export const deepLearningResources: LearningResource[] = [
  // ── 01 基础 ────────────────────────────────────────────────────────────
  {
    id: 'foundations-pytorch-basics',
    stageId: 'foundations',
    title: 'PyTorch 官方教程：60 分钟入门',
    note: '从张量到训练循环的最短路径。照着敲一遍，先建立「一次完整训练长什么样」的直觉。',
    kind: 'link',
    href: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
    source: 'PyTorch 官方',
    level: '入门',
    duration: '约 60 分钟',
    mustRead: true,
    external: true,
  },
  {
    id: 'foundations-numpy-notes',
    stageId: 'foundations',
    title: 'NumPy 速查笔记（本站整理）',
    note: '写训练循环时最常踩的广播、shape、dtype 三类问题，一页讲清。',
    kind: 'pdf',
    href: toAssetPath('resources/research/foundations-numpy-notes.pdf'),
    source: 'LABA 整理',
    level: '入门',
    duration: '约 15 分钟',
  },
  {
    id: 'foundations-training-loop',
    stageId: 'foundations',
    title: '手写一个最小训练循环（代码模板）',
    note: '数据集、模型、损失、优化器、训练/评估循环五件套，可直接作为你自己项目的起点。',
    kind: 'code',
    href: toAssetPath('resources/research/foundations-training-loop.py'),
    source: 'LABA',
    level: '入门',
  },

  // ── 02 建模 ────────────────────────────────────────────────────────────
  {
    id: 'modeling-attention-illustrated',
    stageId: 'modeling',
    title: 'The Illustrated Transformer',
    note: '理解注意力机制最经典的一篇图解。看完你能说出 Q/K/V 各自在做什么、为什么需要多头。',
    kind: 'link',
    href: 'https://jalammar.github.io/illustrated-transformer/',
    source: 'Jay Alammar',
    level: '进阶',
    duration: '约 40 分钟',
    mustRead: true,
    external: true,
  },
  {
    id: 'modeling-inductive-bias',
    stageId: 'modeling',
    title: '归纳偏置：为什么结构本身就是一种假设',
    note: '讲清 CNN 的局部性与 Transformer 的置换不变性分别假设了什么 —— 这是「说出模型假设」的起点。',
    kind: 'pdf',
    href: toAssetPath('resources/research/modeling-inductive-bias.pdf'),
    source: 'LABA 整理',
    level: '进阶',
    duration: '约 25 分钟',
  },

  // ── 03 读论文 ──────────────────────────────────────────────────────────
  {
    id: 'reading-three-pass',
    stageId: 'reading',
    title: '三遍读论文法',
    note: '把一篇论文拆成「鸟瞰 → 抓主干 → 抠细节」三遍。解决「读完就忘、不知道重点在哪」。',
    kind: 'pdf',
    href: toAssetPath('resources/research/reading-three-pass.pdf'),
    source: 'S. Keshav / LABA 译注',
    level: '入门',
    duration: '约 20 分钟',
    mustRead: true,
  },
  {
    id: 'reading-paper-list',
    stageId: 'reading',
    title: '深度学习必读论文清单',
    note: '按主题分组，每条标注了「为什么值得读」和前置知识，避免盲目从 ResNet 开始啃。',
    kind: 'link',
    href: 'https://github.com/terryum/awesome-deep-learning-papers',
    source: '社区维护',
    level: '进阶',
    external: true,
  },

  // ── 04 复现 ────────────────────────────────────────────────────────────
  {
    id: 'reproduction-checklist',
    stageId: 'reproduction',
    title: '复现检查清单',
    note: '随机种子、环境、数据划分、指标口径 —— 四类最容易导致「复现不出来」的差异，逐项核对。',
    kind: 'pdf',
    href: toAssetPath('resources/research/reproduction-checklist.pdf'),
    source: 'LABA 整理',
    level: '进阶',
    duration: '约 15 分钟',
    mustRead: true,
  },
  {
    id: 'reproduction-reproducibility-guide',
    stageId: 'reproduction',
    title: 'Papers with Code：复现资源索引',
    note: '先查这里有没有官方实现，能省掉大量从零搭结构的时间。',
    kind: 'link',
    href: 'https://paperswithcode.com/',
    source: 'Papers with Code',
    level: '入门',
    external: true,
  },

  // ── 05 实验 ────────────────────────────────────────────────────────────
  {
    id: 'experiment-ablation-template',
    stageId: 'experiment',
    title: '消融实验记录模板',
    note: '只改一处、其余冻结，用固定表格记录配置与指标。避免「改了三处，不知道哪处起作用」。',
    kind: 'ppt',
    href: toAssetPath('resources/research/experiment-ablation-template.pptx'),
    source: 'LABA',
    level: '进阶',
  },
  {
    id: 'experiment-tracking-tools',
    stageId: 'experiment',
    title: '实验追踪工具对比',
    note: 'TensorBoard / Weights & Biases / MLflow 的取舍，重点讲各自适合什么规模的实验。',
    kind: 'pdf',
    href: toAssetPath('resources/research/experiment-tracking-tools.pdf'),
    source: 'LABA 整理',
    level: '入门',
    duration: '约 20 分钟',
  },

  // ── 06 科研 ────────────────────────────────────────────────────────────
  {
    id: 'research-paper-writing',
    stageId: 'research',
    title: '如何写一篇能被读懂的论文',
    note: '从「提出一个值得验证的问题」倒推结构：问题 → 假设 → 证据 → 局限。',
    kind: 'pdf',
    href: toAssetPath('resources/research/research-paper-writing.pdf'),
    source: 'LABA 整理',
    level: '深入',
    duration: '约 30 分钟',
    mustRead: true,
  },
  {
    id: 'research-openreview',
    stageId: 'research',
    title: 'OpenReview：看真实的评审意见',
    note: '读别人的投稿与 rebuttal，比读任何写作指南都更能理解「什么算有说服力的证据」。',
    kind: 'link',
    href: 'https://openreview.net/',
    source: 'OpenReview',
    level: '深入',
    external: true,
  },
]
