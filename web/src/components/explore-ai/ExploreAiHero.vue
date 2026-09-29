<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { exploreAiHero } from '../../content/explore-ai'
import { useMotionPreference } from '../../composables/useMotionPreference'

const { prefersReducedMotion } = useMotionPreference()
const drawn = ref(false)

onMounted(() => {
  if (prefersReducedMotion.value) {
    drawn.value = true
    return
  }
  requestAnimationFrame(() => {
    drawn.value = true
  })
})
</script>

<template>
  <header
    class="ai-hero"
    :class="{ 'ai-hero--drawn': drawn || prefersReducedMotion }"
  >
    <p class="ai-hero__crumb">
      <RouterLink class="ai-hero__back" to="/explore">探索</RouterLink>
      <span aria-hidden="true"> / </span>
      <span>Build with AI</span>
    </p>

    <div class="ai-hero__grid">
      <div class="ai-hero__copy">
        <p class="ai-hero__eyebrow">{{ exploreAiHero.eyebrow }}</p>
        <h1 class="ai-hero__title">{{ exploreAiHero.title }}</h1>
        <p class="ai-hero__lede">{{ exploreAiHero.lede }}</p>
      </div>

      <div class="ai-hero__visual" aria-hidden="true">
        <svg class="ai-hero__svg" viewBox="0 0 560 200" focusable="false">
          <path
            class="ai-hero__line"
            d="M24 100 H120 C150 100 160 70 200 62 L280 48 C320 40 340 70 360 100 H536"
            fill="none"
            stroke-width="1.75"
          />
          <circle class="ai-hero__node" cx="120" cy="100" r="4" />
          <circle class="ai-hero__node ai-hero__node--accent" cx="200" cy="62" r="4.5" />
          <circle class="ai-hero__node" cx="280" cy="48" r="3.5" />
          <circle class="ai-hero__node" cx="360" cy="100" r="4" />
          <circle class="ai-hero__node ai-hero__node--end" cx="536" cy="100" r="5" />
          <text class="ai-hero__label" x="120" y="128">输入</text>
          <text class="ai-hero__label" x="200" y="46">工具</text>
          <text class="ai-hero__label" x="280" y="32">系统</text>
          <text class="ai-hero__label" x="536" y="128" text-anchor="end">交付</text>
        </svg>
      </div>
    </div>
  </header>
</template>

<style scoped>
.ai-hero {
  min-height: clamp(18rem, 54vh, 29rem);
  display: grid;
  align-content: center;
  gap: var(--space-6);
  padding-block: var(--space-4);
}

.ai-hero__crumb {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.ai-hero__back {
  color: var(--color-mountain);
  text-decoration: none;
}

.ai-hero__back:hover,
.ai-hero__back:focus-visible {
  color: var(--color-sky);
}

.ai-hero__back:focus-visible {
  outline: var(--border-focus);
  outline-offset: 3px;
}

.ai-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.9fr);
  gap: var(--space-8) var(--space-10);
  align-items: center;
}

.ai-hero__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.ai-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.ai-hero__lede {
  margin: var(--space-5) 0 0;
  max-width: 36rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.ai-hero__svg {
  width: 100%;
  height: auto;
  display: block;
}

.ai-hero__line {
  stroke: color-mix(in srgb, var(--color-sky) 70%, var(--color-mountain));
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  path-length: 1;
}

.ai-hero--drawn .ai-hero__line {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 900ms var(--ease-out-soft);
}

.ai-hero__node {
  fill: var(--color-snow);
  stroke: var(--color-sky);
  stroke-width: 1.25;
}

.ai-hero__node--accent,
.ai-hero__node--end {
  fill: color-mix(in srgb, var(--color-aurora) 50%, var(--color-snow));
}

.ai-hero__label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  fill: var(--color-text-muted);
}

@media (max-width: 900px) {
  .ai-hero {
    min-height: 0;
  }

  .ai-hero__grid {
    grid-template-columns: 1fr;
  }

  .ai-hero__title {
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-hero__line {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    transition: none;
  }
}
</style>
