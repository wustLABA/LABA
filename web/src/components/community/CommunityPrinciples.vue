<script setup lang="ts">
import { communityPrinciples } from '../../content/community'
</script>

<template>
  <section class="community-principles" aria-labelledby="community-principles-title">
    <header class="community-principles__header">
      <p class="community-principles__eyebrow">社区原则</p>
      <h2 id="community-principles-title" class="community-principles__title">
        我们如何让实践保持诚实。
      </h2>
    </header>

    <ol class="community-principles__list">
      <li
        v-for="item in communityPrinciples"
        :key="item.id"
        class="community-principles__item"
      >
        <p class="community-principles__meta">
          <span>{{ item.index }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ item.label }}</span>
        </p>
        <p class="community-principles__statement">{{ item.statement }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.community-principles {
  display: grid;
  gap: var(--space-8);
}

.community-principles__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.community-principles__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.community-principles__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-10);
}

.community-principles__item {
  display: grid;
  gap: var(--space-3);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.community-principles__meta {
  margin: 0;
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.community-principles__statement {
  margin: 0;
  max-width: 28rem;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug, 1.35);
  color: var(--color-text);
}

@media (max-width: 720px) {
  .community-principles__list {
    grid-template-columns: 1fr;
  }

  .community-principles__title {
    max-width: none;
  }
}
</style>
