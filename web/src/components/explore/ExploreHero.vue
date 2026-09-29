<script setup lang="ts">
import { inject, onMounted, ref, type Ref } from 'vue'

import { exploreHero, type ExplorePathId } from '../../content/explore'
import { useMotionPreference } from '../../composables/useMotionPreference'

const focusedPath = inject<Ref<ExplorePathId | null>>('exploreFocusedPath')
const setFocusedPath = inject<(path: ExplorePathId | null) => void>(
  'setExploreFocusedPath',
)
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

function focus(path: ExplorePathId | null) {
  setFocusedPath?.(path)
}
</script>

<template>
  <header
    class="explore-hero"
    :class="{
      'explore-hero--drawn': drawn || prefersReducedMotion,
      'explore-hero--build': focusedPath === 'build',
      'explore-hero--understand': focusedPath === 'understand',
    }"
  >
    <div class="explore-hero__copy">
      <p class="explore-hero__eyebrow">{{ exploreHero.eyebrow }}</p>
      <h1 class="explore-hero__title">{{ exploreHero.title }}</h1>
      <p class="explore-hero__lede">{{ exploreHero.lede }}</p>
    </div>

    <div class="explore-hero__visual" aria-hidden="true">
      <svg
        class="explore-hero__svg"
        viewBox="0 0 640 280"
        role="presentation"
        focusable="false"
      >
        <path class="explore-hero__trunk" d="M40 140 H220" fill="none" stroke-width="1.5" />
        <path
          class="explore-hero__branch explore-hero__branch--build"
          d="M220 140 C300 140 320 70 420 58 L560 48"
          fill="none"
          stroke-width="1.75"
          @pointerenter="focus('build')"
          @pointerleave="focus(null)"
        />
        <path
          class="explore-hero__branch explore-hero__branch--understand"
          d="M220 140 C300 140 320 210 420 222 L560 232"
          fill="none"
          stroke-width="1.75"
          @pointerenter="focus('understand')"
          @pointerleave="focus(null)"
        />
        <path
          class="explore-hero__cross"
          d="M380 90 C430 120 430 160 380 190"
          fill="none"
          stroke-width="1"
        />
        <circle class="explore-hero__node" cx="220" cy="140" r="4.5" />
        <circle class="explore-hero__node explore-hero__node--build" cx="420" cy="58" r="4" />
        <circle
          class="explore-hero__node explore-hero__node--understand"
          cx="420"
          cy="222"
          r="4"
        />
        <circle class="explore-hero__node explore-hero__node--build" cx="560" cy="48" r="3.5" />
        <circle
          class="explore-hero__node explore-hero__node--understand"
          cx="560"
          cy="232"
          r="3.5"
        />
        <text class="explore-hero__label explore-hero__label--build" x="430" y="42">
          构建
        </text>
        <text class="explore-hero__label explore-hero__label--understand" x="430" y="250">
          理解
        </text>
      </svg>
    </div>
  </header>
</template>

<style scoped>
.explore-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: var(--space-8) var(--space-10);
  align-items: center;
  min-height: clamp(22rem, 58vh, 34rem);
  padding-block: var(--space-6) var(--space-4);
}

.explore-hero__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.explore-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-hero);
}

.explore-hero__lede {
  margin: var(--space-5) 0 0;
  max-width: 34rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.explore-hero__visual {
  min-width: 0;
}

.explore-hero__svg {
  width: 100%;
  height: auto;
  display: block;
}

.explore-hero__trunk,
.explore-hero__branch,
.explore-hero__cross {
  stroke: color-mix(in srgb, var(--color-line) 80%, var(--color-mountain));
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  path-length: 1;
  transition:
    stroke 200ms var(--ease-out-soft),
    opacity 200ms var(--ease-out-soft),
    stroke-width 200ms var(--ease-out-soft);
}

.explore-hero--drawn .explore-hero__trunk,
.explore-hero--drawn .explore-hero__branch,
.explore-hero--drawn .explore-hero__cross {
  stroke-dashoffset: 0;
  transition:
    stroke-dashoffset 900ms var(--ease-out-soft),
    stroke 200ms var(--ease-out-soft),
    opacity 200ms var(--ease-out-soft),
    stroke-width 200ms var(--ease-out-soft);
}

.explore-hero__branch--build {
  stroke: color-mix(in srgb, var(--color-sky) 55%, var(--color-mountain));
}

.explore-hero__branch--understand {
  stroke: color-mix(in srgb, var(--color-aurora) 45%, var(--color-mountain));
}

.explore-hero__cross {
  opacity: 0.45;
}

.explore-hero__node {
  fill: var(--color-snow);
  stroke: var(--color-line);
  stroke-width: 1.25;
  transition:
    fill 200ms var(--ease-out-soft),
    stroke 200ms var(--ease-out-soft),
    opacity 200ms var(--ease-out-soft);
}

.explore-hero__label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  fill: var(--color-text-muted);
  transition:
    fill 200ms var(--ease-out-soft),
    opacity 200ms var(--ease-out-soft);
}

.explore-hero--build .explore-hero__branch--build {
  stroke: var(--color-sky);
  stroke-width: 2.25;
}

.explore-hero--build .explore-hero__branch--understand,
.explore-hero--build .explore-hero__label--understand,
.explore-hero--build .explore-hero__node--understand {
  opacity: 0.55;
}

.explore-hero--build .explore-hero__label--build {
  fill: var(--color-sky);
}

.explore-hero--build .explore-hero__node--build {
  fill: color-mix(in srgb, var(--color-aurora) 55%, var(--color-snow));
  stroke: var(--color-sky);
}

.explore-hero--understand .explore-hero__branch--understand {
  stroke: var(--color-sky);
  stroke-width: 2.25;
}

.explore-hero--understand .explore-hero__branch--build,
.explore-hero--understand .explore-hero__label--build,
.explore-hero--understand .explore-hero__node--build {
  opacity: 0.55;
}

.explore-hero--understand .explore-hero__label--understand {
  fill: var(--color-sky);
}

.explore-hero--understand .explore-hero__node--understand {
  fill: color-mix(in srgb, var(--color-aurora) 55%, var(--color-snow));
  stroke: var(--color-sky);
}

@media (max-width: 900px) {
  .explore-hero {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: var(--space-6);
  }

  .explore-hero__title {
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .explore-hero__trunk,
  .explore-hero__branch,
  .explore-hero__cross {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    transition:
      stroke 120ms linear,
      opacity 120ms linear;
  }
}
</style>
