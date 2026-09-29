# 学习资料目录

**当前状态：这两个目录是空的（只有 `.gitkeep`）。两条学习路径的资料全部是外部链接。**

## 为什么是空的

早期版本在这里规划了站内托管的 PDF / PPTX / PY 资料，并在
`explore-ai-resources.ts` / `explore-research-resources.ts` 里写了十几条
`toAssetPath('resources/...')` 形式的链接 —— 但文件从未真正上传。

结果是线上每一条点击都 404：目录里只有 `.gitkeep`，链接指向的文件不存在。

现在改为**全部使用外部权威链接**（PyTorch、D2L、CS231n、Stanford、Anthropic、
arXiv 等）。这样内容更权威，也不会因为缺少文件而失效。

## 新增一份资料

**优先选外部链接。** 在对应的 `*-resources.ts` 里补一条：

```ts
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
}
```

要点：

1. `stageId` 必须与对应内容文件里的阶段 id 一致，否则资料不会出现在阶段卡片里。
2. 想让它在阶段卡片里就近显示，加 `mustRead: true`（每个阶段最多显示 3 条）。
3. **外部链接必须加 `external: true`**，组件据此决定用新标签页打开。
4. 加进去之前先点一下确认可访问 —— 外链会随上游改版失效，建议定期抽查。

## 如果要托管站内文件

需要同时满足两个条件，缺一不可，否则就会重演上面的 404：

1. **文件真的放进目录**（`research/` 或 `ai/`），命名约定
   `<阶段 id>-<主题 slug>.<扩展名>`，例如
   `research/foundations-numpy-notes.pdf`。
2. `href` 用 `toAssetPath('resources/research/...')` 生成，**不要手写
   `/resources/...`** —— 该函数跟随 Vite 的 `base` 拼接，写死路径在 base
   变化时同样会在线上 404。

注意站内文件会随站点发布并**永久留在 git 历史里**：单个文件建议控制在
20 MB 以内，更大的资料改用外链。PPT/PPTX 无法在浏览器内预览，点击会触发
下载；若希望在线阅读，建议同时导出 PDF 版本并把 `href` 指向 PDF。
