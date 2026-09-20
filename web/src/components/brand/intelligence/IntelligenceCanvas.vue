<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useIntelligenceScene } from '../../../composables/useIntelligenceScene'
import type { IntelligenceMode } from '../../../lib/intelligence/types'
import IntelligenceFallback from './IntelligenceFallback.vue'

const props = defineProps<{ mode: IntelligenceMode }>()

const host = ref<HTMLElement | null>(null)
const {
  useFallback,
  hotspot,
  hovered,
  labelPositions,
  onPointer,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onWheel,
  setMode,
} = useIntelligenceScene(host)

const selected = computed(() => hotspot.value)

// 名称直接显示在星点上方（跟随相机飞行实时投影），不出现卡片
function labelStyle(id: string) {
  const pos = labelPositions.value[id]
  if (!pos) return { display: 'none' }
  return { transform: `translate(-50%, -160%) translate(${pos.x}px, ${pos.y}px)` }
}

watch(() => props.mode, (next) => setMode(next), { immediate: true })
</script>

<template>
  <div
    class="intel-canvas"
    @pointermove="onPointer"
    @pointerdown="onPointerDown"
    @pointermove.capture="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @pointerleave="onPointerLeave"
    @wheel="onWheel"
  >
    <div ref="host" class="intel-canvas__host" />
    <IntelligenceFallback v-if="useFallback" :mode="mode" />

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

    <p v-if="!selected" class="intel-canvas__hint">拖动旋转 · 滚轮缩放 · 点击星点聚焦</p>
  </div>
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

@keyframes label-in { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 720px) {
  .intel-canvas { min-height: 20rem; }
  .intel-canvas__hint { font-size: .56rem; }
  .intel-canvas__label--selected { font-size: .82rem; }
  .intel-canvas__label--hover { font-size: .7rem; }
}
</style>
