# 学习资料目录

本站两条学习路径的资料文件放在这里。

- `research/` —— 深度学习 / 科研路径（对应 `web/src/content/explore-research-resources.ts`）
- `ai/` —— AI 工程路径（对应 `web/src/content/explore-ai-resources.ts`）

## 命名约定

```
<阶段 id>-<主题 slug>.<扩展名>
```

例：`research/foundations-numpy-notes.pdf`、`ai/agent-systems-memory-patterns.pptx`

阶段 id 必须与内容文件里的 `stageId` 一致，这样从文件名就能看出归属，
排查「某个阶段怎么没资料」时不用翻代码。

## 新增一份资料的步骤

1. 把文件放进对应路径的阶段目录下，按上面的约定命名。
2. 在对应的 `*-resources.ts` 里补一条记录：

   ```ts
   {
     id: 'foundations-numpy-notes',
     stageId: 'foundations',
     title: 'NumPy 速查笔记',
     note: '写训练循环时最常踩的广播、shape、dtype 三类问题，一页讲清。',
     kind: 'pdf',
     href: toAssetPath('resources/research/foundations-numpy-notes.pdf'),
     source: 'LABA 整理',
     level: '入门',
     duration: '约 15 分钟',
   }
   ```

3. 想让它在阶段卡片里就近显示，加 `mustRead: true`（每个阶段最多显示 3 条）。

`href` 一律用 `toAssetPath()` 生成，不要手写 `/LABA/...` 或 `/resources/...`：
站点部署在 GitHub Pages 的项目页下，硬编码根路径会在线上 404。

## 注意

- 这两个目录里的文件会随站点一起发布，并且**永久留在 git 历史里**。
  单个文件建议控制在 20 MB 以内；更大的资料改用外链（`kind: 'link'`）。
- PPT/PPTX 无法在浏览器内预览，点击会触发下载。若希望在线阅读，
  建议同时导出 PDF 版本，把 `href` 指向 PDF。
