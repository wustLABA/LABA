<script setup lang="ts">
import { computed, ref } from 'vue'

import PageContainer from '../layout/PageContainer.vue'
import MotionSection from '../ui/MotionSection.vue'
import type { IntelligenceMode } from '../../lib/intelligence/types'
import IntelligenceCanvas from './intelligence/IntelligenceCanvas.vue'
import IntelligenceModeSwitch from './intelligence/IntelligenceModeSwitch.vue'

const mode = ref<IntelligenceMode>('build')

const summary = computed(() =>
  '两条相连的学习星路：深度学习面向科研，AI Agent 面向工作实践。',
)

// 说明文案固定：选中星点时，名称直接显示在星点上方（不再出现卡片）
const micro = { label: '双星图', copy: '科研与工作，两条路径在这里相连。' }
</script>

<template>
  <MotionSection as="section" class="intelligence" offset-y="16" aria-labelledby="intelligence-title">
    <PageContainer class="intelligence__inner">
      <header class="intelligence__header">
        <div class="intelligence__heading">
          <p class="intelligence__eyebrow">流动的智能</p>
          <h2 id="intelligence-title" class="intelligence__title">
            两条 AI 路径。<br />
            一片共同的星图。
          </h2>
          <p class="intelligence__lede">
            一边走向深度学习与科研，一边走向 AI Agent 与工作实践；知识点如星辰，围绕各自的核心聚合。
          </p>
        </div>

        <div class="intelligence__controls">
          <IntelligenceModeSwitch v-model="mode" />
          <p class="intelligence__micro" aria-live="polite">
            <span class="intelligence__micro-label">{{ micro.label }}</span>
            {{ micro.copy }}
          </p>
        </div>
      </header>

      <div class="intelligence__field">
        <div class="intelligence__haze" aria-hidden="true" />
        <div class="intelligence__grid" aria-hidden="true" />
        <IntelligenceCanvas class="intelligence__canvas" :mode="mode" />
      </div>

      <p class="intelligence__sr-only">
        {{ summary }}
      </p>
    </PageContainer>
  </MotionSection>
</template>

<style scoped>
.intelligence {
  padding-block: var(--space-12) var(--space-20);
  background: linear-gradient(
    180deg,
    var(--color-snow) 0%,
    color-mix(in srgb, var(--color-frost) 70%, var(--color-glacier)) 42%,
    color-mix(in srgb, var(--color-morning) 55%, var(--color-ivory)) 100%
  );
}

.intelligence__inner {
  display: grid;
  gap: var(--space-8);
}

.intelligence__header {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(16rem, 0.8fr);
  gap: var(--space-6) var(--space-10);
  align-items: end;
}

.intelligence__eyebrow {
  margin-bottom: var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.intelligence__title {
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 3.5vw, var(--text-4xl));
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.intelligence__lede {
  margin-top: var(--space-4);
  max-width: 34rem;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.intelligence__controls {
  display: grid;
  gap: var(--space-4);
  justify-items: stretch;
}

.intelligence__micro {
  margin: 0;
  min-height: 2.75rem;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.intelligence__micro-label {
  display: inline-block;
  margin-right: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-mountain);
}

.intelligence__field {
  position: relative;
  height: clamp(20rem, 48svh, 28rem);
  overflow: hidden;
  border-radius: 0;
  isolation: isolate;
  /*
   * 深空底色 —— 这一层决定画布背后是「夜空」还是「一团灰雾」。
   *
   * 旧实现用两个极大的椭圆径向渐变（58%×68% + 86%×78%）叠加，中心是
   * text/success 混出的墨绿。大椭圆 + 软 mask 的结果是一块没有边界的
   * 弥散灰斑：既不像宇宙，也压不住上面的星点。
   *
   * 现在的做法是「中央深、外圈快速透明」，但把椭圆拉宽到接近整个视口、
   * 并把 success 的混入比例压低 —— 之前 42% 的 success 让中心明显偏墨绿，
   * 与站内冷蓝基调不符。
   */
  background:
    radial-gradient(
      ellipse 62% 62% at 50% 50%,
      color-mix(in srgb, var(--color-text) 68%, var(--color-mountain)) 0%,
      color-mix(in srgb, var(--color-text) 50%, var(--color-mountain)) 40%,
      color-mix(in srgb, var(--color-text) 22%, var(--color-mountain)) 66%,
      transparent 86%
    );
  mask-image: radial-gradient(
    ellipse 76% 76% at 50% 50%,
    #000 0%,
    #000 46%,
    rgb(0 0 0 / 0.7) 66%,
    rgb(0 0 0 / 0.22) 82%,
    transparent 94%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 76% 76% at 50% 50%,
    #000 0%,
    #000 46%,
    rgb(0 0 0 / 0.7) 66%,
    rgb(0 0 0 / 0.22) 82%,
    transparent 94%
  );
}

/*
 * 极光色晕 —— 压在深空底色之上，给星图两个「引力中心」着上冷暖。
 * 位置对齐左右两颗核心（约 24% 与 76%），而不是居中铺满，
 * 这样色晕会包裹核心形成星云感，而不是把整块区域染成一片脏灰。
 */
.intelligence__haze {
  position: absolute;
  inset: -8% -4%;
  background:
    radial-gradient(ellipse 30% 42% at 25% 50%, color-mix(in srgb, var(--color-aurora) 30%, transparent), transparent 68%),
    radial-gradient(ellipse 30% 42% at 75% 50%, color-mix(in srgb, var(--color-stream) 26%, transparent), transparent 68%),
    radial-gradient(ellipse 46% 40% at 50% 88%, color-mix(in srgb, var(--color-glacier) 20%, transparent), transparent 72%);
  pointer-events: none;
  z-index: 0;
  /* 让色晕只在中部显现，避免上下边缘出现横向色带 */
  mask-image: radial-gradient(ellipse 74% 66% at 50% 48%, #000 36%, transparent 92%);
  -webkit-mask-image: radial-gradient(ellipse 74% 66% at 50% 48%, #000 36%, transparent 92%);
}

.intelligence__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--color-line) 28%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-line) 28%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.18;
  mask-image: radial-gradient(ellipse at center, #000 35%, transparent 78%);
  pointer-events: none;
  z-index: 0;
}

.intelligence__canvas {
  position: relative;
  z-index: 1;
  min-height: inherit;
}

.intelligence__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .intelligence__header {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .intelligence__controls {
    justify-items: start;
  }

  .intelligence__field {
    height: clamp(16.5rem, 44svh, 22rem);
  }
}
</style>
