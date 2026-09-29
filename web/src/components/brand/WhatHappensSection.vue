<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import MotionSection from '../ui/MotionSection.vue'
import PageContainer from '../layout/PageContainer.vue'
import ActivityStream from '../community/ActivityStream.vue'
import { getHomepageActivities } from '../../content/activities'
import { useMotionPreference } from '../../composables/useMotionPreference'
import { getScrollFocusY, getStickyNavOffset } from '../../lib/layout'
import type { Activity } from '../../types/activity'

const activities = getHomepageActivities()
const activeId = ref(activities[0]?.id ?? '')
const streamRoot = ref<HTMLElement | null>(null)
const { prefersReducedMotion } = useMotionPreference()

const activeActivity = computed<Activity | undefined>(() =>
  activities.find((item) => item.id === activeId.value),
)

let observer: IntersectionObserver | null = null
let scrollRaf = 0

function pickActive() {
  const root = streamRoot.value
  if (!root) return

  const navOffset = getStickyNavOffset()
  const focusY = getScrollFocusY()
  let bestId = activeId.value
  let bestDist = Number.POSITIVE_INFINITY

  root.querySelectorAll<HTMLElement>('[data-activity-id]').forEach((el) => {
    const id = el.dataset.activityId
    if (!id) return
    const rect = el.getBoundingClientRect()
    if (rect.bottom < navOffset || rect.top > window.innerHeight - 48) return
    const mid = rect.top + rect.height * 0.35
    const dist = Math.abs(mid - focusY)
    if (dist < bestDist) {
      bestDist = dist
      bestId = id
    }
  })

  if (bestId !== activeId.value) {
    activeId.value = bestId
  }
}

function onScrollOrResize() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    pickActive()
  })
}

function bindObserver() {
  observer?.disconnect()
  observer = null

  const root = streamRoot.value
  if (!root) return

  const entries = root.querySelectorAll<HTMLElement>('[data-activity-id]')
  if (!entries.length) return

  // Lightweight IO nudge — actual pick uses viewport-center distance
  observer = new IntersectionObserver(
    () => {
      pickActive()
    },
    {
      root: null,
      rootMargin: '-20% 0px -35% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    },
  )

  entries.forEach((el) => observer?.observe(el))
  pickActive()
}

onMounted(async () => {
  await nextTick()
  bindObserver()
  window.addEventListener('scroll', onScrollOrResize, { passive: true })
  window.addEventListener('resize', onScrollOrResize, { passive: true })
})

watch(streamRoot, async () => {
  await nextTick()
  bindObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  window.removeEventListener('scroll', onScrollOrResize)
  window.removeEventListener('resize', onScrollOrResize)
})
</script>

<template>
  <MotionSection
    as="section"
    class="what-happens"
    offset-y="16"
    aria-labelledby="what-happens-title"
  >
    <PageContainer class="what-happens__inner">
      <div class="what-happens__layout">
        <aside class="what-happens__context">
          <div class="what-happens__sticky">
            <p class="what-happens__eyebrow">这里发生的事</p>
            <h2 id="what-happens-title" class="what-happens__title">
              这里是想法成为实践的地方。
            </h2>
            <p class="what-happens__lede">
              工作坊、研读、构建与分享——作品背后的每周文化。
            </p>

            <div
              class="what-happens__active"
              :class="{ 'what-happens__active--instant': prefersReducedMotion }"
              aria-live="polite"
            >
              <div class="what-happens__active-row">
                <span :key="activeActivity?.index" class="what-happens__active-index">
                  {{ activeActivity?.index }}
                </span>
                <span :key="activeActivity?.category" class="what-happens__active-category">
                  {{ activeActivity?.category }}
                </span>
              </div>
              <span
                class="what-happens__active-rule"
                :style="{ width: activeActivity ? '4.5rem' : '2rem' }"
                aria-hidden="true"
              />
            </div>
          </div>
        </aside>

        <div ref="streamRoot" class="what-happens__stream">
          <ActivityStream :activities="activities" :active-id="activeId" />
        </div>
      </div>
    </PageContainer>
  </MotionSection>
</template>

<style scoped>
.what-happens {
  padding-block: var(--space-16) var(--space-20);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-morning) 70%, var(--color-snow)) 0%,
    color-mix(in srgb, var(--color-ivory) 45%, var(--color-snow)) 48%,
    var(--color-snow) 100%
  );
}

.what-happens__inner {
  display: block;
}

.what-happens__layout {
  display: grid;
  /* 左栏给足宽度，保证 lede 单行不断句 */
  grid-template-columns: minmax(26rem, 0.9fr) minmax(0, 1.35fr);
  gap: var(--space-10) var(--space-12);
  align-items: start;
}

.what-happens__context {
  min-width: 0;
}

.what-happens__sticky {
  position: sticky;
  top: var(--sticky-top);
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-8);
}

.what-happens__eyebrow {
  margin: 0;
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.what-happens__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 3.2vw, var(--text-4xl));
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.what-happens__lede {
  margin: 0;
  max-width: 28rem;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.what-happens__active {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 60%, transparent);
}

.what-happens__active-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  min-height: 1.75rem;
}

.what-happens__active-index {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  letter-spacing: 0.04em;
  color: var(--color-mountain);
  animation: what-happens-rise var(--duration-normal) var(--ease-out-soft);
}

.what-happens__active-category {
  display: inline-block;
  font-size: var(--text-xs);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-sky);
  animation: what-happens-fade var(--duration-normal) var(--ease-out-soft);
}

.what-happens__active-rule {
  display: block;
  height: 1px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-aurora) 75%, transparent),
    transparent
  );
  transition: width var(--duration-normal) var(--ease-out-soft);
}

.what-happens__active--instant .what-happens__active-index,
.what-happens__active--instant .what-happens__active-category {
  animation: none;
}

.what-happens__active--instant .what-happens__active-rule {
  transition: none;
}

.what-happens__stream {
  min-width: 0;
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

@keyframes what-happens-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes what-happens-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .what-happens__layout {
    grid-template-columns: minmax(26rem, 0.85fr) minmax(0, 1.2fr);
    gap: var(--space-8);
  }
}

@media (max-width: 900px) {
  .what-happens {
    padding-block: var(--space-12) var(--space-16);
  }

  .what-happens__layout {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .what-happens__sticky {
    position: static;
    padding-bottom: var(--space-2);
  }

  .what-happens__title {
    max-width: none;
  }

  /* Mobile: hide sticky active mirror — entries already show index/category */
  .what-happens__active {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .what-happens__active-index,
  .what-happens__active-category {
    animation: none;
  }
}
</style>
