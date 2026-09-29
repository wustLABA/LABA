<script setup lang="ts">
import { communityHero } from '../../content/community'
import type { ContributionModeId } from '../../types/member'
import CommunityFieldVisual from './CommunityFieldVisual.vue'

defineProps<{
  activeMode?: ContributionModeId | null
}>()
</script>

<template>
  <header class="community-hero">
    <div class="community-hero__copy">
      <p class="community-hero__eyebrow">{{ communityHero.eyebrow }}</p>
      <h1 class="community-hero__title">{{ communityHero.title }}</h1>
      <p class="community-hero__lede">{{ communityHero.lede }}</p>
      <p class="community-hero__map-text">
        成员、作品、场次，以及用 GitHub 发起的提问与回答——构成一片关系场，而不是一份通讯录。
      </p>
    </div>
    <CommunityFieldVisual
      class="community-hero__visual"
      :active-mode="activeMode"
    />
  </header>
</template>

<style scoped>
.community-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: var(--space-8) var(--space-10);
  align-items: center;
  min-height: clamp(16rem, 48vh, 26rem);
  padding-block: var(--space-4);
}

.community-hero__eyebrow {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.community-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-hero);
}

.community-hero__lede {
  margin: var(--space-5) 0 0;
  max-width: 34rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.community-hero__map-text {
  margin: var(--space-4) 0 0;
  max-width: 32rem;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .community-hero {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: var(--space-6);
  }

  .community-hero__title {
    max-width: var(--measure-hero);
  }
}
</style>
