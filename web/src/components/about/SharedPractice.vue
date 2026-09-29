<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { sharedPractice } from '../../content/about'
import { useMotionPreference } from '../../composables/useMotionPreference'

const { prefersReducedMotion } = useMotionPreference()
const revealed = ref(false)
const focusId = ref<string | null>(null)

onMounted(() => {
  if (prefersReducedMotion.value) {
    revealed.value = true
    return
  }
  const el = document.getElementById('shared-practice')
  if (!el || typeof IntersectionObserver === 'undefined') {
    revealed.value = true
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        revealed.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.18 },
  )
  observer.observe(el)
})
</script>

<template>
  <section
    id="shared-practice"
    class="shared-practice"
    :class="{ 'shared-practice--revealed': revealed || prefersReducedMotion }"
    aria-labelledby="shared-practice-title"
  >
    <header class="shared-practice__header">
      <p class="shared-practice__eyebrow">{{ sharedPractice.eyebrow }}</p>
      <h2 id="shared-practice-title" class="shared-practice__title">
        {{ sharedPractice.title }}
      </h2>
      <p class="shared-practice__lede">{{ sharedPractice.lede }}</p>
    </header>

    <ol class="shared-practice__list">
      <li
        v-for="(step, index) in sharedPractice.steps"
        :key="step.id"
        class="shared-practice__step"
        :class="{ 'shared-practice__step--focus': focusId === step.id }"
        @mouseenter="focusId = step.id"
        @mouseleave="focusId = null"
      >
        <p class="shared-practice__meta">
          <span>{{ step.index }}</span>
          <span v-if="index < sharedPractice.steps.length - 1" aria-hidden="true">↓</span>
        </p>
        <h3 class="shared-practice__label">{{ step.label }}</h3>
        <p class="shared-practice__statement">{{ step.statement }}</p>
      </li>
    </ol>
    <p class="shared-practice__return" aria-hidden="true">↺ 分享滋养下一个问题</p>
  </section>
</template>

<style scoped>
.shared-practice {
  display: grid;
  gap: var(--space-8);
}

.shared-practice__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.shared-practice__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
  white-space: pre-line;
}

.shared-practice__lede {
  margin: var(--space-4) 0 0;
  max-width: 36rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.shared-practice__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  opacity: 0.4;
  transition: opacity 600ms var(--ease-out-soft);
}

.shared-practice--revealed .shared-practice__list {
  opacity: 1;
}

.shared-practice__step {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 10rem) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: baseline;
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
  transition: opacity var(--duration-normal) var(--ease-out-soft);
}

.shared-practice:has(.shared-practice__step--focus)
  .shared-practice__step:not(.shared-practice__step--focus) {
  opacity: 0.55;
}

.shared-practice__meta {
  margin: 0;
  display: inline-flex;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  color: var(--color-sky);
}

.shared-practice__label {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  text-transform: uppercase;
}

.shared-practice__statement {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.shared-practice__return {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .shared-practice__title {
    max-width: none;
    white-space: normal;
  }

  .shared-practice__step {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shared-practice__list {
    opacity: 1;
    transition: none;
  }

  .shared-practice__step {
    transition: none;
  }
}
</style>
