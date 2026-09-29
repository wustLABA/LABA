<script setup lang="ts">
import { eventsHero } from '../../content/events'
import EventPulseVisual from './EventPulseVisual.vue'

defineProps<{
  activeFormatId?: string | null
}>()

const emit = defineEmits<{
  'pulse-focus': [id: string | null]
}>()
</script>

<template>
  <header class="events-hero">
    <div class="events-hero__copy">
      <p class="events-hero__eyebrow">{{ eventsHero.eyebrow }}</p>
      <h1 class="events-hero__title">{{ eventsHero.title }}</h1>
      <p class="events-hero__lede">{{ eventsHero.lede }}</p>
    </div>
    <EventPulseVisual
      class="events-hero__visual"
      :active-id="activeFormatId"
      @focus="emit('pulse-focus', $event)"
    />
  </header>
</template>

<style scoped>
.events-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: var(--space-8) var(--space-10);
  align-items: center;
  min-height: clamp(16rem, 48vh, 26rem);
  padding-block: var(--space-4);
}

.events-hero__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.events-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-hero);
}

.events-hero__lede {
  margin: var(--space-5) 0 0;
  max-width: 34rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .events-hero {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: var(--space-6);
  }

  .events-hero__title {
    max-width: var(--measure-hero);
  }
}
</style>
