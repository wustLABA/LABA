<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import MotionSection from '../ui/MotionSection.vue'
import PageContainer from '../layout/PageContainer.vue'
import { getStoryMilestones } from '../../content/story'
import { useMotionPreference } from '../../composables/useMotionPreference'
import { getScrollFocusY, getStickyNavOffset } from '../../lib/layout'

const milestones = getStoryMilestones()
const track = ref<HTMLElement | null>(null)
const progress = ref(0)
const activeId = ref(milestones[0]?.id ?? '')
const { prefersReducedMotion } = useMotionPreference()

let scrollRaf = 0

const progressPercent = computed(() =>
  prefersReducedMotion.value ? 100 : Math.round(progress.value * 1000) / 10,
)

function updateProgress() {
  const el = track.value
  if (!el) return

  if (prefersReducedMotion.value) {
    progress.value = 1
    activeId.value = milestones[milestones.length - 1]?.id ?? activeId.value
    return
  }

  const rect = el.getBoundingClientRect()
  const view = window.innerHeight
  const navOffset = getStickyNavOffset()
  const start = view * 0.72
  const end = Math.max(navOffset + 48, view * 0.28)
  const raw = (start - rect.top) / (rect.height + start - end)
  progress.value = Math.max(0, Math.min(1, raw))

  // Active milestone: closest to reading focus band (below sticky nav)
  const focusY = getScrollFocusY()
  let bestId = activeId.value
  let bestDist = Number.POSITIVE_INFINITY
  el.querySelectorAll<HTMLElement>('[data-milestone-id]').forEach((node) => {
    const id = node.dataset.milestoneId
    if (!id) return
    const r = node.getBoundingClientRect()
    if (r.bottom < navOffset || r.top > view - 40) return
    const mid = r.top + r.height * 0.3
    const dist = Math.abs(mid - focusY)
    if (dist < bestDist) {
      bestDist = dist
      bestId = id
    }
  })
  activeId.value = bestId
}

function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    updateProgress()
  })
}

onMounted(async () => {
  await nextTick()
  updateProgress()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <MotionSection
    as="section"
    class="story"
    offset-y="16"
    aria-labelledby="story-title"
  >
    <PageContainer class="story__inner">
      <header class="story__header">
        <p class="story__eyebrow">故事</p>
        <h2 id="story-title" class="story__title">从好奇到实践。</h2>
        <p class="story__lede">
          这个社区的方向是如何成形的——以及前方仍有什么在等待。
        </p>
      </header>

      <div ref="track" class="story__track">
        <div class="story__rail" aria-hidden="true">
          <div class="story__rail-track" />
          <div
            class="story__rail-progress"
            :style="{ height: `${progressPercent}%` }"
          />
        </div>

        <ol class="story__list">
          <li
            v-for="(item, index) in milestones"
            :key="item.id"
            class="story__item"
            :class="{
              'story__item--active': item.id === activeId,
              'story__item--passed':
                milestones.findIndex((m) => m.id === activeId) > index,
              'story__item--next': item.id === 'next',
            }"
            :data-milestone-id="item.id"
          >
            <div class="story__mark" aria-hidden="true">
              <span class="story__dot" />
            </div>
            <div class="story__body">
              <p class="story__index">
                <span>{{ item.index }}</span>
                <span class="story__label">{{ item.label }}</span>
              </p>
              <h3 class="story__item-title">{{ item.title }}</h3>
              <p class="story__statement">{{ item.statement }}</p>
              <p v-if="item.placeholder" class="story__dev">
                开发占位 · 历史未经核实
              </p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Continuum into Join -->
      <div class="story__continuum" aria-hidden="true">
        <div class="story__continuum-rail" />
        <div class="story__continuum-elbow" />
      </div>
    </PageContainer>
  </MotionSection>
</template>

<style scoped>
/*
 * 时间轴的对齐系统。
 *
 * 关键设计：所有纵向元素的位置都由 --story-axis 推导，而不是各自手调。
 *
 * 旧实现的问题正是「各自手调」：
 *   · rail 定在 left: 0.85rem
 *   · 节点在 2rem 宽的列里居中 → 实际中心 1rem
 *   两者差 0.15rem，肉眼即可看出节点没落在线上；再加上节点用
 *   padding-top: 0.35rem 去够内容首行，字号一变就偏。这类偏移无法靠
 *   试参数长期维持，必须让它们共用同一个基准。
 *
 * 现在：--story-axis 表示轴心到内容左缘的距离，rail 与节点都由它和
 * 自身宽度反推，改一个值全轴联动。
 */
.story {
  --story-axis: 1.5rem; /* 轴心相对内容区左缘的偏移 */
  --story-dot: 0.75rem; /* 节点直径 */
  --story-axis-gap: var(--space-8); /* 轴心到正文的距离 */

  position: relative;
  padding-block: var(--space-20) 0;
  scroll-margin-top: var(--scroll-padding-top);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-snow) 90%, var(--color-morning)) 0%,
    var(--color-morning) 55%,
    color-mix(in srgb, var(--color-morning) 70%, var(--color-snow)) 100%
  );
}

.story__inner {
  display: grid;
  gap: var(--space-10);
  position: relative;
}

.story__header {
  display: grid;
  gap: var(--space-3);
  max-width: 36rem;
}

.story__eyebrow {
  margin: 0;
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.story__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 3.2vw, var(--text-4xl));
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.story__lede {
  margin: 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.story__track {
  position: relative;
  display: grid;
  min-height: 28rem;
}

/*
 * 竖线：中心严格落在 --story-axis 上。
 * 用 mask 让两端渐隐，避免线条以直角硬切入空白区域 —— 这是让整体
 * 看起来「现代」而非「默认样式」的重要细节。
 */
.story__rail {
  position: absolute;
  left: var(--story-axis);
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-1px);
  pointer-events: none;
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0,
    #000 1.5rem,
    #000 calc(100% - 3rem),
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    transparent 0,
    #000 1.5rem,
    #000 calc(100% - 3rem),
    transparent 100%
  );
}

.story__rail-track {
  position: absolute;
  inset: 0;
  background: var(--color-line);
  border-radius: 1px;
}

.story__rail-progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  border-radius: 1px;
  background: linear-gradient(
    180deg,
    var(--color-aurora),
    var(--color-sky) 60%,
    var(--color-mountain)
  );
  transition: height 80ms linear;
}

/*
 * 列表间距：这是「留白节奏」的唯一真源。
 * 旧实现在这里给 gap，又在 .story__body 上叠 padding-bottom，
 * 两个值互相干扰，导致阶段间距实际不可控。
 */
.story__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-10);
}

.story__item {
  position: relative;
  display: grid;
  grid-template-columns: var(--story-axis-gap) minmax(0, 1fr);
  /*
   * 节点与正文首行基线对齐：
   * 首行是 --text-xs 的序号行，其行框高度为 text-xs * leading-normal。
   * 让节点中心落在该行框的中线上，视觉上就与文字对齐。
   */
  align-items: start;
  opacity: 1;
  transition: transform var(--duration-normal) var(--ease-out-soft);
}

.story__mark {
  position: relative;
  display: grid;
  /*
   * 节点中心必须落在 --story-axis 上，而该列宽是 --story-axis-gap，
   * 两者通常不等（轴心 1.5rem vs 列宽 2.5rem）。
   * 因此不能用 justify-items: center —— 那会把节点居中到列里，
   * 与竖线错开半个列宽。改为左对齐后整体右移 --story-axis，再回退
   * 自身半径，使节点中心恰好压在轴上。
   */
  justify-items: start;
  width: var(--story-axis-gap);
  padding-top: 0.2rem;
}

.story__dot {
  /* 左移半个自身宽度，把圆心对准 --story-axis */
  margin-left: calc(var(--story-axis) - var(--story-dot) / 2);
  width: var(--story-dot);
  height: var(--story-dot);
  border-radius: 50%;
  /* 未激活：白底 + 浅灰描边，弱化但仍清晰可辨 */
  background: var(--color-snow);
  border: 2px solid color-mix(in srgb, var(--color-line) 88%, var(--color-text-muted));
  /* 用与外层背景同色的光环把节点从竖线上「挖」出来 */
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-snow) 92%, transparent);
  transition:
    background var(--duration-normal) var(--ease-out-soft),
    border-color var(--duration-normal) var(--ease-out-soft),
    box-shadow var(--duration-normal) var(--ease-out-soft),
    transform var(--duration-normal) var(--ease-out-soft);
}

/* 已读阶段：实心 mountain，比未激活明确、比当前项克制 */
.story__item--passed .story__dot {
  background: var(--color-mountain);
  border-color: var(--color-mountain);
}

/*
 * 当前阶段：实心强调色 + 柔和外发光 + 轻微放大。
 * 三层阴影叠加出「发光」而非「描边」的观感：内层白光环隔开竖线，
 * 中层短距光晕，外层大范围淡光。
 */
.story__item--active .story__dot {
  background: var(--color-sky);
  border-color: var(--color-sky);
  transform: scale(1.12);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--color-snow) 92%, transparent),
    0 0 0 5px color-mix(in srgb, var(--color-sky) 22%, transparent),
    0 0 16px 2px color-mix(in srgb, var(--color-aurora) 42%, transparent);
}

.story__body {
  display: grid;
  /* 内容区内部节奏：序号行 → 标题 → 描述 → 辅助信息 */
  gap: var(--space-2);
  max-width: 34rem;
  padding-bottom: 0;
}

.story__index {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: color var(--duration-normal) var(--ease-out-soft);
}

.story__item--active .story__index {
  color: var(--color-sky);
}

.story__item--passed .story__index {
  color: var(--color-mountain);
}

.story__label {
  letter-spacing: 0.12em;
}

.story__item-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2vw, var(--text-2xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  transition: color var(--duration-normal) var(--ease-out-soft);
}

/*
 * 未激活项不整体降透明度。
 * 旧实现用 opacity: 0.78 压暗整块，代价是描述文字对比度掉到
 * 可读性边缘；改为只降文字颜色，层级由颜色而非透明度表达。
 */
.story__item:not(.story__item--active):not(.story__item--passed) .story__item-title {
  color: color-mix(in srgb, var(--color-text) 62%, var(--color-text-muted));
}

.story__item--passed .story__item-title {
  color: var(--color-text-secondary);
}

.story__item:not(.story__item--active) .story__statement {
  color: var(--color-text-muted);
}

.story__item--active .story__item-title {
  color: var(--color-text);
}

.story__item--active .story__statement {
  color: var(--color-text-secondary);
}

.story__statement {
  margin: 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  transition: color var(--duration-normal) var(--ease-out-soft);
}

/* 辅助信息：与描述拉开距离，形成「正文 / 注脚」两层 */
.story__dev {
  margin: var(--space-1) 0 0;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  line-height: var(--leading-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text-muted) 85%, transparent);
}

.story__item--next .story__item-title {
  color: color-mix(in srgb, var(--color-text) 88%, var(--color-mountain));
}

.story__continuum {
  position: relative;
  height: var(--space-16);
  margin-top: calc(var(--space-4) * -1);
}

.story__continuum-rail {
  position: absolute;
  left: var(--story-axis);
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-1px);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-sky) 55%, var(--color-mountain)),
    color-mix(in srgb, var(--color-aurora) 45%, transparent)
  );
}

/* Desktop: gentle elbow toward Join “NEXT” */
.story__continuum-elbow {
  display: none;
}

@media (min-width: 901px) {
  .story__list {
    gap: var(--space-12);
  }

  .story__track {
    --story-axis-gap: var(--space-10);
  }

  .story__continuum {
    height: var(--space-20);
  }

  .story__continuum-rail {
    bottom: 42%;
  }

  .story__continuum-elbow {
    display: block;
    position: absolute;
    left: var(--story-axis);
    bottom: 28%;
    width: min(11rem, 22vw);
    height: 2px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-aurora) 50%, var(--color-sky)),
      color-mix(in srgb, var(--color-aurora) 18%, transparent)
    );
    transform-origin: left center;
    border-radius: 1px;
  }

  .story__continuum-elbow::after {
    content: '';
    position: absolute;
    right: -1px;
    top: 50%;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-aurora) 55%, var(--color-sky));
    transform: translate(50%, -50%);
    opacity: 0.7;
  }
}

@media (max-width: 720px) {
  .story {
    /* 窄屏收紧轴心与横向间距，避免正文被挤窄 */
    --story-axis: 0.75rem;
    --story-axis-gap: var(--space-5);
    padding-block: var(--space-12) 0;
  }

  .story__list {
    gap: var(--space-8);
  }

  .story__lede,
  .story__statement {
    font-size: var(--text-sm);
  }

  .story__continuum-rail {
    left: var(--story-axis);
  }
}

@media (prefers-reduced-motion: reduce) {
  .story__rail-progress,
  .story__item,
  .story__dot,
  .story__index,
  .story__item-title,
  .story__statement {
    transition: none;
  }

  .story__item--active .story__dot {
    transform: none;
  }
}
</style>
