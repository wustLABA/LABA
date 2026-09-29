<script setup lang="ts">
import { twoDirections } from '../../content/about'
</script>

<template>
  <section class="two-directions" aria-labelledby="two-directions-title">
    <header class="two-directions__header">
      <p class="two-directions__eyebrow">{{ twoDirections.eyebrow }}</p>
      <h2 id="two-directions-title" class="two-directions__title">
        <span class="two-directions__title-line">不同的目标。</span>
        <span class="two-directions__title-line">共同的纪律。</span>
      </h2>
    </header>

    <div class="two-directions__split">
      <article class="two-directions__side two-directions__side--build">
        <p class="two-directions__label">{{ twoDirections.build.label }}</p>
        <h3 class="two-directions__question">{{ twoDirections.build.question }}</h3>
        <ul class="two-directions__topics">
          <li v-for="topic in twoDirections.build.topics" :key="topic">{{ topic }}</li>
        </ul>
        <p class="two-directions__outcome">{{ twoDirections.build.outcome }}</p>
        <p class="two-directions__audience">
          常用于： {{ twoDirections.audiences.build.join(' · ') }}
        </p>
      </article>

      <div class="two-directions__spine" aria-hidden="true">
        <span>共同的纪律</span>
      </div>

      <article class="two-directions__side two-directions__side--understand">
        <p class="two-directions__label">{{ twoDirections.understand.label }}</p>
        <h3 class="two-directions__question">{{ twoDirections.understand.question }}</h3>
        <ul class="two-directions__topics">
          <li v-for="topic in twoDirections.understand.topics" :key="topic">
            {{ topic }}
          </li>
        </ul>
        <p class="two-directions__outcome">{{ twoDirections.understand.outcome }}</p>
        <p class="two-directions__audience">
          常用于： {{ twoDirections.audiences.understand.join(' · ') }}
        </p>
      </article>
    </div>

    <p class="two-directions__bridge">{{ twoDirections.bridge }}</p>
    <p class="two-directions__hybrid">{{ twoDirections.hybridNote }}</p>
  </section>
</template>

<style scoped>
.two-directions {
  display: grid;
  gap: var(--space-8);
}

.two-directions__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.two-directions__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
}

.two-directions__title-line {
  display: block;
}

.two-directions__split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: var(--space-6) var(--space-5);
  align-items: stretch;
}

.two-directions__side {
  display: grid;
  gap: var(--space-4);
  align-content: start;
  padding-block: var(--space-2);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
}

.two-directions__label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.two-directions__question {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-lg), 1.8vw, var(--text-xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title-wide);
}

.two-directions__topics {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.two-directions__topics li {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.two-directions__outcome,
.two-directions__audience {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.two-directions__audience {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.two-directions__spine {
  display: grid;
  place-items: center;
  padding-inline: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  border-inline: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.two-directions__bridge {
  margin: 0;
  max-width: 40rem;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug, 1.35);
  color: var(--color-text);
}

.two-directions__hybrid {
  margin: 0;
  max-width: 40rem;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .two-directions__split {
    grid-template-columns: 1fr;
  }

  .two-directions__spine {
    writing-mode: horizontal-tb;
    transform: none;
    padding-block: var(--space-3);
    border-inline: 0;
    border-block: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
  }
}
</style>
