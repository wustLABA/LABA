<script setup lang="ts">
import { communityAsk } from '../../content/community'
import AuroraButton from '../ui/AuroraButton.vue'
</script>

<template>
  <section class="ask-field" aria-labelledby="ask-field-title">
    <header class="ask-field__header">
      <p class="ask-field__eyebrow">{{ communityAsk.eyebrow }}</p>
      <h2 id="ask-field-title" class="ask-field__title">{{ communityAsk.title }}</h2>
      <p class="ask-field__lede">{{ communityAsk.lede }}</p>
    </header>

    <ol class="ask-field__steps">
      <li v-for="step in communityAsk.steps" :key="step.index" class="ask-field__step">
        <span class="ask-field__step-index">{{ step.index }}</span>
        <div class="ask-field__step-body">
          <p class="ask-field__step-label">{{ step.label }}</p>
          <p class="ask-field__step-text">{{ step.text }}</p>
        </div>
      </li>
    </ol>

    <div class="ask-field__actions">
      <a
        class="ask-field__external"
        :href="communityAsk.askUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <AuroraButton variant="primary" type="button">
          {{ communityAsk.askLabel }}
        </AuroraButton>
      </a>
      <a
        class="ask-field__secondary"
        :href="communityAsk.browseUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ communityAsk.browseLabel }}
      </a>
    </div>

    <p class="ask-field__note">{{ communityAsk.note }}</p>
  </section>
</template>

<style scoped>
.ask-field {
  display: grid;
  gap: var(--space-6);
  padding-block: var(--space-6);
  border-block: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.ask-field__header {
  display: grid;
  gap: var(--space-3);
  max-width: 36rem;
}

.ask-field__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.ask-field__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.ask-field__lede {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.ask-field__steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0;
  border-top: 1px solid color-mix(in srgb, var(--color-line) 45%, transparent);
}

.ask-field__step {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-line) 45%, transparent);
}

.ask-field__step-index {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: 0.08em;
  color: var(--color-sky);
  padding-top: 0.15rem;
}

.ask-field__step-body {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.ask-field__step-label {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.ask-field__step-text {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  max-width: var(--measure-lede);
}

.ask-field__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
}

.ask-field__external {
  display: inline-flex;
  text-decoration: none;
}

.ask-field__secondary {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-mountain);
  text-decoration: none;
}

.ask-field__secondary:hover {
  color: var(--color-sky);
}

.ask-field__secondary:focus-visible,
.ask-field__external:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-aurora) 70%, transparent);
  outline-offset: 3px;
}

.ask-field__note {
  margin: 0;
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: var(--measure-lede);
}

@media (max-width: 720px) {
  .ask-field__step {
    padding-block: var(--space-3);
  }
}
</style>
