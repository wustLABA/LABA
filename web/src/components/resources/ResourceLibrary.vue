<script setup lang="ts">
/**
 * 页面底部的完整资料库 —— 按阶段分组平铺，不做筛选。
 *
 * 之所以先不加筛选：资料总量在 40 条以内时，分组平铺配合页面锚点
 * 比筛选按钮更好用（能一眼看到全貌）。数据量大到需要筛选时，
 * 只需在此组件内加一层 kind/level 过滤，数据结构无需变动。
 */
import { computed } from 'vue'

import type { LearningResource } from '../../content/resources'
import ResourceItem from './ResourceItem.vue'

const props = defineProps<{
  resources: readonly LearningResource[]
  eyebrow?: string
  title: string
  lede?: string
  /** 分组依据：阶段的 { id, label, index }，顺序即展示顺序 */
  groups: readonly { id: string; label: string; index: string }[]
}>()

/**
 * 按 stageId 归组。未挂阶段的资料收进末尾的「其他」组 ——
 * 否则新增资料时若忘填 stageId，条目会静默消失，很难排查。
 */
const grouped = computed(() => {
  const known = new Set(props.groups.map((g) => g.id))
  const buckets = props.groups
    .map((group) => ({
      key: group.id,
      index: group.index,
      label: group.label,
      items: props.resources.filter((r) => r.stageId === group.id),
    }))
    .filter((bucket) => bucket.items.length > 0)

  const orphans = props.resources.filter((r) => !r.stageId || !known.has(r.stageId))
  if (orphans.length) {
    buckets.push({ key: '__other', index: '—', label: '其他', items: orphans })
  }
  return buckets
})

const total = computed(() => props.resources.length)
</script>

<template>
  <section v-if="total" class="resource-library" aria-labelledby="resource-library-title">
    <header class="resource-library__header">
      <p v-if="eyebrow" class="resource-library__eyebrow">{{ eyebrow }}</p>
      <h2 id="resource-library-title" class="resource-library__title">{{ title }}</h2>
      <p v-if="lede" class="resource-library__lede">{{ lede }}</p>
      <p class="resource-library__count">共 {{ total }} 份材料</p>
    </header>

    <div class="resource-library__groups">
      <section
        v-for="group in grouped"
        :key="group.key"
        class="resource-library__group"
      >
        <h3 class="resource-library__group-title">
          <span class="resource-library__group-index">{{ group.index }}</span>
          {{ group.label }}
        </h3>
        <ul class="resource-library__list">
          <ResourceItem
            v-for="resource in group.items"
            :key="resource.id"
            :resource="resource"
          />
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.resource-library {
  display: grid;
  gap: var(--space-8);
}

.resource-library__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.resource-library__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  /* 26ch 比 EvidenceLedger 的 18ch 宽：本标题是完整句子而非短语，
     过窄会让它在「而不是」处硬断，读起来割裂 */
  max-width: var(--measure-hero-wide);
}

.resource-library__lede {
  margin: var(--space-4) 0 0;
  max-width: 38rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.resource-library__count {
  margin: var(--space-3) 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.resource-library__groups {
  display: grid;
  gap: var(--space-10);
}

.resource-library__group-title {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.resource-library__group-index {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  color: var(--color-sky);
}

.resource-library__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 分组标题已提供视觉起点，首条不再重复画线 */
.resource-library__list > :deep(:first-child) {
  border-top: 0;
}

@media (max-width: 720px) {
  .resource-library__title {
    max-width: none;
  }
}
</style>
