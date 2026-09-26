import { useIntersectionObserver, useResizeObserver } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue'

import { buildLayout, understandLayout } from '../lib/intelligence/layouts'
import {
  createIntelligenceScene,
  resolvePerformanceTier,
} from '../lib/intelligence/IntelligenceScene'
import type {
  HotspotInfo,
  IntelligenceClusterId,
  IntelligenceMode,
  IntelligenceSceneApi,
} from '../lib/intelligence/types'
import { useMotionPreference } from './useMotionPreference'

function labelsForMode(mode: IntelligenceMode): HotspotInfo[] {
  const source = mode === 'build' ? buildLayout : understandLayout
  return source.nodes
    .filter((n) => n.role === 'primary' && n.label)
    .map((n) => ({
      id: n.id,
      clusterId: n.clusterId,
      label: n.label!,
      microcopy: n.microcopy ?? '',
      mode,
    }))
}

export function useIntelligenceScene(canvasHost: Ref<HTMLElement | null>) {
  const { prefersReducedMotion } = useMotionPreference()
  const mode = ref<IntelligenceMode>('build')
  const useFallback = ref(false)
  const isSectionVisible = ref(false)
  const hasAwakened = ref(false)
  const hotspot = ref<HotspotInfo | null>(null)
  const hovered = ref<HotspotInfo | null>(null)
  const activeClusterId = ref<IntelligenceClusterId | null>(null)
  const labelPositions = ref<Record<string, { x: number; y: number }>>({})
  const primaryLabels = ref<HotspotInfo[]>(labelsForMode('build'))
  const sceneApi = shallowRef<IntelligenceSceneApi | null>(null)

  let labelRaf = 0
  let inlineVisible = false
  let pointerDown: { x: number; y: number } | null = null
  let pointerId: number | null = null
  let isDragging = false

  function syncLabels() {
    const api = sceneApi.value
    if (!api) return
    const next: Record<string, { x: number; y: number }> = {}
    const labels = activeClusterId.value
      ? primaryLabels.value.filter((item) => item.clusterId === activeClusterId.value)
      : [...api.getPrimaryLabels(mode.value)]
    if (hovered.value && !labels.some((item) => item.id === hovered.value?.id)) {
      labels.push(hovered.value)
    }
    if (hotspot.value && !labels.some((item) => item.id === hotspot.value?.id)) {
      labels.push(hotspot.value)
    }
    for (const item of labels) {
      const projected = api.projectNode(item.id)
      if (projected) next[item.id] = projected
    }
    labelPositions.value = next
  }

  function scheduleLabelSync() {
    if (labelRaf) return
    labelRaf = requestAnimationFrame(() => {
      labelRaf = 0
      syncLabels()
      if (isSectionVisible.value && !useFallback.value) scheduleLabelSync()
    })
  }

  function mountScene() {
    const host = canvasHost.value
    if (!host || sceneApi.value || useFallback.value) return

    const api = createIntelligenceScene({
      tier: resolvePerformanceTier(),
      reducedMotion: prefersReducedMotion.value,
      onError() {
        useFallback.value = true
        api.dispose()
        sceneApi.value = null
      },
      onHotspotChange(next) {
        hotspot.value = next
        scheduleLabelSync()
      },
      onHoverChange(next) {
        hovered.value = next
        scheduleLabelSync()
      },
      onClusterActivate(clusterId) {
        enterClusterFocus(clusterId)
      },
      onReady() {
        scheduleLabelSync()
      },
    })

    sceneApi.value = api
    api.mount(host)
    // 初始只保留「深度学习」与「AI Agent」两个核心点，不自动展开星团
    api.setMode(mode.value, false)
    api.setVisible(isSectionVisible.value)
    if (hasAwakened.value) api.setAwake(true)
  }

  function setMode(next: IntelligenceMode) {
    mode.value = next
    primaryLabels.value = labelsForMode(next)
    sceneApi.value?.setMode(next, false)
    hotspot.value = null
    syncLabels()
  }

  function onPointer(event: PointerEvent) {
    const host = canvasHost.value
    const api = sceneApi.value
    if (!host || !api || prefersReducedMotion.value) return
    const rect = host.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    api.setPointer(nx, ny)
    if (!isDragging) api.hoverAt(nx, ny)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (pointerId !== null) return
    pointerId = event.pointerId
    pointerDown = { x: event.clientX, y: event.clientY }
    isDragging = false
    ;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointerDown || (pointerId !== null && event.pointerId !== pointerId)) return
    const host = canvasHost.value
    if (!host) return
    const dx = (event.clientX - pointerDown.x) / Math.max(host.clientWidth, 1)
    const dy = (event.clientY - pointerDown.y) / Math.max(host.clientHeight, 1)
    if (Math.abs(dx) + Math.abs(dy) > 0.008) isDragging = true
    if (isDragging) {
      sceneApi.value?.rotateBy(dx, dy)
      pointerDown = { x: event.clientX, y: event.clientY }
    }
  }

  function finishPointer(event?: PointerEvent, select = false) {
    const host = canvasHost.value
    if (select && host && pointerDown && event && !isDragging) {
      const rect = host.getBoundingClientRect()
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      sceneApi.value?.selectAt(nx, ny)
    }
    const target = event?.currentTarget as HTMLElement | null
    if (target && pointerId !== null && target.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture(pointerId)
    }
    pointerDown = null
    pointerId = null
    isDragging = false
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    finishPointer(event, true)
  }

  function onPointerCancel(event: PointerEvent) {
    finishPointer(event)
  }

  function enterClusterFocus(clusterId: IntelligenceClusterId) {
    // Start the scene lifecycle before moving the one canvas through Teleport.
    // The next frame measures its full-viewport host, then begins the guide
    // reveal against the final camera dimensions.
    sceneApi.value?.setVisible(true)
    sceneApi.value?.setAwake(true)
    activeClusterId.value = clusterId
    isSectionVisible.value = true
    requestAnimationFrame(() => {
      const host = canvasHost.value
      if (!host || activeClusterId.value !== clusterId) return
      sceneApi.value?.resize(host.clientWidth, host.clientHeight)
      sceneApi.value?.enterClusterFocus(clusterId)
    })
    primaryLabels.value = labelsForMode(mode.value).filter(
      (item) => item.clusterId === clusterId,
    )
    hotspot.value = null
    hovered.value = null
    scheduleLabelSync()
  }

  function exitClusterFocus() {
    sceneApi.value?.exitClusterFocus()
    activeClusterId.value = null
    requestAnimationFrame(() => {
      // After Teleport returns the host, the observer's last inline sample is
      // authoritative again. This preserves the normal offscreen RAF pause.
      isSectionVisible.value = inlineVisible
      sceneApi.value?.setVisible(inlineVisible)
    })
    primaryLabels.value = labelsForMode(mode.value)
    hotspot.value = null
    hovered.value = null
    pointerDown = null
    pointerId = null
    isDragging = false
    scheduleLabelSync()
  }

  function clearSelection() {
    sceneApi.value?.clearSelection()
    hotspot.value = null
  }

  function onPointerLeave() {
    if (pointerId === null) finishPointer()
    sceneApi.value?.setPointer(0, 0)
    sceneApi.value?.hoverAt(9, 9) // 远离画布 → 清除悬停
  }

  function onWheel(event: WheelEvent) {
    const api = sceneApi.value
    if (!api || useFallback.value) return
    if (
      event.ctrlKey ||
      event.metaKey ||
      !Number.isFinite(event.deltaY) ||
      event.deltaY === 0
    ) return
    const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? Math.max(canvasHost.value?.clientHeight ?? 0, 1)
        : 1
    const delta = Math.max(-2400, Math.min(2400, event.deltaY * multiplier))
    if (delta === 0) return
    if (event.cancelable) event.preventDefault()
    api.zoomBy(delta)
    scheduleLabelSync()
  }

  useIntersectionObserver(
    canvasHost,
    ([entry]) => {
      inlineVisible = !!entry?.isIntersecting
      const visible = inlineVisible || activeClusterId.value !== null
      isSectionVisible.value = visible
      // Teleport may transiently report the moved inline host as outside the
      // viewport. The overlay remains the visibility authority while focused.
      sceneApi.value?.setVisible(visible)
      if (visible && !hasAwakened.value) {
        hasAwakened.value = true
        sceneApi.value?.setAwake(true)
      }
      if (visible) scheduleLabelSync()
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
  )

  useResizeObserver(canvasHost, (entries) => {
    const entry = entries[0]
    if (!entry || !sceneApi.value) return
    const { width, height } = entry.contentRect
    sceneApi.value.resize(width, height)
    syncLabels()
  })

  watch(prefersReducedMotion, (reduced) => {
    sceneApi.value?.setReducedMotion(reduced)
  })

  onMounted(() => {
    mountScene()
  })

  onBeforeUnmount(() => {
    if (labelRaf) cancelAnimationFrame(labelRaf)
    activeClusterId.value = null
    sceneApi.value?.dispose()
    sceneApi.value = null
  })

  return {
    mode,
    setMode,
    useFallback,
    isSectionVisible,
    hasAwakened,
    hotspot,
    hovered,
    activeClusterId,
    labelPositions,
    primaryLabels,
    onPointer,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
    onWheel,
    enterClusterFocus,
    exitClusterFocus,
    clearSelection,
  }
}
