<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { collaborationField } from '../../content/community'
</script>

<template>
  <section class="collab-field" aria-labelledby="collab-field-title">
    <header class="collab-field__header">
      <p class="collab-field__eyebrow">{{ collaborationField.eyebrow }}</p>
      <h2 id="collab-field-title" class="collab-field__title">
        {{ collaborationField.title }}
      </h2>
      <p class="collab-field__lede">{{ collaborationField.lede }}</p>
    </header>

    <div class="collab-field__diagram" aria-hidden="true">
      <svg class="collab-field__svg" viewBox="0 0 640 200" focusable="false">
        <path
          d="M80 40 V90 C80 110 100 120 140 120 H240 C280 120 300 140 300 160 V180"
          fill="none"
          stroke="currentColor"
          stroke-width="1.35"
          stroke-linecap="round"
        />
        <path
          d="M300 160 H420 C460 160 480 120 520 90 V40"
          fill="none"
          stroke="currentColor"
          stroke-width="1.35"
          stroke-linecap="round"
        />
        <path
          d="M240 120 C260 80 360 80 380 120"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          opacity="0.55"
        />
        <circle cx="80" cy="40" r="4.5" fill="none" stroke="currentColor" />
        <circle cx="80" cy="90" r="6" fill="currentColor" opacity="0.15" stroke="currentColor" />
        <circle cx="300" cy="160" r="3.5" fill="none" stroke="currentColor" />
        <rect
          x="228"
          y="108"
          width="24"
          height="24"
          transform="rotate(45 240 120)"
          fill="none"
          stroke="currentColor"
        />
        <circle cx="520" cy="40" r="6" fill="currentColor" opacity="0.15" stroke="currentColor" />
        <text x="96" y="44" class="collab-field__svg-label">提问</text>
        <text x="96" y="94" class="collab-field__svg-label">成员</text>
        <text x="260" y="100" class="collab-field__svg-label">场次</text>
        <text x="312" y="184" class="collab-field__svg-label">作品</text>
        <text x="536" y="44" class="collab-field__svg-label">成员</text>
      </svg>
    </div>

    <p class="collab-field__statement">{{ collaborationField.statement }}</p>

    <p class="collab-field__links">
      <RouterLink class="collab-field__link" to="/events">
        看社区节奏
      </RouterLink>
      <span aria-hidden="true">·</span>
      <RouterLink class="collab-field__link" to="/projects">
        看作品
      </RouterLink>
      <span aria-hidden="true">·</span>
      <RouterLink class="collab-field__link" to="/explore">
        找方向
      </RouterLink>
    </p>
  </section>
</template>

<style scoped>
.collab-field {
  display: grid;
  gap: var(--space-6);
}

.collab-field__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.collab-field__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.collab-field__lede {
  margin: var(--space-4) 0 0;
  max-width: 38rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.collab-field__diagram {
  color: color-mix(in srgb, var(--color-sky) 55%, var(--color-mountain));
  max-width: 40rem;
}

.collab-field__svg {
  width: 100%;
  height: auto;
  display: block;
}

.collab-field__svg-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  fill: var(--color-text-muted);
}

.collab-field__statement {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2.2vw, var(--text-2xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title-wide);
}

.collab-field__links {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.collab-field__link {
  color: var(--color-mountain);
  text-decoration: none;
}

.collab-field__link:hover,
.collab-field__link:focus-visible {
  color: var(--color-sky);
}

.collab-field__link:focus-visible {
  outline: var(--border-focus);
  outline-offset: 3px;
}
</style>
