<script setup lang="ts">
import { aboutHero } from '../../content/about'
import AboutDualField from './AboutDualField.vue'

const titleLines = aboutHero.title.split('\n')
</script>

<template>
  <header class="about-hero">
    <div class="about-hero__copy">
      <p class="about-hero__eyebrow">{{ aboutHero.eyebrow }}</p>
      <h1 class="about-hero__title">
        <span v-for="(line, i) in titleLines" :key="i" class="about-hero__title-line">
          {{ line }}
        </span>
      </h1>
      <p class="about-hero__lede">{{ aboutHero.lede }}</p>
    </div>
    <AboutDualField class="about-hero__visual" />
  </header>
</template>

<style scoped>
.about-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: var(--space-8) var(--space-10);
  align-items: center;
  min-height: clamp(18rem, 72svh, 34rem);
  padding-block: var(--space-4);
}

.about-hero__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.about-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
}

.about-hero__title-line {
  display: block;
  max-width: var(--measure-hero);
}

.about-hero__lede {
  margin: var(--space-5) 0 0;
  max-width: 36rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .about-hero {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: var(--space-6);
  }

  .about-hero__title-line {
    max-width: none;
  }

  .about-hero__visual {
    max-width: 22rem;
    min-height: 260px;
  }
}
</style>
