<script setup lang="ts">
/**
 * 阶段卡片内嵌的学习资料 —— 只显示标注了必读的条目。
 *
 * 为什么只放必读：阶段卡片本身已经承载 statement / practice / evidence
 * 等较多信息，若把该阶段所有资料都塞进来会让卡片失重、打断叙事节奏。
 * 完整清单集中在页面底部的资料库，两处共用同一份数据源。
 */
import { computed } from 'vue'

import { resourcesForStage, type LearningResource } from '../../content/resources'
import ResourceItem from './ResourceItem.vue'

const props = defineProps<{
  resources: readonly LearningResource[]
  stageId: string
  /** 上限，默认 3。超出部分引导用户去底部资料库 */
  limit?: number
}>()

const visible = computed(() =>
  resourcesForStage(props.resources, props.stageId, true).slice(0, props.limit ?? 3),
)

const total = computed(
  () => resourcesForStage(props.resources, props.stageId).length,
)
</script>

<template>
  <div v-if="visible.length" class="stage-resources">
    <p class="stage-resources__label">学习资料</p>
    <ul class="stage-resources__list">
      <ResourceItem
        v-for="resource in visible"
        :key="resource.id"
        :resource="resource"
        compact
      />
    </ul>
    <p v-if="total > visible.length" class="stage-resources__more">
      该阶段共 {{ total }} 份材料，全部见页面底部「学习资料」
    </p>
  </div>
</template>

<style scoped>
.stage-resources {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px dashed color-mix(in srgb, var(--color-line) 60%, transparent);
}

.stage-resources__label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.stage-resources__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 内嵌场景首条不再画分隔线：外层虚线已承担分隔作用。
   用 :deep() 是因为 li 属于子组件 ResourceItem 的根节点，
   scoped 样式默认不会穿透到子组件内部。 */
.stage-resources__list > :deep(:first-child) {
  border-top: 0;
}

.stage-resources__more {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
