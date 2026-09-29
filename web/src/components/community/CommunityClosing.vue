<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { communityClosing } from '../../content/community'
import AuroraButton from '../ui/AuroraButton.vue'
</script>

<template>
  <section class="community-closing" aria-labelledby="community-closing-title">
    <p class="community-closing__eyebrow">{{ communityClosing.eyebrow }}</p>
    <h2 id="community-closing-title" class="community-closing__title">
      {{ communityClosing.title }}
    </h2>
    <p class="community-closing__lede">{{ communityClosing.lede }}</p>

    <div class="community-closing__actions">
      <RouterLink v-slot="{ navigate }" to="/join" custom>
        <AuroraButton variant="primary" @click="navigate">
          加入社区
        </AuroraButton>
      </RouterLink>
    </div>

    <div class="community-closing__links">
      <a
        class="community-closing__link"
        href="https://github.com/wustLABA/LABA/discussions"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="community-closing__link-eyebrow">提问</span>
        <span class="community-closing__link-title">打开 Discussions</span>
      </a>
      <RouterLink class="community-closing__link" to="/explore">
        <span class="community-closing__link-eyebrow">学习</span>
        <span class="community-closing__link-title">找到你的方向</span>
      </RouterLink>
      <RouterLink class="community-closing__link" to="/events">
        <span class="community-closing__link-eyebrow">相聚</span>
        <span class="community-closing__link-title">看社区节奏</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.community-closing {
  display: grid;
  gap: var(--space-4);
}

.community-closing__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.community-closing__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.community-closing__lede {
  margin: 0;
  max-width: 32rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.community-closing__actions {
  margin-top: var(--space-2);
}

.community-closing__links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.community-closing__link {
  display: grid;
  gap: var(--space-2);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
  color: inherit;
  text-decoration: none;
}

.community-closing__link:focus-visible {
  outline: var(--border-focus);
  outline-offset: 4px;
}

.community-closing__link-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.community-closing__link-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
}

.community-closing__link:hover .community-closing__link-title,
.community-closing__link:focus-visible .community-closing__link-title {
  color: var(--color-sky);
}

@media (max-width: 720px) {
  .community-closing__links {
    grid-template-columns: 1fr;
  }
}
</style>
