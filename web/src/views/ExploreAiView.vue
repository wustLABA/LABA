<script setup lang="ts">
import { computed, provide, ref } from 'vue'

import ExploreAiCapstone from '../components/explore-ai/ExploreAiCapstone.vue'
import ExploreAiHero from '../components/explore-ai/ExploreAiHero.vue'
import ExploreAiLoop from '../components/explore-ai/ExploreAiLoop.vue'
import ExploreAiPath from '../components/explore-ai/ExploreAiPath.vue'
import ExploreAiStages from '../components/explore-ai/ExploreAiStages.vue'
import PageContainer from '../components/layout/PageContainer.vue'
import ResourceLibrary from '../components/resources/ResourceLibrary.vue'
import { aiStages, type AiStageId } from '../content/explore-ai'
import { aiResources } from '../content/explore-ai-resources'

const focusedStage = ref<AiStageId | null>(null)

function setFocusedStage(id: AiStageId | null) {
  focusedStage.value = id
}

provide('aiFocusedStage', focusedStage)
provide('setAiFocusedStage', setFocusedStage)
/** 见 ExploreDeepLearningView：资料在页面层下发，子组件不关心数据来源 */
provide('aiResources', aiResources)

/** 底部资料库分组：沿用阶段定义，顺序与上方叙事一致 */
const resourceGroups = aiStages.map((stage) => ({
  id: stage.id,
  index: stage.index,
  label: stage.title,
}))

const pageClass = computed(() =>
  focusedStage.value ? `explore-ai--${focusedStage.value}` : '',
)
</script>

<template>
  <main class="explore-ai" :class="pageClass">
    <PageContainer class="explore-ai__inner">
      <ExploreAiHero />
      <ExploreAiPath />
      <ExploreAiStages />
      <ExploreAiLoop />
      <ExploreAiCapstone />
      <ResourceLibrary
        :resources="aiResources"
        :groups="resourceGroups"
        eyebrow="学习资料"
        title="按阶段取用，而不是从头读到尾。"
        lede="按阶段分组。PDF 与 PPT 可直接在浏览器打开，外部文章与文档在新标签页进入。标了「必读」的已就近显示在上面各阶段里。"
      />
    </PageContainer>
  </main>
</template>

<style scoped>
.explore-ai {
  padding-block: var(--space-12) var(--space-20);
  background: linear-gradient(
    180deg,
    var(--color-snow) 0%,
    color-mix(in srgb, var(--color-morning) 65%, var(--color-glacier)) 42%,
    color-mix(in srgb, var(--color-frost) 40%, var(--color-snow)) 100%
  );
}

.explore-ai__inner {
  display: grid;
  gap: var(--space-16);
}

@media (max-width: 720px) {
  .explore-ai {
    padding-block: var(--space-10) var(--space-16);
  }

  .explore-ai__inner {
    gap: var(--space-12);
  }
}
</style>
