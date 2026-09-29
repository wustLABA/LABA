<script setup lang="ts">
import { RouterLink } from 'vue-router'

import MotionSection from '../ui/MotionSection.vue'
import PageContainer from '../layout/PageContainer.vue'
import ProjectShowcase from '../project/ProjectShowcase.vue'
import { getFeaturedProjects } from '../../content/projects'

const featuredProjects = getFeaturedProjects().slice(0, 3)
</script>

<template>
  <MotionSection as="section" class="selected-works" offset-y="16">
    <PageContainer class="selected-works__inner">
      <header class="selected-works__header">
        <div class="selected-works__heading">
          <p class="selected-works__eyebrow">精选作品</p>
          <h2 class="selected-works__title">成员构建的作品。</h2>
        </div>
        <div class="selected-works__aside">
          <p class="selected-works__lede">
            来自社团成员个人项目的精选：AI 工程、工具与开源插件。
          </p>
          <RouterLink class="selected-works__all" to="/projects">
            全部作品
            <span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </header>

      <ProjectShowcase :projects="featuredProjects" />
    </PageContainer>
  </MotionSection>
</template>

<style scoped>
.selected-works {
  padding-block: var(--space-12) var(--space-16);
  background: linear-gradient(
    180deg,
    var(--color-snow) 0%,
    color-mix(in srgb, var(--color-ivory) 55%, var(--color-snow)) 48%,
    color-mix(in srgb, var(--color-snow) 70%, var(--color-frost)) 100%
  );
}

.selected-works__inner {
  display: grid;
  gap: var(--space-10);
}

.selected-works__header {
  display: grid;
  /* 右列给足宽度，保证 lede 单行不断句 */
  grid-template-columns: minmax(0, 0.95fr) minmax(30rem, 1.05fr);
  gap: var(--space-6) var(--space-10);
  align-items: end;
}

.selected-works__eyebrow {
  margin-bottom: var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.selected-works__title {
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 3.4vw, var(--text-4xl));
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.selected-works__aside {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

.selected-works__lede {
  max-width: 30rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.selected-works__all {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-mountain);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out-soft);
}

.selected-works__all:hover,
.selected-works__all:focus-visible {
  color: var(--color-sky);
}

.selected-works__all:focus-visible {
  outline: var(--border-focus);
  outline-offset: 3px;
}

@media (max-width: 960px) {
  .selected-works {
    padding-block: var(--space-10) var(--space-16);
  }

  .selected-works__inner {
    gap: var(--space-8);
  }

  .selected-works__header {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    align-items: start;
  }

  .selected-works__lede {
    font-size: var(--text-base);
    max-width: none;
  }
}
</style>
