<script setup lang="ts">
import { sharedFoundations } from '../../content/explore'
</script>

<template>
  <section class="shared-foundations" aria-labelledby="shared-foundations-title">
    <header class="shared-foundations__header">
      <p class="shared-foundations__eyebrow">共享基础</p>
      <h2 id="shared-foundations-title" class="shared-foundations__title">
        不同的路径。
        <span class="shared-foundations__title-break">共享的根基。</span>
      </h2>
      <p class="shared-foundations__lede">
        两条路径都不要求你先完成一份清单。这些是构建者与研究者都会反复回到的基本功。
      </p>
    </header>

    <ul class="shared-foundations__list">
      <li
        v-for="(item, index) in sharedFoundations"
        :key="item.id"
        class="shared-foundations__item"
      >
        <p class="shared-foundations__index" aria-hidden="true">
          {{ String(index + 1).padStart(2, '0') }}
        </p>
        <div>
          <h3 class="shared-foundations__label">{{ item.label }}</h3>
          <p class="shared-foundations__detail">{{ item.detail }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.shared-foundations {
  display: grid;
  gap: var(--space-8);
  padding-block: var(--space-2);
}

.shared-foundations__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.shared-foundations__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.shared-foundations__title-break {
  display: block;
}

.shared-foundations__lede {
  margin: var(--space-4) 0 0;
  max-width: 36rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.shared-foundations__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-10);
}

.shared-foundations__item {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: var(--space-3);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.shared-foundations__index {
  margin: 0.2rem 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.shared-foundations__label {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.shared-foundations__detail {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

@media (max-width: 720px) {
  .shared-foundations__list {
    grid-template-columns: 1fr;
  }

  .shared-foundations__title {
    max-width: none;
  }
}
</style>
