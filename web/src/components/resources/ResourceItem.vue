<script setup lang="ts">
/**
 * 单条学习资料。阶段内嵌与底部资料库共用同一套渲染，
 * 避免两处样式漂移 —— 两处外观必须一致，用户才会认为是同一批资料。
 */
import { computed } from 'vue'

import {
  RESOURCE_KIND_META,
  type LearningResource,
} from '../../content/resources'

const props = defineProps<{
  resource: LearningResource
  /** 紧凑模式：阶段卡片内使用，去掉上下留白节省纵向空间 */
  compact?: boolean
}>()

const meta = computed(() => RESOURCE_KIND_META[props.resource.kind])

const facts = computed(() =>
  [props.resource.source, props.resource.level, props.resource.duration].filter(
    (v): v is string => Boolean(v),
  ),
)

/** 外部链接需要新标签页与 noopener；站内文件同标签打开即可（浏览器直接渲染 PDF）。 */
const linkAttrs = computed(() =>
  props.resource.external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {},
)
</script>

<template>
  <li class="resource-item" :class="{ 'resource-item--compact': compact }">
    <a
      class="resource-item__link"
      :href="resource.href"
      v-bind="linkAttrs"
    >
      <span class="resource-item__kind" :data-tone="meta.tone">{{ meta.label }}</span>

      <span class="resource-item__body">
        <span class="resource-item__head">
          <span class="resource-item__title">{{ resource.title }}</span>
          <span v-if="resource.mustRead" class="resource-item__must">必读</span>
        </span>
        <span class="resource-item__note">{{ resource.note }}</span>
        <span v-if="facts.length" class="resource-item__facts">
          <template v-for="(fact, i) in facts" :key="fact">
            <span v-if="i > 0" class="resource-item__sep" aria-hidden="true">·</span>
            <span>{{ fact }}</span>
          </template>
        </span>
      </span>
    </a>
  </li>
</template>

<style scoped>
.resource-item {
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.resource-item__link {
  display: grid;
  grid-template-columns: 3.75rem minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
  /* 上下留白刻意不对称：视觉重量在标题，上方留白略大能形成条目分组感，
     但整体保持紧凑，避免十几条时列表拖得过长 */
  padding-block: var(--space-4);
  text-decoration: none;
  color: inherit;
}

.resource-item--compact .resource-item__link {
  padding-block: var(--space-3);
}

.resource-item__link:hover .resource-item__title {
  color: var(--color-sky);
}

.resource-item__link:focus-visible {
  outline: var(--border-focus);
  outline-offset: 0.25rem;
  border-radius: var(--radius-sm);
}

.resource-item__kind {
  justify-self: start;
  margin-top: 0.15rem;
  padding: 0.2rem 0.4rem;
  border: var(--border-default);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-align: center;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* 类型色调：只用描边与文字色，避免整页出现多种高饱和色块 */
.resource-item__kind[data-tone='doc'] { border-color: color-mix(in srgb, var(--color-sky) 55%, transparent); color: var(--color-sky); }
.resource-item__kind[data-tone='slide'] { border-color: color-mix(in srgb, var(--color-aurora) 70%, transparent); color: var(--color-mountain); }
.resource-item__kind[data-tone='video'] { border-color: color-mix(in srgb, var(--color-glacier) 90%, var(--color-sky)); color: var(--color-mountain); }
.resource-item__kind[data-tone='code'] { border-color: color-mix(in srgb, var(--color-success) 55%, transparent); color: var(--color-success); }
.resource-item__kind[data-tone='data'] { border-color: color-mix(in srgb, var(--color-mountain) 45%, transparent); color: var(--color-mountain); }

.resource-item__body {
  display: grid;
  gap: var(--space-2);
}

.resource-item__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-3);
}

.resource-item__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  transition: color var(--duration-fast) ease;
}

.resource-item__must {
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-sky) 16%, transparent);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--color-sky);
  white-space: nowrap;
}

.resource-item__note {
  max-width: 42rem;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.resource-item__facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.resource-item__sep {
  opacity: 0.5;
}

@media (max-width: 560px) {
  .resource-item__link {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}
</style>
