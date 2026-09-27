<script setup lang="ts">
import { inject, type Ref } from 'vue'

import StageResources from '../resources/StageResources.vue'
import { aiStages, type AiStageId } from '../../content/explore-ai'
import type { LearningResource } from '../../content/resources'

const focusedStage = inject<Ref<AiStageId | null>>('aiFocusedStage')
const setFocusedStage = inject<(id: AiStageId | null) => void>('setAiFocusedStage')
/** 见 ResearchStageJournal：null 表示本组件未被页面层接入资料通道 */
const stageResources = inject<readonly LearningResource[] | null>('aiResources', null)
</script>

<template>
  <div class="ai-stages">
    <article
      v-for="stage in aiStages"
      :id="`stage-${stage.id}`"
      :key="stage.id"
      class="ai-stage"
      :class="{ 'ai-stage--dim': focusedStage && focusedStage !== stage.id }"
      @mouseenter="setFocusedStage?.(stage.id)"
      @mouseleave="setFocusedStage?.(null)"
    >
      <header class="ai-stage__header">
        <p class="ai-stage__index">{{ stage.index }}</p>
        <div>
          <h3 class="ai-stage__title">{{ stage.title }}</h3>
          <p class="ai-stage__lede">{{ stage.lede }}</p>
        </div>
      </header>

      <dl class="ai-stage__facets">
        <div v-for="facet in stage.facets" :key="facet.id" class="ai-stage__facet">
          <dt>{{ facet.label }}</dt>
          <dd>{{ facet.body }}</dd>
        </div>
      </dl>

      <StageResources
        v-if="stageResources"
        :resources="stageResources"
        :stage-id="stage.id"
      />
    </article>
  </div>
</template>

<style scoped>
.ai-stages {
  display: grid;
  gap: var(--space-12);
}

.ai-stage {
  display: grid;
  gap: var(--space-6);
  scroll-margin-top: var(--scroll-padding-top);
  transition: opacity var(--duration-normal) var(--ease-out-soft);
}

.ai-stage--dim {
  opacity: 0.62;
}

.ai-stage__header {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: var(--space-4);
}

.ai-stage__index {
  margin: 0.35rem 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  color: var(--color-sky);
}

.ai-stage__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2vw, var(--text-2xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.ai-stage__lede {
  margin: var(--space-3) 0 0;
  max-width: 40rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.ai-stage__facets {
  margin: 0;
  display: grid;
  gap: 0;
}

.ai-stage__facet {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  gap: var(--space-4) var(--space-6);
  padding-block: var(--space-4);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.ai-stage__facet dt {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding-top: 0.2rem;
}

.ai-stage__facet dd {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

@media (max-width: 720px) {
  .ai-stage__header {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .ai-stage__facet {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-stage {
    transition: none;
  }
}
</style>
