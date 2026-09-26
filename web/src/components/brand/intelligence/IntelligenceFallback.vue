<script setup lang="ts">
import type { IntelligenceClusterId, IntelligenceMode } from '../../../lib/intelligence/types'

defineProps<{
  mode: IntelligenceMode
  focusedCluster: IntelligenceClusterId | null
}>()
</script>

<template>
  <div
    class="intel-fallback"
    :class="{
      'intel-fallback--focused': focusedCluster,
      'intel-fallback--research': focusedCluster === 'research',
      'intel-fallback--agent': focusedCluster === 'agent',
    }"
    aria-hidden="true"
  >
    <svg class="intel-fallback__svg" viewBox="0 0 720 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <g class="intel-fallback__cluster intel-fallback__cluster--research">
        <g class="intel-fallback__links">
          <path d="M215 160 L110 160 L110 82 M215 160 L98 160 L98 236 M215 160 L214 160 L214 58 M215 160 L330 160 L330 104 M215 160 L326 160 L326 240" />
        </g>
        <g class="intel-fallback__satellites">
          <circle cx="110" cy="82" r="5" /><circle cx="98" cy="236" r="5" /><circle cx="214" cy="58" r="5" /><circle cx="330" cy="104" r="5" /><circle cx="326" cy="240" r="5" />
        </g>
        <g class="intel-fallback__topic-labels">
          <text x="83" y="70">NLP</text><text x="72" y="258">CNN</text><text x="180" y="42">Transformer</text><text x="325" y="90">扩散模型</text><text x="320" y="262">强化学习</text>
        </g>
        <g class="intel-fallback__core"><circle cx="215" cy="160" r="13" /></g>
        <text class="intel-fallback__core-label" x="215" y="140" text-anchor="middle">深度学习</text>
      </g>
      <g class="intel-fallback__cluster intel-fallback__cluster--agent">
        <g class="intel-fallback__links">
          <path d="M505 160 L610 160 L610 82 M505 160 L622 160 L622 236 M505 160 L506 160 L506 58 M505 160 L390 160 L390 104 M505 160 L394 160 L394 240 M505 160 L506 160 L506 270" />
        </g>
        <g class="intel-fallback__satellites">
          <circle cx="610" cy="82" r="5" /><circle cx="622" cy="236" r="5" /><circle cx="506" cy="58" r="5" /><circle cx="390" cy="104" r="5" /><circle cx="394" cy="240" r="5" /><circle cx="506" cy="270" r="5" />
        </g>
        <g class="intel-fallback__topic-labels">
          <text x="590" y="70">Harness</text><text x="592" y="258">上下文</text><text x="480" y="42">工具调用</text><text x="370" y="90">RAG</text><text x="374" y="262">工作流</text><text x="490" y="292">评测</text>
        </g>
        <g class="intel-fallback__core"><circle cx="505" cy="160" r="13" /></g>
        <text class="intel-fallback__core-label" x="505" y="140" text-anchor="middle">AI AGENT</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.intel-fallback { position: absolute; inset: 0; display: grid; place-items: center; background: transparent; }
.intel-fallback__svg { width: min(96%, 48rem); height: auto; opacity: .95; }
.intel-fallback__links, .intel-fallback__satellites, .intel-fallback__topic-labels { display: none; }
.intel-fallback__core { fill: #4ea5f5; stroke: #ddecff; stroke-width: 4; }
.intel-fallback__core-label, .intel-fallback__topic-labels { fill: #6d8496; font-family: Segoe UI, sans-serif; font-size: 11px; letter-spacing: .6px; }
.intel-fallback__core-label { fill: #276fae; font-size: 13px; font-weight: 700; }
.intel-fallback--focused .intel-fallback__svg { width: min(96vw, 68rem); }
.intel-fallback--focused .intel-fallback__cluster:not(.intel-fallback__cluster--research),
.intel-fallback--research .intel-fallback__cluster--agent,
.intel-fallback--agent .intel-fallback__cluster--research { display: none; }
.intel-fallback--focused .intel-fallback__links,
.intel-fallback--focused .intel-fallback__satellites,
.intel-fallback--focused .intel-fallback__topic-labels { display: initial; }
.intel-fallback--focused .intel-fallback__links { stroke: #79beff; stroke-opacity: .58; stroke-width: 1.2; }
.intel-fallback--focused .intel-fallback__satellites { fill: #79beff; opacity: .85; }
</style>
