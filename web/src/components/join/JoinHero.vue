<script setup lang="ts">
import { joinHero } from '../../content/join-page'
import JoinConvergenceVisual from './JoinConvergenceVisual.vue'

const titleLines = joinHero.title.split('\n')
const ledeBlocks = joinHero.lede.split('\n\n')
</script>

<template>
  <header class="join-hero">
    <div class="join-hero__copy">
      <p class="join-hero__eyebrow">{{ joinHero.eyebrow }}</p>
      <h1 class="join-hero__title">
        <span v-for="(line, i) in titleLines" :key="i" class="join-hero__title-line">
          {{ line }}
        </span>
      </h1>
      <div class="join-hero__lede">
        <p v-for="(block, i) in ledeBlocks" :key="i">{{ block }}</p>
      </div>
    </div>
    <JoinConvergenceVisual class="join-hero__visual" />
  </header>
</template>

<style scoped>
.join-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: var(--space-8) var(--space-10);
  align-items: center;
  min-height: clamp(16rem, 68svh, 30rem);
  padding-block: var(--space-4);
}

.join-hero__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.join-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
}

.join-hero__title-line {
  display: block;
  max-width: var(--measure-hero);
}

.join-hero__lede {
  margin-top: var(--space-5);
  max-width: 36rem;
  display: grid;
  gap: var(--space-3);
}

.join-hero__lede p {
  margin: 0;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .join-hero {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: var(--space-6);
  }

  .join-hero__title-line {
    max-width: none;
  }

  .join-hero__visual {
    max-width: 22rem;
    min-height: 240px;
  }
}
</style>
