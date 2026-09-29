<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { exploreResearchHero } from '../../content/explore-research'
import { useMotionPreference } from '../../composables/useMotionPreference'

const { prefersReducedMotion } = useMotionPreference()
const drawn = ref(false)
const focusNode = ref<'question' | 'model' | 'experiment' | 'evidence' | null>(null)

onMounted(() => {
  if (prefersReducedMotion.value) {
    drawn.value = true
    return
  }
  requestAnimationFrame(() => {
    drawn.value = true
  })
})

function setFocus(node: typeof focusNode.value) {
  focusNode.value = node
}
</script>

<template>
  <header
    class="research-hero"
    :class="{
      'research-hero--drawn': drawn || prefersReducedMotion,
      [`research-hero--${focusNode}`]: focusNode,
    }"
  >
    <p class="research-hero__crumb">
      <RouterLink class="research-hero__back" to="/explore">探索</RouterLink>
      <span aria-hidden="true"> / </span>
      <span>Understand AI</span>
    </p>

    <div class="research-hero__grid">
      <div class="research-hero__copy">
        <p class="research-hero__eyebrow">{{ exploreResearchHero.eyebrow }}</p>
        <h1 class="research-hero__title">{{ exploreResearchHero.title }}</h1>
        <p class="research-hero__lede">{{ exploreResearchHero.lede }}</p>
        <p class="research-hero__map-text">
          一张科学推理地图：
          问题 → 假设 → 模型 / 方法 → 实验 → 证据——
          随后证据催生新的问题。
        </p>
      </div>

      <div class="research-hero__visual" aria-hidden="true">
        <svg
          class="research-hero__svg"
          viewBox="0 0 420 320"
          focusable="false"
        >
          <!-- trunk -->
          <path
            class="research-hero__line research-hero__line--trunk"
            d="M210 28 V88"
            fill="none"
            stroke-width="1.5"
          />
          <path
            class="research-hero__line research-hero__line--trunk"
            d="M210 118 V168"
            fill="none"
            stroke-width="1.5"
          />
          <path
            class="research-hero__line research-hero__line--trunk"
            d="M210 198 V248"
            fill="none"
            stroke-width="1.5"
          />

          <!-- branches -->
          <path
            class="research-hero__line research-hero__line--branch"
            d="M210 118 C170 118 140 140 120 168"
            fill="none"
            stroke-width="1.25"
          />
          <path
            class="research-hero__line research-hero__line--branch"
            d="M210 118 C250 118 280 140 300 168"
            fill="none"
            stroke-width="1.25"
          />
          <path
            class="research-hero__line research-hero__line--merge"
            d="M120 168 C150 188 180 198 210 198"
            fill="none"
            stroke-width="1.25"
          />
          <path
            class="research-hero__line research-hero__line--merge"
            d="M300 168 C270 188 240 198 210 198"
            fill="none"
            stroke-width="1.25"
          />

          <!-- feedback Evidence → Question -->
          <path
            class="research-hero__line research-hero__line--feedback"
            d="M250 268 C340 268 360 160 250 40 C240 32 225 28 210 28"
            fill="none"
            stroke-width="1"
          />

          <g
            class="research-hero__node-group research-hero__node-group--question"
            @pointerenter="setFocus('question')"
            @pointerleave="setFocus(null)"
          >
            <circle class="research-hero__node" cx="210" cy="28" r="5" />
            <text class="research-hero__label" x="210" y="16" text-anchor="middle">
              问题
            </text>
          </g>

          <text class="research-hero__label research-hero__label--soft" x="210" y="108" text-anchor="middle">
            假设
          </text>
          <circle class="research-hero__node research-hero__node--soft" cx="210" cy="118" r="3.5" />

          <g
            class="research-hero__node-group research-hero__node-group--model"
            @pointerenter="setFocus('model')"
            @pointerleave="setFocus(null)"
          >
            <circle class="research-hero__node" cx="120" cy="168" r="4.5" />
            <text class="research-hero__label" x="78" y="172" text-anchor="end">模型</text>
            <circle class="research-hero__node research-hero__node--soft" cx="300" cy="168" r="4.5" />
            <text class="research-hero__label research-hero__label--soft" x="342" y="172">
              方法
            </text>
          </g>

          <g
            class="research-hero__node-group research-hero__node-group--experiment"
            @pointerenter="setFocus('experiment')"
            @pointerleave="setFocus(null)"
          >
            <circle class="research-hero__node" cx="210" cy="198" r="5" />
            <text class="research-hero__label" x="248" y="202">实验</text>
          </g>

          <g
            class="research-hero__node-group research-hero__node-group--evidence"
            @pointerenter="setFocus('evidence')"
            @pointerleave="setFocus(null)"
          >
            <circle class="research-hero__node research-hero__node--end" cx="210" cy="268" r="5.5" />
            <text class="research-hero__label" x="210" y="294" text-anchor="middle">
              证据
            </text>
          </g>
        </svg>
      </div>
    </div>
  </header>
</template>

<style scoped>
.research-hero {
  min-height: clamp(18rem, 54vh, 29rem);
  display: grid;
  align-content: center;
  gap: var(--space-6);
  padding-block: var(--space-4);
}

.research-hero__crumb {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.research-hero__back {
  color: var(--color-mountain);
  text-decoration: none;
}

.research-hero__back:hover,
.research-hero__back:focus-visible {
  color: var(--color-sky);
}

.research-hero__back:focus-visible {
  outline: var(--border-focus);
  outline-offset: 3px;
}

.research-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.95fr);
  gap: var(--space-8) var(--space-10);
  align-items: center;
}

.research-hero__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.research-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 3.8vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.research-hero__lede {
  margin: var(--space-5) 0 0;
  max-width: 36rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.research-hero__map-text {
  margin: var(--space-4) 0 0;
  max-width: 34rem;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
}

.research-hero__svg {
  width: 100%;
  height: auto;
  display: block;
  max-width: 26rem;
  margin-inline: auto;
}

.research-hero__line {
  stroke: color-mix(in srgb, var(--color-line) 55%, var(--color-mountain));
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  path-length: 1;
  transition:
    stroke 200ms var(--ease-out-soft),
    opacity 200ms var(--ease-out-soft);
}

.research-hero--drawn .research-hero__line {
  stroke-dashoffset: 0;
  transition:
    stroke-dashoffset 900ms var(--ease-out-soft),
    stroke var(--duration-normal) var(--ease-out-soft),
    opacity var(--duration-normal) var(--ease-out-soft);
}

.research-hero__line--feedback {
  stroke: color-mix(in srgb, var(--color-aurora) 45%, var(--color-line));
  opacity: 0.7;
}

.research-hero__node {
  fill: var(--color-snow);
  stroke: color-mix(in srgb, var(--color-sky) 55%, var(--color-line));
  stroke-width: 1.25;
  transition:
    stroke 200ms var(--ease-out-soft),
    fill 200ms var(--ease-out-soft),
    opacity 200ms var(--ease-out-soft);
}

.research-hero__node--soft {
  opacity: 0.75;
}

.research-hero__node--end {
  fill: color-mix(in srgb, var(--color-aurora) 40%, var(--color-snow));
}

.research-hero__label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  fill: var(--color-text-muted);
  transition:
    fill 200ms var(--ease-out-soft),
    opacity 200ms var(--ease-out-soft);
}

.research-hero__label--soft {
  opacity: 0.7;
}

.research-hero--question .research-hero__node-group--question .research-hero__node,
.research-hero--model .research-hero__node-group--model .research-hero__node,
.research-hero--experiment .research-hero__node-group--experiment .research-hero__node,
.research-hero--evidence .research-hero__node-group--evidence .research-hero__node {
  stroke: var(--color-sky);
  fill: color-mix(in srgb, var(--color-aurora) 45%, var(--color-snow));
}

.research-hero--question .research-hero__node-group--question .research-hero__label,
.research-hero--model .research-hero__node-group--model .research-hero__label,
.research-hero--experiment .research-hero__node-group--experiment .research-hero__label,
.research-hero--evidence .research-hero__node-group--evidence .research-hero__label {
  fill: var(--color-sky);
}

.research-hero--question .research-hero__line--feedback,
.research-hero--evidence .research-hero__line--feedback {
  stroke: var(--color-sky);
  opacity: 1;
}

.research-hero--model .research-hero__line--branch,
.research-hero--model .research-hero__line--merge {
  stroke: var(--color-sky);
}

.research-hero--experiment .research-hero__line--trunk,
.research-hero--experiment .research-hero__line--merge {
  stroke: var(--color-sky);
}

@media (max-width: 900px) {
  .research-hero {
    min-height: 0;
  }

  .research-hero__grid {
    grid-template-columns: 1fr;
  }

  .research-hero__title {
    max-width: none;
  }

  .research-hero__svg {
    max-width: 20rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .research-hero__line {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    transition:
      stroke 120ms linear,
      opacity 120ms linear;
  }
}
</style>
