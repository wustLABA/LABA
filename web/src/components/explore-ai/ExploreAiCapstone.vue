<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { aiCapstone } from '../../content/explore-ai'
</script>

<template>
  <section class="ai-capstone" aria-labelledby="ai-capstone-title">
    <p class="ai-capstone__eyebrow">{{ aiCapstone.eyebrow }}</p>
    <h2 id="ai-capstone-title" class="ai-capstone__title">
      {{ aiCapstone.title }}
    </h2>
    <p class="ai-capstone__lede">{{ aiCapstone.lede }}</p>
    <p class="ai-capstone__note">{{ aiCapstone.note }}</p>

    <div class="ai-capstone__links">
      <RouterLink class="ai-capstone__link" to="/projects">
        <span class="ai-capstone__link-eyebrow">查看作品</span>
        <span class="ai-capstone__link-title">作品档案</span>
      </RouterLink>
      <RouterLink class="ai-capstone__link" to="/explore">
        <span class="ai-capstone__link-eyebrow">或者重新选择</span>
        <span class="ai-capstone__link-title">返回学习地图</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.ai-capstone {
  display: grid;
  gap: var(--space-4);
  padding-top: var(--space-2);
}

.ai-capstone__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.ai-capstone__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3.4vw, var(--text-4xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.ai-capstone__lede,
.ai-capstone__note {
  margin: 0;
  max-width: 38rem;
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.ai-capstone__note {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.ai-capstone__links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.ai-capstone__link {
  display: grid;
  gap: var(--space-2);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
  color: inherit;
  text-decoration: none;
}

.ai-capstone__link:focus-visible {
  outline: var(--border-focus);
  outline-offset: 4px;
}

.ai-capstone__link-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.ai-capstone__link-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
}

.ai-capstone__link:hover .ai-capstone__link-title,
.ai-capstone__link:focus-visible .ai-capstone__link-title {
  color: var(--color-sky);
}

@media (max-width: 720px) {
  .ai-capstone__title {
    max-width: none;
  }

  .ai-capstone__links {
    grid-template-columns: 1fr;
  }
}
</style>
