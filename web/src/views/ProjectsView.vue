<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import PageContainer from '../components/layout/PageContainer.vue'
import ProjectArchiveFeatured from '../components/project/ProjectArchiveFeatured.vue'
import ProjectArchivePreview from '../components/project/ProjectArchivePreview.vue'
import ProjectFilterNav from '../components/project/ProjectFilterNav.vue'
import ProjectWorkRow from '../components/project/ProjectWorkRow.vue'
import ProjectsClosingCta from '../components/project/ProjectsClosingCta.vue'
import {
  PROJECTS_ARCHIVE_UPDATED,
  getAllProjects,
  getArchiveFeatured,
  getArchiveIndex,
  getProjectsByFilter,
} from '../content/projects'
import { useMotionPreference } from '../composables/useMotionPreference'
import type { Project, ProjectFilterId } from '../types/project'

const filter = ref<ProjectFilterId>('all')
const { prefersReducedMotion } = useMotionPreference()
const listKey = ref(0)
const previewSlug = ref<string>('')

const allProjects = getAllProjects()

const counts = computed(() => ({
  all: getProjectsByFilter('all').length,
  'ai-engineering': getProjectsByFilter('ai-engineering').length,
  research: getProjectsByFilter('research').length,
  tools: getProjectsByFilter('tools').length,
}))

const featured = computed(() => getArchiveFeatured(filter.value))

const indexProjects = computed(() =>
  getArchiveIndex(filter.value, featured.value?.slug),
)

const previewProject = computed<Project | undefined>(() => {
  const list = indexProjects.value
  if (!list.length) return undefined
  return list.find((p) => p.slug === previewSlug.value) ?? list[0]
})

function setPreview(slug: string) {
  previewSlug.value = slug
}

function resetPreview() {
  previewSlug.value = indexProjects.value[0]?.slug ?? ''
}

watch(
  filter,
  () => {
    listKey.value += 1
    resetPreview()
  },
  { immediate: true },
)
</script>

<template>
  <main class="projects-archive">
    <PageContainer class="projects-archive__inner">
      <!-- 01 Archive Header -->
      <header class="projects-archive__header">
        <div class="projects-archive__heading">
          <p class="projects-archive__eyebrow">作品档案</p>
          <h1 class="projects-archive__title">
            成员构建、
            <span class="projects-archive__title-break">测试并分享的作品。</span>
          </h1>
        </div>
        <div class="projects-archive__aside">
          <p class="projects-archive__lede">
            社团成员的个人项目，涵盖 AI 工程、工具与开源插件。
          </p>
          <dl class="projects-archive__stats">
            <div class="projects-archive__stat">
              <dt>条目</dt>
              <dd>{{ allProjects.length }}</dd>
            </div>
            <div class="projects-archive__stat">
              <dt>更新</dt>
              <dd>{{ PROJECTS_ARCHIVE_UPDATED }}</dd>
            </div>
          </dl>
        </div>
      </header>

      <!-- 02 Filter -->
      <div class="projects-archive__controls">
        <ProjectFilterNav v-model="filter" :counts="counts" />
      </div>

      <div
        :key="listKey"
        class="projects-archive__body"
        :class="{
          'projects-archive__body--motion': !prefersReducedMotion,
        }"
      >
        <!-- 03 Featured -->
        <section
          v-if="featured"
          class="projects-archive__featured"
          aria-label="精选作品"
        >
          <ProjectArchiveFeatured
            :project="featured"
            :index-label="filter === 'all' ? '精选' : '主打条目'"
          />
        </section>

        <!-- 04 Work Index + Desktop Sticky Preview -->
        <section
          v-if="indexProjects.length"
          class="projects-archive__index"
          aria-label="作品索引"
        >
          <p class="projects-archive__index-label">索引</p>

          <div class="projects-archive__index-layout">
            <div class="projects-archive__rows">
              <ProjectWorkRow
                v-for="(project, i) in indexProjects"
                :key="project.slug"
                :project="project"
                :index="i + 2"
                :active="previewProject?.slug === project.slug"
                @preview="setPreview"
              />
            </div>

            <div v-if="previewProject" class="projects-archive__preview-col">
              <ProjectArchivePreview :project="previewProject" />
            </div>
          </div>
        </section>

        <p
          v-else-if="!featured"
          class="projects-archive__empty"
          role="status"
        >
          该视图下暂无条目。
        </p>
      </div>

      <!-- 05 Closing CTA -->
      <div class="projects-archive__closing">
        <ProjectsClosingCta />
      </div>
    </PageContainer>
  </main>
</template>

<style scoped>
.projects-archive {
  position: relative;
  padding-block: var(--space-16) var(--space-20);
  background: linear-gradient(
    180deg,
    var(--color-snow) 0%,
    color-mix(in srgb, var(--color-morning) 55%, var(--color-snow)) 42%,
    color-mix(in srgb, var(--color-frost) 28%, var(--color-snow)) 100%
  );
}

.projects-archive__inner {
  display: grid;
  gap: var(--space-12);
}

.projects-archive__header {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(14rem, 0.85fr);
  gap: var(--space-8) var(--space-12);
  align-items: end;
}

.projects-archive__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.projects-archive__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4.2vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-hero);
}

.projects-archive__title-break {
  display: block;
}

.projects-archive__aside {
  display: grid;
  gap: var(--space-6);
}

.projects-archive__lede {
  margin: 0;
  max-width: 28rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.projects-archive__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6) var(--space-10);
  margin: 0;
}

.projects-archive__stat {
  display: grid;
  gap: var(--space-1);
}

.projects-archive__stat dt {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.projects-archive__stat dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.projects-archive__controls {
  padding-bottom: var(--space-2);
  border-bottom: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
  min-width: 0;
  max-width: 100%;
}

.projects-archive__body {
  display: grid;
  gap: var(--space-12);
}

.projects-archive__body--motion {
  animation: archive-in 320ms var(--ease-out-soft);
}

.projects-archive__featured {
  display: grid;
}

.projects-archive__index-label {
  margin: 0 0 var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.projects-archive__index-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.75fr);
  gap: var(--space-8) var(--space-10);
  align-items: start;
}

.projects-archive__rows {
  display: grid;
  min-width: 0;
}

.projects-archive__preview-col {
  min-width: 0;
  border-left: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
  padding-left: var(--space-8);
}

.projects-archive__empty {
  margin: 0;
  color: var(--color-text-secondary);
}

.projects-archive__closing {
  padding-top: var(--space-8);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

@keyframes archive-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .projects-archive__body--motion {
    animation: none;
  }
}

@media (max-width: 1100px) {
  .projects-archive__index-layout {
    grid-template-columns: 1fr;
  }

  .projects-archive__preview-col {
    display: none;
  }
}

@media (max-width: 900px) {
  .projects-archive__header {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .projects-archive__title {
    max-width: none;
  }
}

@media (max-width: 720px) {
  .projects-archive {
    padding-block: var(--space-12) var(--space-16);
  }

  .projects-archive__inner {
    gap: var(--space-10);
  }
}
</style>
