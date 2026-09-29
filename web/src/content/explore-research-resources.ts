/**
 * 深度学习 / 科研路径的学习资料。
 *
 * 阶段 id 对应 explore-research.ts 的 ResearchStageId。
 *
 * 这里全部使用外部权威链接，不指向站内文件。
 *
 * 原因：本文件早期版本用了 8 条 toAssetPath('resources/research/*.pdf|pptx|py')
 * 形式的站内链接，但 public/resources/ 下只有 .gitkeep，文件从未上传，
 * 导致线上每一条点击都 404。站内托管需要有人持续产出并维护，
 * 目前没有这个条件，因此改为指向公认的高质量公开资料。
 *
 * 选材原则：优先官方文档与经典教材（PyTorch/D2L/CS231n/Stanford），
 * 而不是零散博客 —— 前者长期可访问，且质量有保证。
 *
 * 新增资料时优先选外部链接，并确保 URL 可访问（链接会随上游改版失效，
 * 建议定期抽查）。
 */

import type { LearningResource } from './resources'

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
    id: 'foundations-numpy-broadcasting',
    stageId: 'foundations',
    title: 'NumPy 广播机制（官方文档）',
    note: '写训练循环时最常踩的 shape 与广播问题，官方文档讲得最准确。看这一节比搜博客省事。',
    kind: 'link',
    href: 'https://numpy.org/doc/stable/user/basics.broadcasting.html',
    source: 'NumPy 官方',
    level: '入门',
    duration: '约 15 分钟',
    external: true,
  },
  {
    id: 'foundations-d2l-preliminaries',
    stageId: 'foundations',
    title: '动手学深度学习 · 预备知识',
    note: '中文教材里少见的「能跑起来」的一本。预备知识章节把张量、自动求导、线性代数用代码讲一遍。',
    kind: 'link',
    href: 'https://d2l.ai/chapter_preliminaries/index.html',
    source: 'D2L（李沐等）',
    level: '入门',
    duration: '约 2 小时',
    external: true,
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
    id: 'modeling-attention-original',
    stageId: 'modeling',
    title: 'Attention Is All You Need（原论文）',
    note: 'Transformer 的原始论文。图解看懂了再回来读，重点看第 3 节的结构设计与消融实验。',
    kind: 'link',
    href: 'https://arxiv.org/abs/1706.03762',
    source: 'Vaswani et al., 2017',
    level: '进阶',
    duration: '约 1 小时',
    external: true,
  },
  {
    id: 'modeling-lilian-weng-attention',
    stageId: 'modeling',
    title: 'Attention? Attention!（综述）',
    note: '把各种注意力变体串成一条线：从软/硬注意力到自注意力。适合建立全局认识。',
    kind: 'link',
    href: 'https://lilianweng.github.io/posts/2018-06-24-attention/',
    source: 'Lilian Weng',
    level: '深入',
    duration: '约 50 分钟',
    external: true,
  },
  {
    id: 'modeling-cs231n-backprop',
    stageId: 'modeling',
    title: 'CS231n · 反向传播与神经网络',
    note: '斯坦福经典课程笔记。讲清反向传播的计算图视角 —— 这是「知道模型实际在做什么」的基础。',
    kind: 'link',
    href: 'https://cs231n.github.io/neural-networks-1/',
    source: 'Stanford CS231n',
    level: '进阶',
    duration: '约 1 小时',
    external: true,
  },

  // ── 03 读论文 ──────────────────────────────────────────────────────────
  {
    id: 'reading-how-to-read-paper',
    stageId: 'reading',
    title: 'How to Read a Paper（三遍读论文法）',
    note: '把一篇论文拆成「鸟瞰 → 抓主干 → 抠细节」三遍。解决「读完就忘、不知道重点在哪」。',
    kind: 'link',
    href: 'https://www.cs.jhu.edu/~jason/advice/how-to-read-a-paper.html',
    source: 'S. Keshav',
    level: '入门',
    duration: '约 20 分钟',
    mustRead: true,
    external: true,
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
  {
    id: 'reading-papers-we-love',
    stageId: 'reading',
    title: 'Papers We Love',
    note: '不只是深度学习 —— 计算机各领域的经典论文导读。用来训练「如何读一篇不属于自己方向的论文」。',
    kind: 'link',
    href: 'https://github.com/papers-we-love/papers-we-love',
    source: 'Papers We Love',
    level: '深入',
    external: true,
  },

  // ── 04 复现 ────────────────────────────────────────────────────────────
  {
    id: 'reproduction-checklist',
    stageId: 'reproduction',
    title: '复现检查清单（McGill 版）',
    note: '随机种子、环境、数据划分、指标口径 —— 四类最容易导致「复现不出来」的差异，逐项核对。',
    kind: 'link',
    href: 'https://www.cs.mcgill.ca/~jpineau/ReproducibilityChecklist.pdf',
    source: 'Joelle Pineau',
    level: '进阶',
    duration: '约 15 分钟',
    mustRead: true,
    external: true,
  },
  {
    id: 'reproduction-pytorch-randomness',
    stageId: 'reproduction',
    title: 'PyTorch 随机性控制',
    note: '官方说明哪些操作会引入随机性、种子该怎么设。复现失败时先查这里，能排除一大半原因。',
    kind: 'link',
    href: 'https://pytorch.org/docs/stable/notes/randomness.html',
    source: 'PyTorch 官方',
    level: '进阶',
    duration: '约 20 分钟',
    external: true,
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
    id: 'experiment-tensorboard',
    stageId: 'experiment',
    title: 'TensorBoard 官方文档',
    note: '最轻量的实验可视化起点，PyTorch 原生支持。只看 scalars 与 graphs 两节就够开始用。',
    kind: 'link',
    href: 'https://www.tensorflow.org/tensorboard',
    source: 'TensorFlow 官方',
    level: '入门',
    duration: '约 30 分钟',
    external: true,
  },
  {
    id: 'experiment-mlflow',
    stageId: 'experiment',
    title: 'MLflow 官方文档',
    note: '实验追踪 + 模型管理。当消融实验多到用表格记不住时，就该上它了。',
    kind: 'link',
    href: 'https://mlflow.org/docs/latest/index.html',
    source: 'MLflow',
    level: '进阶',
    duration: '约 40 分钟',
    external: true,
  },
  {
    id: 'experiment-neurips-checklist',
    stageId: 'experiment',
    title: 'NeurIPS 论文检查清单',
    note: '顶会要求作者逐项回答的问题（数据、算力、局限、复现细节）。用它反查自己的实验记录是否完整。',
    kind: 'link',
    href: 'https://neurips.cc/public/guides/PaperChecklist',
    source: 'NeurIPS',
    level: '深入',
    duration: '约 25 分钟',
    external: true,
  },

  // ── 06 科研 ────────────────────────────────────────────────────────────
  {
    id: 'research-cs224n',
    stageId: 'research',
    title: 'Stanford CS224n：NLP 与深度学习',
    note: '课程主页含讲义、作业与阅读清单。想找一个方向深入时，跟着一门完整课程走比零散看博客有效得多。',
    kind: 'link',
    href: 'https://web.stanford.edu/class/cs224n/',
    source: 'Stanford',
    level: '深入',
    duration: '按需',
    mustRead: true,
    external: true,
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
  {
    id: 'research-icml-guidelines',
    stageId: 'research',
    title: 'ICML 投稿指南',
    note: '顶会对论文结构、可复现性声明、补充材料的具体要求。写之前先看清规则，避免形式性拒稿。',
    kind: 'link',
    href: 'https://icml.cc/Conferences/2024/PaperGuidelines',
    source: 'ICML',
    level: '深入',
    external: true,
  },
]
