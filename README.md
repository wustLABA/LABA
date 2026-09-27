# LABA — Learn AI. Build AI.

武汉科技大学 LABA 品牌官网（Frontend）。

**在线预览：** https://baidu.wust.club/（备用地址：https://wustlaba.github.io/LABA/）

LABA —— Learn AI, Build AI. 武汉科技大学百度飞桨社团，跟同学们一起学习深度学习，一起学习如何更好的使用 AI，让想要保研的同学能够更好的准备科研，让想要工作就业的同学能够更好的使用 AI 增加做事效率、提高竞争力。

## 本地开发

```bash
cd web
npm install
npm run dev
```

## 构建

```bash
cd web
npm run build
```

## 部署

站点由 `gh-pages` 分支提供，`main` 是源码分支。

推送到 `main` 时，`pre-push` hook 会自动构建前端并把产物发布到 `gh-pages` 分支，推送后约 1 分钟生效。日常只需：

```bash
git push
```

Hook 脚本存放在仓库内的 `.githooks/pre-push`（纳入版本控制），通过 `core.hooksPath` 启用。新克隆的仓库执行一次即可：

```bash
git config core.hooksPath .githooks
```

这样 hook 会跟随 `git pull` 自动更新，无需手工拷贝。`.git/hooks/pre-push` 保留了一份同样的副本作为兜底，仅在 `core.hooksPath` 未设置时生效。

手动兜底：`cd web && npm run build`，把 `dist/` 的内容推送到 `gh-pages` 分支根目录，并将 `index.html` 复制为 `404.html`（SPA 深链回退）。

## 仓库结构

- `web/` — Vue 3 + Vite 前端（Pages 部署源）
- `backend/` — Go API（Pages 不部署后端）
- `docs/` — 产品 / 架构 / API 文档

## License

见仓库根目录 `LICENSE`。
