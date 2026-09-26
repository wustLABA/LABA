<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'

defineOptions({ inheritAttrs: false })
import { onKeyStroke, useScrollLock } from '@vueuse/core'

import { useIntelligenceScene } from '../../../composables/useIntelligenceScene'
import type { IntelligenceClusterId, IntelligenceMode } from '../../../lib/intelligence/types'
import IntelligenceFallback from './IntelligenceFallback.vue'

const props = defineProps<{ mode: IntelligenceMode }>()

const attrs = useAttrs()
const host = ref<HTMLElement | null>(null)
const dialog = ref<HTMLElement | null>(null)
const exitButton = ref<HTMLButtonElement | null>(null)
const lastTrigger = ref<HTMLElement | null>(null)
const lastTriggerCluster = ref<IntelligenceClusterId | null>(null)
const bodyLock = useScrollLock(document.body)
let removeFocusTrap: (() => void) | null = null

const FOCUSABLE = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function focusableInDialog() {
  return Array.from(dialog.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    .filter((element) => !element.hasAttribute('hidden'))
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !focusedCluster.value) return
  const items = focusableInDialog()
  if (!items.length) return
  const first = items[0]!
  const last = items.at(-1)!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
const {
  useFallback,
  hotspot,
  hovered,
  activeClusterId,
  exitPhase,
  labelPositions,
  onPointer,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onWheel,
  enterClusterFocus,
  exitClusterFocus,
  focusNode,
  setMode,
} = useIntelligenceScene(host)

const selected = computed(() => hotspot.value)
const focusedCluster = computed(() => activeClusterId.value)
/**
 * 退出过程中仍要保持全屏遮罩渲染，直到淡出结束才交还内联布局。
 * `activeClusterId` 在 finishExit 之前不会清空，因此这里直接复用即可；
 * 单独的 isExiting 用于在收回阶段禁用指针交互，避免动画中途被打断。
 */
const isExiting = computed(() => exitPhase.value !== 'idle')
const focusedTitle = computed(() =>
  focusedCluster.value === 'research' ? '深度学习知识星团' : 'AI Agent 知识星团',
)

function openCluster(clusterId: IntelligenceClusterId, trigger?: EventTarget | null) {
  lastTrigger.value = trigger instanceof HTMLElement ? trigger : document.activeElement as HTMLElement | null
  lastTriggerCluster.value = clusterId
  enterClusterFocus(clusterId)
}

function closeCluster() {
  // 退出动画进行中忽略重复触发，否则会重置计时器、把收回过程打断成两段
  if (isExiting.value) return
  exitClusterFocus()
}

function onContextMenu(event: MouseEvent) {
  if (!focusedCluster.value) return
  event.preventDefault()
  event.stopPropagation()
  closeCluster()
}

watch(focusedCluster, async (clusterId) => {
  bodyLock.value = !!clusterId
  removeFocusTrap?.()
  removeFocusTrap = null
  if (clusterId) {
    await nextTick()
    document.addEventListener('keydown', trapFocus)
    removeFocusTrap = () => document.removeEventListener('keydown', trapFocus)
    exitButton.value?.focus()
  } else {
    await nextTick()
    const trigger = lastTrigger.value
    if (trigger?.isConnected) {
      trigger.focus()
    } else if (lastTriggerCluster.value) {
      const clusterId = lastTriggerCluster.value
      document.querySelector<HTMLButtonElement>(
        `.intel-canvas__actions button[data-cluster-id="${clusterId}"]`,
      )?.focus()
    }
    lastTrigger.value = null
    lastTriggerCluster.value = null
  }
})

onKeyStroke('Escape', () => {
  if (focusedCluster.value) closeCluster()
})

onBeforeUnmount(() => {
  removeFocusTrap?.()
  bodyLock.value = false
})

// 名称直接显示在星点上方（跟随相机飞行实时投影），不出现卡片
function labelStyle(id: string) {
  const pos = labelPositions.value[id]
  if (!pos) return { display: 'none' }
  return { transform: `translate(-50%, -160%) translate(${pos.x}px, ${pos.y}px)` }
}

/**
 * tooltip 的定位锚点：贴着选中节点的投影位置，并做边界收敛，
 * 避免贴到视口边缘时被裁切。仅在星团视图下展示。
 */
const tooltipStyle = computed(() => {
  const id = selected.value?.id
  if (!id) return { display: 'none' }
  const pos = labelPositions.value[id]
  if (!pos) return { display: 'none' }
  const margin = 20
  const cardW = 340
  const cardH = 260
  const vw = window.innerWidth
  const vh = window.innerHeight
  // 优先放在节点右下方；右侧空间不足则翻到左侧，下方不足则翻到上方
  let x = pos.x + 28
  if (x + cardW + margin > vw) x = Math.max(margin, pos.x - cardW - 28)
  let y = pos.y + 18
  if (y + cardH + margin > vh) y = Math.max(margin, vh - cardH - margin)
  return { transform: `translate(${x}px, ${y}px)`, display: 'block' }
})

/** 点击 tooltip 里的关联节点 → 切换到该概念。 */

watch(() => props.mode, (next) => setMode(next), { immediate: true })
</script>

<template>
  <Teleport to="body" :disabled="!focusedCluster">
    <div
      ref="dialog"
      v-bind="attrs"
      class="intel-canvas"
      :class="{ 'intel-canvas--focused': focusedCluster }"
      :role="focusedCluster ? 'dialog' : undefined"
      :aria-modal="focusedCluster ? 'true' : undefined"
      :aria-label="focusedCluster ? focusedTitle : undefined"
      @contextmenu="onContextMenu"
      @pointermove="onPointer"
      @pointerdown="onPointerDown"
      @pointermove.capture="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @pointerleave="onPointerLeave"
      @wheel="onWheel"
    >
      <div ref="host" class="intel-canvas__host" />
      <IntelligenceFallback v-if="useFallback" :mode="mode" :focused-cluster="focusedCluster" />

      <div v-else class="intel-canvas__labels" aria-hidden="true">
        <span
          v-if="hovered && hovered.id !== selected?.id && labelPositions[hovered.id]"
          class="intel-canvas__label intel-canvas__label--hover"
          :style="labelStyle(hovered.id)"
        >{{ hovered.label }}</span>
        <span
          v-if="selected && labelPositions[selected.id]"
          class="intel-canvas__label intel-canvas__label--selected"
          :style="labelStyle(selected.id)"
        >{{ selected.label }}</span>
      </div>

      <template v-if="focusedCluster && !isExiting">
        <p class="intel-canvas__title">{{ focusedTitle }}</p>
        <p class="intel-canvas__exit-hint">左键拖动旋转 · 中键拖动平移 · 滚轮缩放 · 右键或 Escape 返回星图</p>
        <button ref="exitButton" class="intel-canvas__exit" type="button" @pointerdown.stop @click.stop="closeCluster">
          退出星团视图
        </button>
      </template>
      <p v-else-if="!selected && !isExiting" class="intel-canvas__hint">左键拖动旋转 · 中键拖动平移 · 滚轮缩放 · 点击星点聚焦</p>

      <!-- 节点 tooltip：名词释义卡片。仅在星团视图下、点选节点后出现 -->
      <div
        v-if="focusedCluster && selected"
        class="intel-tip"
        role="dialog"
        :aria-label="`${selected.label} 名词解释`"
        :style="tooltipStyle"
        @pointerdown.stop
        @click.stop
        @wheel.stop
      >
        <p class="intel-tip__eyebrow">
          {{ selected.clusterId === 'research' ? '深度学习知识星团' : 'AI Agent 知识星团' }}
        </p>
        <h3 class="intel-tip__title">{{ selected.label }}</h3>
        <p v-if="selected.microcopy" class="intel-tip__summary">{{ selected.microcopy }}</p>
        <p v-if="selected.concept" class="intel-tip__concept">{{ selected.concept }}</p>
        <div v-if="selected.related && selected.related.length" class="intel-tip__related">
          <p class="intel-tip__related-label">关联概念</p>
          <div class="intel-tip__chips">
            <button
              v-for="item in selected.related"
              :key="item.id"
              type="button"
              class="intel-tip__chip"
              @click="focusNode(item.id)"
            >{{ item.label }}</button>
          </div>
        </div>
      </div>

      <div v-if="!focusedCluster" class="intel-canvas__actions">
        <button type="button" data-cluster-id="research" @click="openCluster('research', $event.currentTarget)">进入深度学习知识星团</button>
        <button type="button" data-cluster-id="agent" @click="openCluster('agent', $event.currentTarget)">进入 AI Agent 知识星团</button>
      </div>

      <!--
        退出星团视图的第二阶段：节点缩回核心后，用一层与主页面同色的遮罩
        把画面淡出，避免收回结束瞬间硬切回内联视图。
        收回阶段（collapsing）不加遮罩，保证「缩回」过程完整可见。
      -->
      <div
        v-if="exitPhase === 'fading'"
        class="intel-canvas__fade"
        aria-hidden="true"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.intel-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  isolation: isolate;
  overflow: visible;
  cursor: grab;
  touch-action: pan-y;
  overscroll-behavior: contain;
}


.intel-canvas:active { cursor: grabbing; }
.intel-canvas__host { position: absolute; inset: 0; }
.intel-canvas__host :deep(canvas) { width: 100% !important; height: 100% !important; }
.intel-canvas__labels { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.intel-canvas__label { position: absolute; top: 0; left: 0; color: #c8fff0; font-family: var(--font-mono); font-size: .72rem; font-weight: 700; letter-spacing: .13em; text-shadow: 0 0 12px #31d5ad; white-space: nowrap; }
.intel-canvas__label--hover { color: rgba(224, 250, 240, .92); font-size: .78rem; animation: label-in .24s ease-out both; }
.intel-canvas__label--selected { color: #f0fff9; font-size: .9rem; text-shadow: 0 0 8px #47e6ba, 0 0 24px #20b58e; animation: label-in .32s ease-out both; }
.intel-canvas__hint { position: absolute; left: 50%; bottom: 1rem; transform: translateX(-50%); margin: 0; color: rgba(201, 255, 240, .62); font-family: var(--font-mono); font-size: .64rem; letter-spacing: .08em; white-space: nowrap; pointer-events: none; }
.intel-canvas__actions { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.intel-canvas--focused { position: fixed; inset: 0; z-index: var(--z-modal); width: 100vw; height: 100dvh; overflow: hidden; touch-action: none; background: radial-gradient(ellipse 58% 64% at 50% 50%, color-mix(in srgb, var(--color-text) 76%, var(--color-success)), color-mix(in srgb, var(--color-mountain) 64%, var(--color-glacier)) 58%, var(--color-snow) 100%); }
.intel-canvas--focused .intel-canvas__host { position: absolute; inset: 0; }
.intel-canvas__title, .intel-canvas__exit-hint, .intel-canvas__exit { position: absolute; z-index: 2; font-family: var(--font-mono); }
.intel-canvas__title { top: clamp(1rem, 3vw, 2rem); left: clamp(1rem, 3vw, 2rem); margin: 0; color: var(--color-snow); font-size: var(--text-sm); letter-spacing: .12em; }
.intel-canvas__exit-hint { left: clamp(1rem, 3vw, 2rem); bottom: clamp(1rem, 3vw, 2rem); margin: 0; color: color-mix(in srgb, var(--color-snow) 72%, transparent); font-size: var(--text-xs); letter-spacing: .08em; }
.intel-canvas__exit { top: clamp(1rem, 3vw, 2rem); right: clamp(1rem, 3vw, 2rem); border: 1px solid color-mix(in srgb, var(--color-snow) 48%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--color-text) 54%, transparent); padding: .6rem .85rem; color: var(--color-snow); font: inherit; font-size: var(--text-xs); letter-spacing: .08em; cursor: pointer; }
.intel-canvas__exit:focus-visible { outline: 2px solid var(--color-snow); outline-offset: 3px; }

/* ── 退出淡出遮罩 ────────────────────────────────────────────────────────
   盖在收回动画的结果之上，把全屏画面渐隐到主页面底色。
   颜色取自 --color-snow，与主页面背景一致，因此淡出终点就是主页面的样子，
   中间不会出现一帧突兀的深色块。 */
.intel-canvas__fade {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background: var(--color-snow);
  animation: intel-fade-out 420ms ease-out forwards;
}
@keyframes intel-fade-out {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  /* 减动效时不做渐显，直接切到终点，避免任何闪烁 */
  .intel-canvas__fade { animation: none; opacity: 1; }
}

/* ── 节点 tooltip ────────────────────────────────────────────────────────
   玻璃卡片风格，与 Star Map 的深色聚焦背景同调（雪白文字 + 极光蓝描边）。
   绝对定位在左上原点，由 tooltipStyle 计算 translate 贴合节点投影位置。 */
.intel-tip {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  inline-size: min(21rem, calc(100vw - 2.5rem));
  padding: .95rem 1.05rem 1.05rem;
  border: 1px solid color-mix(in srgb, var(--color-glacier) 42%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-text) 82%, transparent);
  backdrop-filter: blur(14px) saturate(1.25);
  box-shadow:
    0 18px 48px color-mix(in srgb, var(--color-text) 46%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--color-snow) 14%, transparent);
  pointer-events: auto;
  animation: tip-in .22s ease-out both;
}
.intel-tip__eyebrow {
  margin: 0 0 .3rem;
  color: color-mix(in srgb, var(--color-aurora) 88%, var(--color-snow));
  font-family: var(--font-mono);
  font-size: .58rem;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.intel-tip__title {
  margin: 0 0 .45rem;
  color: var(--color-snow);
  font-size: 1.05rem;
  font-weight: 650;
  letter-spacing: .02em;
}
.intel-tip__summary {
  margin: 0 0 .5rem;
  color: color-mix(in srgb, var(--color-snow) 84%, transparent);
  font-size: .78rem;
  line-height: 1.62;
}
.intel-tip__concept {
  margin: 0;
  padding-top: .5rem;
  border-top: 1px solid color-mix(in srgb, var(--color-glacier) 20%, transparent);
  color: color-mix(in srgb, var(--color-snow) 68%, transparent);
  font-size: .74rem;
  line-height: 1.78;
}
.intel-tip__related { margin-top: .75rem; }
.intel-tip__related-label {
  margin: 0 0 .4rem;
  color: color-mix(in srgb, var(--color-snow) 52%, transparent);
  font-family: var(--font-mono);
  font-size: .56rem;
  letter-spacing: .14em;
}
.intel-tip__chips { display: flex; flex-wrap: wrap; gap: .35rem; }
.intel-tip__chip {
  border: 1px solid color-mix(in srgb, var(--color-aurora) 40%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-aurora) 12%, transparent);
  padding: .24rem .58rem;
  color: color-mix(in srgb, var(--color-glacier) 92%, var(--color-snow));
  font: inherit;
  font-size: .66rem;
  letter-spacing: .02em;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}
.intel-tip__chip:hover {
  border-color: color-mix(in srgb, var(--color-aurora) 72%, transparent);
  background: color-mix(in srgb, var(--color-aurora) 24%, transparent);
}
.intel-tip__chip:focus-visible { outline: 2px solid var(--color-aurora); outline-offset: 2px; }

@keyframes tip-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .intel-tip { animation: none; }
}

@keyframes label-in { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 720px) {
  .intel-canvas { min-height: 20rem; }
  .intel-canvas__hint { font-size: .56rem; }
  .intel-canvas__label--selected { font-size: .82rem; }
  .intel-canvas__label--hover { font-size: .7rem; }
}
</style>
