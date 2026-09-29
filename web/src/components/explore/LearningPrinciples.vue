<script setup lang="ts">
import { learningPrinciples } from '../../content/explore'
</script>

<template>
  <section class="learning-principles" aria-labelledby="learning-principles-title">
    <header class="learning-principles__header">
      <p class="learning-principles__eyebrow">我们如何学习</p>
      <h2 id="learning-principles-title" class="learning-principles__title">
        一个大学生技术社区——不是课程平台。
      </h2>
      <p class="learning-principles__lede">
        工作坊、同伴讨论、项目实践、论文精读、复现与分享，共同塑造了这里的文化。
      </p>
    </header>

    <ol class="learning-principles__list">
      <li
        v-for="item in learningPrinciples"
        :key="item.id"
        class="learning-principles__item"
      >
        <p class="learning-principles__meta">
          <span>{{ item.index }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ item.label }}</span>
        </p>
        <h3 class="learning-principles__item-title">{{ item.title }}</h3>
        <p class="learning-principles__statement">{{ item.statement }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.learning-principles {
  display: grid;
  gap: var(--space-8);
}

.learning-principles__eyebrow {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.learning-principles__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title-wide);
}

.learning-principles__lede {
  margin: var(--space-4) 0 0;
  max-width: 38rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.learning-principles__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

.learning-principles__item {
  display: grid;
  gap: var(--space-3);
  padding-block: var(--space-6);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.learning-principles__meta {
  margin: 0;
  display: inline-flex;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.learning-principles__item-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.learning-principles__statement {
  margin: 0;
  max-width: 40rem;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

@media (min-width: 901px) {
  .learning-principles__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 var(--space-10);
  }
}
</style>
