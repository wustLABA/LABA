<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useIntersectionObserver } from '@vueuse/core'
import { computed, ref } from 'vue'

import AuroraButton from '../ui/AuroraButton.vue'
import MotionSection from '../ui/MotionSection.vue'
import PageContainer from '../layout/PageContainer.vue'
import { getJoinInfo } from '../../content/join'
import { useMotionPreference } from '../../composables/useMotionPreference'

const info = getJoinInfo()
const observeEl = ref<HTMLElement | null>(null)
const revealed = ref(false)
const { prefersReducedMotion } = useMotionPreference()

const qrSrc = computed(() => {
  if (!info.qrCode) return undefined
  if (/^(https?:|data:)/i.test(info.qrCode)) return info.qrCode
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${info.qrCode.replace(/^\//, '')}`
})

useIntersectionObserver(
  observeEl,
  ([entry]) => {
    if (prefersReducedMotion.value) {
      revealed.value = true
      return
    }
    if (entry?.isIntersecting) revealed.value = true
  },
  { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
)
</script>

<template>
  <MotionSection
    as="section"
    class="join"
    :class="{ 'join--revealed': revealed || prefersReducedMotion }"
    offset-y="12"
    aria-labelledby="join-title"
  >
    <div ref="observeEl" class="join__observe">
    <div class="join__haze" aria-hidden="true" />
    <div class="join__rail" aria-hidden="true" />

    <PageContainer class="join__inner">
      <p class="join__eyebrow join__reveal" style="--d: 0ms">下一步</p>

      <h2 id="join-title" class="join__title join__reveal" style="--d: 60ms">
        {{ info.headline }}
      </h2>

      <p class="join__copy join__reveal" style="--d: 120ms">
        {{ info.description }}
      </p>

      <p class="join__cn join__reveal" style="--d: 160ms">
        下一段故事，也许会有你。
      </p>

      <div class="join__actions join__reveal" style="--d: 220ms">
        <RouterLink v-if="info.ctaTo" v-slot="{ navigate }" :to="info.ctaTo" custom>
          <AuroraButton variant="primary" size="lg" @click="navigate">
            {{ info.ctaLabel }}
          </AuroraButton>
        </RouterLink>
        <a
          v-else-if="info.ctaHref"
          class="join__external"
          :href="info.ctaHref"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AuroraButton variant="primary" size="lg" type="button">
            {{ info.ctaLabel }}
          </AuroraButton>
        </a>
      </div>

      <div class="join__contact join__reveal" style="--d: 280ms">
        <p v-if="info.qqGroup" class="join__meta">QQ {{ info.qqGroup }}</p>
        <p v-if="info.contact" class="join__meta">{{ info.contact }}</p>
        <p v-if="info.contactNote" class="join__note">{{ info.contactNote }}</p>
        <img
          v-if="qrSrc"
          class="join__qr"
          :src="qrSrc"
          alt="加入社区二维码"
          width="120"
          height="120"
        />
      </div>

      <p
        v-if="info.brandEcho?.length"
        class="join__echo join__reveal"
        style="--d: 340ms"
        aria-label="品牌回响"
      >
        <template v-for="(line, index) in info.brandEcho" :key="line">
          <span v-if="index > 0" class="join__echo-sep" aria-hidden="true">·</span>
          <span>{{ line }}</span>
        </template>
      </p>
    </PageContainer>
    </div>
  </MotionSection>
</template>

<style scoped>
.join {
  position: relative;
  isolation: isolate;
  padding-block: var(--space-8) var(--space-20);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-morning) 65%, var(--color-snow)) 0%,
    color-mix(in srgb, var(--color-snow) 85%, var(--color-glacier)) 42%,
    color-mix(in srgb, var(--color-frost) 35%, var(--color-snow)) 100%
  );
  overflow: hidden;
}

.join__observe {
  position: relative;
  isolation: isolate;
}

.join__haze {
  position: absolute;
  inset: auto 0 -10% 0;
  height: 55%;
  background:
    radial-gradient(
      ellipse at 50% 80%,
      color-mix(in srgb, var(--color-aurora) 22%, transparent),
      transparent 58%
    ),
    radial-gradient(
      ellipse at 20% 100%,
      color-mix(in srgb, var(--color-glacier) 45%, transparent),
      transparent 50%
    );
  pointer-events: none;
  z-index: 0;
}

.join__rail {
  position: absolute;
  left: calc(var(--page-gutter) + 0.85rem);
  top: 0;
  height: min(5.5rem, 14%);
  width: 2px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-aurora) 50%, transparent),
    transparent
  );
  z-index: 1;
  pointer-events: none;
}

.join__inner {
  position: relative;
  z-index: 2;
  display: grid;
  gap: var(--space-5);
  max-width: 40rem;
  padding-top: var(--space-4);
}

@media (min-width: 901px) {
  .join__rail {
    /* Meet Story elbow: short vertical stub above NEXT */
    left: calc(var(--page-gutter) + 0.85rem);
    height: var(--space-8);
  }

  .join__inner {
    /* Content sits just past the elbow tip */
    padding-left: clamp(0rem, 4vw, 2.5rem);
    padding-top: var(--space-6);
  }
}

.join__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.join__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4.2vw, var(--text-5xl));
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-hero);
}

.join__copy {
  margin: 0;
  max-width: 36rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.join__cn {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

.join__actions {
  margin-top: var(--space-3);
}

.join__contact {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.join__meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.join__note {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

.join__qr {
  margin-top: var(--space-3);
  width: 7.5rem;
  height: 7.5rem;
  object-fit: contain;
  border: 1px solid color-mix(in srgb, var(--color-line) 70%, transparent);
}

.join__echo {
  margin: var(--space-8) 0 0;
  padding-top: var(--space-6);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--color-text-muted) 80%, var(--color-mountain));
}

.join__echo-sep {
  margin-inline: var(--space-2);
  opacity: 0.5;
}

.join__reveal {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 420ms var(--ease-out-soft),
    transform 420ms var(--ease-out-soft);
  transition-delay: var(--d, 0ms);
}

.join--revealed .join__reveal {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 720px) {
  .join {
    padding-block: var(--space-6) var(--space-16);
  }

  .join__rail {
    left: calc(var(--page-gutter, var(--space-4)) + 0.7rem);
  }

  .join__title {
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .join__reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
