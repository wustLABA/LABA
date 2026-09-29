<script setup lang="ts">
import { computed } from 'vue'

import {
  getCommunityPublicMembers,
  publicMembersState,
} from '../../content/community'
import { formatMemberDirection } from '../../content/members'

const members = getCommunityPublicMembers()
const isEmpty = computed(() => members.length === 0)
</script>

<template>
  <section class="public-roster" aria-labelledby="public-roster-title">
    <template v-if="isEmpty">
      <p class="public-roster__eyebrow">{{ publicMembersState.eyebrow }}</p>
      <h2 id="public-roster-title" class="public-roster__title">
        {{ publicMembersState.title }}
      </h2>
      <p class="public-roster__body">{{ publicMembersState.body }}</p>
      <p class="public-roster__opt-in">{{ publicMembersState.optIn }}</p>
    </template>

    <template v-else>
      <header class="public-roster__header">
        <p class="public-roster__eyebrow">{{ publicMembersState.eyebrow }}</p>
        <h2 id="public-roster-title" class="public-roster__title">
          公开成员
        </h2>
        <p class="public-roster__opt-in">{{ publicMembersState.optIn }}</p>
      </header>
      <ol class="public-roster__list">
        <li v-for="member in members" :key="member.id" class="public-roster__row">
          <span class="public-roster__index">{{ member.index }}</span>
          <span class="public-roster__name">{{ member.name }}</span>
          <span class="public-roster__direction">
            {{ formatMemberDirection(member.direction) }}
          </span>
          <span class="public-roster__skills">
            {{ member.skills.slice(0, 3).join(' · ') }}
          </span>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
.public-roster {
  display: grid;
  gap: var(--space-4);
  padding-block: var(--space-6);
  border-block: 1px solid color-mix(in srgb, var(--color-line) 50%, transparent);
}

.public-roster__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-sky);
}

.public-roster__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2.4vw, var(--text-2xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  max-width: var(--measure-title);
}

.public-roster__body {
  margin: 0;
  max-width: 36rem;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.public-roster__opt-in {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.public-roster__list {
  list-style: none;
  margin: var(--space-4) 0 0;
  padding: 0;
}

.public-roster__row {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1.1fr);
  gap: var(--space-3);
  padding-block: var(--space-4);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 45%, transparent);
  font-size: var(--text-sm);
}

.public-roster__index {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  color: var(--color-sky);
}

.public-roster__name {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text);
}

.public-roster__direction,
.public-roster__skills {
  color: var(--color-text-secondary);
}

@media (max-width: 720px) {
  .public-roster__title {
    max-width: none;
  }

  .public-roster__row {
    grid-template-columns: 2.25rem minmax(0, 1fr);
  }

  .public-roster__direction,
  .public-roster__skills {
    grid-column: 2;
  }
}
</style>
