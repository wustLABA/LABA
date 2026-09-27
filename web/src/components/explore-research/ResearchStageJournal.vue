<script setup lang="ts">
import { inject, type Ref } from 'vue'

import StageResources from '../resources/StageResources.vue'
import type { LearningResource } from '../../content/resources'

import {
  researchStages,
  type ResearchStageId,
} from '../../content/explore-research'

const activeStage = inject<Ref<ResearchStageId | null>>('researchActiveStage')
const focusedStage = inject<Ref<ResearchStageId | null>>('researchFocusedStage')
const setFocusedStage = inject<(id: ResearchStageId | null) => void>(
  'setResearchFocusedStage',
)
/**
 * 由页面层 provide。用 null 作为缺失标记（而不是空数组），
 * 这样 v-if 能真正区分「没有资料通道」与「有通道但该阶段暂无资料」——
 * 后者应由 StageResources 内部处理，两种情况的渲染结果不同。
 */
const stageResources = inject<readonly LearningResource[] | null>(
  'researchResources',
  null,
)

function isReading(id: ResearchStageId) {
  return activeStage?.value === id
}

function isPreview(id: ResearchStageId) {
  return focusedStage?.value === id && focusedStage?.value !== activeStage?.value
}

function isDim(id: ResearchStageId) {
  if (!focusedStage?.value) return false
  if (id === activeStage?.value) return false
  if (id === focusedStage.value) return false
  return true
}
</script>

<template>
  <div class="research-journal">
    <article
      v-for="stage in researchStages"
      :id="stage.id"
      :key="stage.id"
      class="research-entry"
      :class="{
        'research-entry--active': isReading(stage.id),
        'research-entry--preview': isPreview(stage.id),
        'research-entry--dim': isDim(stage.id),
      }"
      @mouseenter="setFocusedStage?.(stage.id)"
      @mouseleave="setFocusedStage?.(null)"
    >
      <header class="research-entry__header">
        <p class="research-entry__index">{{ stage.index }}</p>
        <div>
          <h3 class="research-entry__title">{{ stage.title }}</h3>
          <p class="research-entry__statement">{{ stage.statement }}</p>
        </div>
      </header>

      <div class="research-entry__body">
        <section class="research-entry__block">
          <h4 class="research-entry__label">问题</h4>
          <p class="research-entry__text">{{ stage.question }}</p>
        </section>

        <section class="research-entry__block">
          <h4 class="research-entry__label">实践</h4>
          <p class="research-entry__text">{{ stage.practice }}</p>
        </section>

        <section v-if="stage.concepts?.length" class="research-entry__block">
          <h4 class="research-entry__label">概念</h4>
          <ul class="research-entry__concepts">
            <li v-for="concept in stage.concepts" :key="concept">{{ concept }}</li>
          </ul>
        </section>

        <section class="research-entry__block">
          <h4 class="research-entry__label">证据</h4>
          <p class="research-entry__text">{{ stage.evidence }}</p>
        </section>

        <section class="research-entry__block">
          <h4 class="research-entry__label">失败信号</h4>
          <ul class="research-entry__failures">
            <li v-for="(signal, i) in stage.failureSignals" :key="i">
              {{ signal }}
            </li>
          </ul>
        </section>

        <StageResources
          v-if="stageResources"
          :resources="stageResources"
          :stage-id="stage.id"
        />
      </div>
    </article>
  </div>
</template>

<style scoped>
.research-journal {
  display: grid;
  gap: var(--space-14, var(--space-12));
}

.research-entry {
  display: grid;
  gap: var(--space-6);
  scroll-margin-top: var(--scroll-padding-top);
  transition: opacity var(--duration-normal) var(--ease-out-soft);
}

.research-entry--dim {
  opacity: 0.62;
}

.research-entry--preview {
  opacity: 1;
}

.research-entry--preview .research-entry__title {
  color: var(--color-mountain);
}

.research-entry__header {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: var(--space-4);
}

.research-entry__index {
  margin: 0.35rem 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  color: var(--color-sky);
}

.research-entry__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2vw, var(--text-2xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.research-entry__statement {
  margin: var(--space-3) 0 0;
  max-width: 40rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.research-entry__body {
  display: grid;
  gap: 0;
  max-width: 42rem;
}

.research-entry__block {
  display: grid;
  gap: var(--space-2);
  padding-block: var(--space-4);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.research-entry__label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 500;
}

.research-entry__text {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.research-entry--active .research-entry__label {
  color: var(--color-sky);
}

.research-entry__concepts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.research-entry__concepts li {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  max-width: 100%;
  overflow-wrap: anywhere;
}

.research-entry__failures {
  margin: 0;
  padding-left: 1.15rem;
  display: grid;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.research-entry__failures li {
  padding-left: 0.15rem;
}

@media (max-width: 720px) {
  .research-entry__header {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .research-entry {
    transition: none;
  }
}
</style>
