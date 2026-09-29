<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { researchCapstone } from '../../content/explore-research'
</script>

<template>
  <section class="research-capstone" aria-labelledby="research-capstone-title">
    <p class="research-capstone__eyebrow">{{ researchCapstone.eyebrow }}</p>
    <h2 id="research-capstone-title" class="research-capstone__title">
      {{ researchCapstone.title }}
    </h2>
    <p class="research-capstone__lede">{{ researchCapstone.lede }}</p>
    <p class="research-capstone__note">{{ researchCapstone.note }}</p>

    <div class="research-capstone__links">
      <RouterLink class="research-capstone__link" to="/projects">
        <span class="research-capstone__link-eyebrow">查看作品</span>
        <span class="research-capstone__link-title">作品档案</span>
      </RouterLink>
      <RouterLink class="research-capstone__link" to="/explore">
        <span class="research-capstone__link-eyebrow">或者重新选择</span>
        <span class="research-capstone__link-title">返回学习地图</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.research-capstone {
  display: grid;
  gap: var(--space-4);
  padding-top: var(--space-2);
}

.research-capstone__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.research-capstone__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3.4vw, var(--text-4xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-hero);
}

.research-capstone__lede,
.research-capstone__note {
  margin: 0;
  max-width: 40rem;
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.research-capstone__note {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.research-capstone__links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.research-capstone__link {
  display: grid;
  gap: var(--space-2);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
  color: inherit;
  text-decoration: none;
}

.research-capstone__link:focus-visible {
  outline: var(--border-focus);
  outline-offset: 4px;
}

.research-capstone__link-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.research-capstone__link-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
}

.research-capstone__link:hover .research-capstone__link-title,
.research-capstone__link:focus-visible .research-capstone__link-title {
  color: var(--color-sky);
}

@media (max-width: 720px) {
  .research-capstone__title {
    max-width: none;
  }

  .research-capstone__links {
    grid-template-columns: 1fr;
  }
}
</style>
