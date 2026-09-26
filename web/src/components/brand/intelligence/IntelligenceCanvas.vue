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
  setMode,
} = useIntelligenceScene(host)

const selected = computed(() => hotspot.value)
const focusedCluster = computed(() => activeClusterId.value)
const focusedTitle = computed(() =>
  focusedCluster.value === 'research' ? '深度学习知识星团' : 'AI Agent 知识星团',
)

function openCluster(clusterId: IntelligenceClusterId, trigger?: EventTarget | null) {
  lastTrigger.value = trigger instanceof HTMLElement ? trigger : document.activeElement as HTMLElement | null
  lastTriggerCluster.value = clusterId
  enterClusterFocus(clusterId)
}

function closeCluster() {
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

      <template v-if="focusedCluster">
        <p class="intel-canvas__title">{{ focusedTitle }}</p>
        <p class="intel-canvas__exit-hint">右键或按 Escape 返回星图</p>
        <button ref="exitButton" class="intel-canvas__exit" type="button" @pointerdown.stop @click.stop="closeCluster">
          退出星团视图
        </button>
      </template>
      <p v-else-if="!selected" class="intel-canvas__hint">拖动旋转 · 滚轮缩放 · 点击星点聚焦</p>

      <div v-if="!focusedCluster" class="intel-canvas__actions">
        <button type="button" data-cluster-id="research" @click="openCluster('research', $event.currentTarget)">进入深度学习知识星团</button>
        <button type="button" data-cluster-id="agent" @click="openCluster('agent', $event.currentTarget)">进入 AI Agent 知识星团</button>
      </div>
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

@keyframes label-in { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 720px) {
  .intel-canvas { min-height: 20rem; }
  .intel-canvas__hint { font-size: .56rem; }
  .intel-canvas__label--selected { font-size: .82rem; }
  .intel-canvas__label--hover { font-size: .7rem; }
}
</style>
