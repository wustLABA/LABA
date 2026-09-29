<script setup lang="ts">
import { inject, type Ref } from 'vue'

import {
  explorePaths,
  type ExplorePathId,
} from '../../content/explore'

const focusedPath = inject<Ref<ExplorePathId | null>>('exploreFocusedPath')
const setFocusedPath = inject<(path: ExplorePathId | null) => void>(
  'setExploreFocusedPath',
)

const build = explorePaths[0]
const understand = explorePaths[1]
</script>

<template>
  <section
    class="learning-map"
    :class="{
      'learning-map--build': focusedPath === 'build',
      'learning-map--understand': focusedPath === 'understand',
    }"
    aria-labelledby="learning-map-title"
  >
    <header class="learning-map__header">
      <p class="learning-map__eyebrow">学习地图预览</p>
      <h2 id="learning-map-title" class="learning-map__title">
        一张成长拓扑图——不是课程清单。
      </h2>
      <p class="learning-map__lede">
        两条轨迹共享一个中心。阶段是定向，而非强制解锁。
      </p>
    </header>

    <!-- Accessible text map -->
    <div class="learning-map__text">
      <div
        class="learning-map__track learning-map__track--build"
        @mouseenter="setFocusedPath?.('build')"
        @mouseleave="setFocusedPath?.(null)"
      >
        <p class="learning-map__track-label">构建</p>
        <ol class="learning-map__stages">
          <li v-for="stage in build?.mapStages ?? []" :key="stage">{{ stage }}</li>
        </ol>
      </div>

      <div class="learning-map__shared-label" aria-hidden="true">共享中心</div>

      <div
        class="learning-map__track learning-map__track--understand"
        @mouseenter="setFocusedPath?.('understand')"
        @mouseleave="setFocusedPath?.(null)"
      >
        <p class="learning-map__track-label">理解</p>
        <ol class="learning-map__stages">
          <li v-for="stage in understand?.mapStages ?? []" :key="stage">
            {{ stage }}
          </li>
        </ol>
      </div>
    </div>

    <!-- Decorative branching map -->
    <div class="learning-map__visual" aria-hidden="true">
      <svg viewBox="0 0 900 320" class="learning-map__svg" focusable="false">
        <path
          class="learning-map__line learning-map__line--trunk"
          d="M450 40 V120"
          fill="none"
          stroke-width="1.5"
        />
        <circle class="learning-map__hub" cx="450" cy="120" r="6" />
        <text class="learning-map__hub-label" x="450" y="148" text-anchor="middle">
          基础
        </text>

        <path
          class="learning-map__line learning-map__line--build"
          d="M450 120 C360 140 300 160 220 180 C160 200 120 230 90 270"
          fill="none"
          stroke-width="1.75"
        />
        <path
          class="learning-map__line learning-map__line--understand"
          d="M450 120 C540 140 600 160 680 180 C740 200 780 230 810 270"
          fill="none"
          stroke-width="1.75"
        />

        <g class="learning-map__nodes learning-map__nodes--build">
          <circle cx="300" cy="168" r="3.5" />
          <circle cx="220" cy="198" r="3.5" />
          <circle cx="150" cy="228" r="3.5" />
          <circle cx="110" cy="252" r="3.5" />
          <circle cx="90" cy="270" r="4" />
          <text x="70" y="292" text-anchor="middle">交付</text>
        </g>
        <g class="learning-map__nodes learning-map__nodes--understand">
          <circle cx="600" cy="168" r="3.5" />
          <circle cx="680" cy="198" r="3.5" />
          <circle cx="750" cy="228" r="3.5" />
          <circle cx="790" cy="252" r="3.5" />
          <circle cx="810" cy="270" r="4" />
          <text x="830" y="292" text-anchor="middle">科研</text>
        </g>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.learning-map {
  display: grid;
  gap: var(--space-8);
}

.learning-map__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.learning-map__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title-wide);
}

.learning-map__lede {
  margin: var(--space-4) 0 0;
  max-width: 36rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.learning-map__text {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}

.learning-map__track {
  display: grid;
  gap: var(--space-4);
  transition: opacity 200ms var(--ease-out-soft);
}

.learning-map--build .learning-map__track--understand,
.learning-map--understand .learning-map__track--build {
  opacity: 0.58;
}

.learning-map__track-label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.learning-map__stages {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

.learning-map__stages li {
  position: relative;
  padding: var(--space-3) 0 var(--space-3) var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text);
}

.learning-map__stages li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 1.15rem;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-aurora) 70%, var(--color-sky));
}

.learning-map__shared-label {
  align-self: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.learning-map__visual {
  margin-top: var(--space-2);
}

.learning-map__svg {
  width: 100%;
  height: auto;
  display: block;
}

.learning-map__line {
  stroke: color-mix(in srgb, var(--color-line) 70%, var(--color-mountain));
  stroke-linecap: round;
  transition: stroke 200ms var(--ease-out-soft), opacity 200ms var(--ease-out-soft);
}

.learning-map__line--build {
  stroke: color-mix(in srgb, var(--color-sky) 50%, var(--color-mountain));
}

.learning-map__line--understand {
  stroke: color-mix(in srgb, var(--color-aurora) 45%, var(--color-mountain));
}

.learning-map__hub {
  fill: color-mix(in srgb, var(--color-frost) 60%, var(--color-snow));
  stroke: var(--color-line);
}

.learning-map__hub-label,
.learning-map__nodes text {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  fill: var(--color-text-muted);
}

.learning-map__nodes circle {
  fill: var(--color-snow);
  stroke: var(--color-line);
  transition: opacity 200ms var(--ease-out-soft), stroke 200ms var(--ease-out-soft);
}

.learning-map--build .learning-map__line--build {
  stroke: var(--color-sky);
}

.learning-map--build .learning-map__line--understand,
.learning-map--build .learning-map__nodes--understand {
  opacity: 0.5;
}

.learning-map--understand .learning-map__line--understand {
  stroke: var(--color-sky);
}

.learning-map--understand .learning-map__line--build,
.learning-map--understand .learning-map__nodes--build {
  opacity: 0.5;
}

@media (max-width: 900px) {
  .learning-map__text {
    grid-template-columns: 1fr;
  }

  .learning-map__shared-label {
    writing-mode: horizontal-tb;
    transform: none;
    text-align: center;
    padding-block: var(--space-2);
  }

  .learning-map__visual {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .learning-map__track,
  .learning-map__line,
  .learning-map__nodes circle {
    transition: none;
  }
}
</style>
