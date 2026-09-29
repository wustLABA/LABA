<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { aboutClosing } from '../../content/about'
import AuroraButton from '../ui/AuroraButton.vue'
</script>

<template>
  <section class="about-closing" aria-labelledby="about-closing-title">
    <p class="about-closing__eyebrow">{{ aboutClosing.eyebrow }}</p>
    <h2 id="about-closing-title" class="about-closing__title">
      {{ aboutClosing.title }}
    </h2>
    <p class="about-closing__lede">{{ aboutClosing.lede }}</p>

    <div class="about-closing__links">
      <RouterLink class="about-closing__primary" to="/explore">
        <span class="about-closing__link-eyebrow">主要</span>
        <span class="about-closing__link-title">探索学习地图</span>
      </RouterLink>
      <RouterLink class="about-closing__secondary" to="/events">
        <span class="about-closing__link-eyebrow">节奏</span>
        <span class="about-closing__link-title">看我们如何相聚</span>
      </RouterLink>
    </div>

    <div class="about-closing__join">
      <RouterLink v-slot="{ navigate }" to="/join" custom>
        <AuroraButton variant="secondary" size="sm" @click="navigate">
          加入社区
        </AuroraButton>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.about-closing {
  display: grid;
  gap: var(--space-4);
}

.about-closing__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.about-closing__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.about-closing__lede {
  margin: 0;
  max-width: 34rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.about-closing__links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.about-closing__primary,
.about-closing__secondary {
  display: grid;
  gap: var(--space-2);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
  color: inherit;
  text-decoration: none;
}

.about-closing__primary:focus-visible,
.about-closing__secondary:focus-visible {
  outline: var(--border-focus);
  outline-offset: 4px;
}

.about-closing__link-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.about-closing__link-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
}

.about-closing__primary .about-closing__link-title {
  font-size: var(--text-2xl);
}

.about-closing__primary:hover .about-closing__link-title,
.about-closing__primary:focus-visible .about-closing__link-title,
.about-closing__secondary:hover .about-closing__link-title,
.about-closing__secondary:focus-visible .about-closing__link-title {
  color: var(--color-sky);
}

.about-closing__join {
  margin-top: var(--space-2);
}

@media (max-width: 720px) {
  .about-closing__links {
    grid-template-columns: 1fr;
  }

  .about-closing__title {
    max-width: none;
  }

  .about-closing__primary .about-closing__link-title {
    font-size: var(--text-xl);
  }
}
</style>
