<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'

import EvidenceLedger from '../components/explore-research/EvidenceLedger.vue'
import ResearchCapstone from '../components/explore-research/ResearchCapstone.vue'
import ResearchHero from '../components/explore-research/ResearchHero.vue'
import ResearchLoop from '../components/explore-research/ResearchLoop.vue'
import ResearchSpine from '../components/explore-research/ResearchSpine.vue'
import ResearchStageJournal from '../components/explore-research/ResearchStageJournal.vue'
import PageContainer from '../components/layout/PageContainer.vue'
import ResourceLibrary from '../components/resources/ResourceLibrary.vue'
import { deepLearningResources } from '../content/explore-research-resources'
import {
  researchStages,
  type ResearchStageId,
} from '../content/explore-research'

const activeStage = ref<ResearchStageId | null>(researchStages[0]?.id ?? null)
const focusedStage = ref<ResearchStageId | null>(null)

function setFocusedStage(id: ResearchStageId | null) {
  focusedStage.value = id
}

provide('researchActiveStage', activeStage)
provide('researchFocusedStage', focusedStage)
provide('setResearchFocusedStage', setFocusedStage)
/**
 * 把本路径的学习资料通过 provide 下发，供阶段卡片内嵌显示。
 * 不直接 import 到子组件里，是为了让「资料属于哪个路径」这件事
 * 只在页面层决定一次，子组件保持与数据来源解耦。
 */
provide('researchResources', deepLearningResources)

/** 底部资料库的分组顺序沿用阶段定义，保证与上方叙事一致 */
const resourceGroups = researchStages.map((stage) => ({
  id: stage.id,
  index: stage.index,
  label: stage.shortLabel,
}))

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      const top = visible[0]
      if (!top?.target.id) return
      const id = top.target.id as ResearchStageId
      if (researchStages.some((stage) => stage.id === id)) {
        activeStage.value = id
      }
    },
    {
      root: null,
      rootMargin: '-22% 0px -52% 0px',
      threshold: [0.1, 0.25, 0.45],
    },
  )

  researchStages.forEach((stage) => {
    const el = document.getElementById(stage.id)
    if (el) observer?.observe(el)
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <main class="explore-research">
    <PageContainer class="explore-research__inner">
      <ResearchHero />

      <div class="explore-research__layout">
        <aside class="explore-research__spine">
          <div class="explore-research__spine-sticky">
            <ResearchSpine />
          </div>
        </aside>
        <div class="explore-research__journal">
          <ResearchStageJournal />
        </div>
      </div>

      <ResearchLoop />
      <EvidenceLedger />
      <ResearchCapstone />
      <ResourceLibrary
        :resources="deepLearningResources"
        :groups="resourceGroups"
        eyebrow="学习资料"
        title="把阶段落到可读、可跑的材料上。"
        lede="按阶段分组。PDF 与 PPT 可直接在浏览器打开，视频与外部文章在新标签页进入。标了「必读」的已就近显示在上面各阶段里。"
      />
    </PageContainer>
  </main>
</template>

<style scoped>
.explore-research {
  padding-block: var(--space-12) var(--space-20);
  background: linear-gradient(
    180deg,
    var(--color-snow) 0%,
    color-mix(in srgb, var(--color-morning) 78%, var(--color-glacier)) 46%,
    color-mix(in srgb, var(--color-frost) 35%, var(--color-snow)) 100%
  );
}

.explore-research__inner {
  display: grid;
  gap: var(--space-16);
}

.explore-research__layout {
  display: grid;
  grid-template-columns: minmax(14rem, 0.28fr) minmax(0, 1fr);
  gap: var(--space-10) var(--space-12);
  align-items: start;
}

.explore-research__spine-sticky {
  position: sticky;
  top: var(--sticky-top);
}

@media (max-width: 1024px) {
  .explore-research__layout {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .explore-research__spine-sticky {
    position: static;
  }
}

@media (max-width: 720px) {
  .explore-research {
    padding-block: var(--space-10) var(--space-16);
  }

  .explore-research__inner {
    gap: var(--space-12);
  }
}
</style>
