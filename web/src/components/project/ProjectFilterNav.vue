<script setup lang="ts">
import { computed } from 'vue'

import type { ProjectFilterId } from '../../types/project'

const props = defineProps<{
  modelValue: ProjectFilterId
  counts: Record<ProjectFilterId, number>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ProjectFilterId]
}>()

const ALL_FILTERS: { id: ProjectFilterId; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'ai-engineering', label: 'AI 工程' },
  { id: 'research', label: '科研' },
  { id: 'tools', label: '工具' },
]

/**
 * 只显示有内容的分类。
 *
 * 作品档案目前全部来自成员个人项目，没有科研类条目 —— 若照旧渲染「科研 0」，
 * 点进去会得到一个空列表，看起来像页面坏了。计数为 0 的分类直接不显示，
 * 以后补上科研类项目时会自动出现。「全部」始终保留。
 */
const filters = computed(() =>
  ALL_FILTERS.filter((item) => item.id === 'all' || (props.counts[item.id] ?? 0) > 0),
)

function select(id: ProjectFilterId) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="project-filter" role="tablist" aria-label="筛选作品档案">
    <button
      v-for="item in filters"
      :key="item.id"
      type="button"
      role="tab"
      class="project-filter__item"
      :class="{ 'project-filter__item--active': modelValue === item.id }"
      :aria-selected="modelValue === item.id"
      @click="select(item.id)"
    >
      <span class="project-filter__label">{{ item.label }}</span>
      <span class="project-filter__count">{{ counts[item.id] }}</span>
    </button>
  </div>
</template>

<style scoped>
.project-filter {
  display: flex;
  gap: var(--space-6);
  align-items: flex-end;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding-bottom: var(--space-1);
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.project-filter__item {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  flex: 0 0 auto;
  padding: 0 0 var(--space-3);
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  transition: color var(--duration-fast) var(--ease-out-soft);
}

.project-filter__item:hover {
  color: var(--color-text-secondary);
}

.project-filter__item--active {
  color: var(--color-text);
}

.project-filter__item--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-aurora),
    color-mix(in srgb, var(--color-sky) 70%, transparent)
  );
}

.project-filter__label {
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.project-filter__count {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  color: inherit;
  opacity: 0.65;
}

.project-filter__item:focus-visible {
  outline: var(--border-focus);
  outline-offset: 4px;
}

@media (max-width: 720px) {
  .project-filter {
    gap: var(--space-4);
  }

  .project-filter__label {
    font-size: var(--text-xs);
    letter-spacing: 0.04em;
  }
}

@media (max-width: 430px) {
  .project-filter {
    flex-wrap: wrap;
    overflow-x: visible;
    gap: var(--space-3) var(--space-4);
    row-gap: var(--space-2);
  }

  .project-filter__item {
    padding-bottom: var(--space-2);
  }
}
</style>
