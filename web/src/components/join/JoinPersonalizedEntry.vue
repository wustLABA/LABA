<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import {
  getJoinDirection,
  joinNeutralEntry,
  type JoinDirectionId,
} from '../../content/join-page'

const props = defineProps<{
  committed: JoinDirectionId | null
}>()

const content = computed(() => getJoinDirection(props.committed))
const titleLines = computed(() =>
  (content.value?.title ?? joinNeutralEntry.title).split('\n'),
)
</script>

<template>
  <section
    class="personalized"
    aria-labelledby="personalized-title"
    aria-live="polite"
  >
    <template v-if="!content">
      <p class="personalized__eyebrow">{{ joinNeutralEntry.eyebrow }}</p>
      <h2 id="personalized-title" class="personalized__title">
        {{ joinNeutralEntry.title }}
      </h2>
      <p class="personalized__lede">{{ joinNeutralEntry.lede }}</p>
      <p class="personalized__note">{{ joinNeutralEntry.note }}</p>
    </template>

    <template v-else-if="content.id === 'hybrid'">
      <p class="personalized__eyebrow">{{ content.eyebrow }}</p>
      <h2 id="personalized-title" class="personalized__title">
        <span
          v-for="(line, i) in titleLines"
          :key="i"
          class="personalized__title-line"
        >
          {{ line }}
        </span>
      </h2>
      <dl class="personalized__meta">
        <div>
          <dt>构建侧</dt>
          <dd>{{ content.buildSide }}</dd>
        </div>
        <div>
          <dt>科研侧</dt>
          <dd>{{ content.researchSide }}</dd>
        </div>
        <div>
          <dt>实践</dt>
          <dd>{{ content.practice }}</dd>
        </div>
      </dl>
      <p class="personalized__note">{{ content.note }}</p>
      <div class="personalized__actions">
        <RouterLink
          v-for="action in content.actions"
          :key="action.to"
          class="personalized__link"
          :to="action.to"
        >
          {{ action.label }}
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <p class="personalized__eyebrow">{{ content.eyebrow }}</p>
      <h2 id="personalized-title" class="personalized__title">
        <span
          v-for="(line, i) in titleLines"
          :key="i"
          class="personalized__title-line"
        >
          {{ line }}
        </span>
      </h2>
      <dl class="personalized__meta">
        <div>
          <dt>从…开始</dt>
          <dd>{{ content.startWith }}</dd>
        </div>
        <div>
          <dt>尝试</dt>
          <dd>{{ content.tryText }}</dd>
        </div>
        <div>
          <dt>学习</dt>
          <dd>{{ content.learn?.join(' · ') }}</dd>
        </div>
        <div>
          <dt>好的第一步</dt>
          <dd>{{ content.goodFirstMove }}</dd>
        </div>
      </dl>
      <div class="personalized__actions">
        <RouterLink
          v-if="content.primary"
          class="personalized__link personalized__link--primary"
          :to="content.primary.to"
        >
          {{ content.primary.label }}
        </RouterLink>
        <RouterLink
          v-if="content.secondary"
          class="personalized__link"
          :to="content.secondary.to"
        >
          {{ content.secondary.label }}
        </RouterLink>
      </div>
    </template>
  </section>
</template>

<style scoped>
.personalized {
  display: grid;
  gap: var(--space-4);
  padding-block: var(--space-2);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
  min-height: 16rem;
}

.personalized__eyebrow {
  margin: 0;
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.personalized__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2.4vw, var(--text-2xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-title-wide);
}

.personalized__title-line {
  display: block;
}

.personalized__lede,
.personalized__note {
  margin: 0;
  max-width: 36rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.personalized__note {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.personalized__meta {
  margin: 0;
  display: grid;
  gap: var(--space-4);
  max-width: 40rem;
}

.personalized__meta div {
  display: grid;
  grid-template-columns: minmax(0, 9rem) minmax(0, 1fr);
  gap: var(--space-3);
  padding-block: var(--space-3);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 40%, transparent);
}

.personalized__meta dt {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.personalized__meta dd {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.personalized__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-6);
  margin-top: var(--space-2);
}

.personalized__link {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--color-sky) 45%, transparent);
  padding-bottom: 0.15rem;
}

.personalized__link--primary {
  color: var(--color-sky);
}

.personalized__link:hover,
.personalized__link:focus-visible {
  color: var(--color-sky);
}

.personalized__link:focus-visible {
  outline: var(--border-focus);
  outline-offset: 4px;
}

@media (max-width: 720px) {
  .personalized__title {
    max-width: none;
  }

  .personalized__meta div {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }
}
</style>
