<script setup lang="ts">
import { evidenceLedger } from '../../content/explore-research'
</script>

<template>
  <section class="evidence-ledger" aria-labelledby="evidence-ledger-title">
    <header class="evidence-ledger__header">
      <p class="evidence-ledger__eyebrow">{{ evidenceLedger.eyebrow }}</p>
      <h2 id="evidence-ledger-title" class="evidence-ledger__title">
        {{ evidenceLedger.title }}
      </h2>
      <p class="evidence-ledger__lede">{{ evidenceLedger.lede }}</p>
    </header>

    <ol class="evidence-ledger__list">
      <li
        v-for="item in evidenceLedger.items"
        :key="item.id"
        class="evidence-ledger__item"
      >
        <p class="evidence-ledger__index">{{ item.index }}</p>
        <div>
          <h3 class="evidence-ledger__label">{{ item.label }}</h3>
          <p class="evidence-ledger__statement">{{ item.statement }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.evidence-ledger {
  display: grid;
  gap: var(--space-8);
}

.evidence-ledger__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.evidence-ledger__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.evidence-ledger__lede {
  margin: var(--space-4) 0 0;
  max-width: 38rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.evidence-ledger__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-10);
}

.evidence-ledger__item {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  gap: var(--space-3);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.evidence-ledger__index {
  margin: 0.2rem 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  color: var(--color-sky);
}

.evidence-ledger__label {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.evidence-ledger__statement {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

@media (max-width: 720px) {
  .evidence-ledger__list {
    grid-template-columns: 1fr;
  }

  .evidence-ledger__title {
    max-width: none;
  }
}
</style>
