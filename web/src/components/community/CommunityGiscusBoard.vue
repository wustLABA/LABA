<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { communityAsk } from '../../content/community'

const route = useRoute()
const host = ref<HTMLElement | null>(null)

/**
 * giscus.app 配置。
 *
 * 仓库账号是 wustLABA；jolaaa999 是改名前的旧用户名，GitHub 重命名后
 * repo ID（node_id）保持不变，因此 repoId 无需随之更改。
 */
const GISCUS = {
  repo: 'wustLABA/LABA',
  repoId: 'R_kgDOUeoLpw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOUeoLp84DF2V-',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  theme: 'noborder_light',
  lang: 'zh-CN',
} as const

function mountGiscus() {
  const el = host.value
  if (!el) return
  el.replaceChildren()

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', GISCUS.repo)
  script.setAttribute('data-repo-id', GISCUS.repoId)
  script.setAttribute('data-category', GISCUS.category)
  script.setAttribute('data-category-id', GISCUS.categoryId)
  script.setAttribute('data-mapping', GISCUS.mapping)
  script.setAttribute('data-strict', GISCUS.strict)
  script.setAttribute('data-reactions-enabled', GISCUS.reactionsEnabled)
  script.setAttribute('data-emit-metadata', GISCUS.emitMetadata)
  script.setAttribute('data-input-position', GISCUS.inputPosition)
  script.setAttribute('data-theme', GISCUS.theme)
  script.setAttribute('data-lang', GISCUS.lang)
  el.appendChild(script)
}

onMounted(async () => {
  await nextTick()
  mountGiscus()
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    mountGiscus()
  },
)

onBeforeUnmount(() => {
  host.value?.replaceChildren()
})
</script>

<template>
  <section class="giscus-board" aria-labelledby="giscus-board-title">
    <header class="giscus-board__header">
      <p class="giscus-board__eyebrow">{{ communityAsk.eyebrow }}</p>
      <h1 id="giscus-board-title" class="giscus-board__title">{{ communityAsk.title }}</h1>
      <p class="giscus-board__lede">
        在本页直接留言与回复。使用 GitHub 账号登录（由
        <a href="https://giscus.app" target="_blank" rel="noopener noreferrer">giscus</a>
        提供），无需本站后端常开。
      </p>
      <p class="giscus-board__hint">
        首次评论前，仓库维护者需安装
        <a
          href="https://github.com/apps/giscus"
          target="_blank"
          rel="noopener noreferrer"
        >giscus GitHub App</a>
        并勾选本仓库。也可在
        <a :href="communityAsk.browseUrl" target="_blank" rel="noopener noreferrer">
          Discussions
        </a>
        浏览全部话题。
      </p>
    </header>

    <div ref="host" class="giscus-board__host giscus" />
  </section>
</template>

<style scoped>
.giscus-board {
  display: grid;
  gap: var(--space-5);
  padding-block: var(--space-6);
  border-block: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.giscus-board__header {
  display: grid;
  gap: var(--space-3);
  max-width: 40rem;
}

.giscus-board__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.giscus-board__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-hero);
}

.giscus-board__lede,
.giscus-board__hint {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.giscus-board__hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.giscus-board__lede a,
.giscus-board__hint a {
  color: var(--color-mountain);
  font-weight: 600;
  text-decoration: none;
}

.giscus-board__lede a:hover,
.giscus-board__hint a:hover {
  color: var(--color-sky);
}

.giscus-board__host {
  min-height: 12rem;
  width: 100%;
}

.giscus-board__host :deep(.giscus),
.giscus-board__host :deep(.giscus-frame) {
  width: 100%;
}
</style>
