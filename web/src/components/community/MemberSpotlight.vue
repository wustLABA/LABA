<script setup lang="ts">
import {
  formatMemberDirection,
  formatMemberSkills,
} from '../../content/members'
import type { Member } from '../../types/member'
import MemberIdentityVisual from './MemberIdentityVisual.vue'

defineProps<{
  member: Member
  reducedMotion?: boolean
}>()
</script>

<template>
  <div class="member-spotlight">
    <div class="member-spotlight__visual">
      <Transition :name="reducedMotion ? '' : 'spotlight-visual'" mode="out-in">
        <MemberIdentityVisual :key="member.id" :member="member" />
      </Transition>
    </div>

    <div class="member-spotlight__copy">
      <Transition :name="reducedMotion ? '' : 'spotlight-copy'" mode="out-in">
        <div :key="member.id" class="member-spotlight__panel">
          <p v-if="member.placeholder" class="member-spotlight__dev">
            开发占位 · 非真实成员
          </p>

          <p class="member-spotlight__index">{{ member.index }}</p>
          <h3 class="member-spotlight__name">{{ member.name }}</h3>

          <p v-if="member.role" class="member-spotlight__role">{{ member.role }}</p>

          <p class="member-spotlight__meta">
            <span>{{ formatMemberDirection(member.direction) }}</span>
            <span v-if="member.year" class="member-spotlight__dot" aria-hidden="true">·</span>
            <span v-if="member.year">{{ member.year }}</span>
          </p>

          <p class="member-spotlight__bio">{{ member.bio }}</p>

          <p v-if="member.skills.length" class="member-spotlight__skills">
            {{ formatMemberSkills(member.skills) }}
          </p>

          <div v-if="member.featuredProject" class="member-spotlight__work">
            <p class="member-spotlight__work-label">精选作品</p>
            <p class="member-spotlight__work-title">{{ member.featuredProject }}</p>
          </div>

          <div
            v-if="member.githubUrl || member.giteeUrl || member.homepageUrl || member.email"
            class="member-spotlight__links"
          >
            <div
              v-if="member.githubUrl || member.giteeUrl || member.homepageUrl"
              class="member-spotlight__link-row"
            >
              <a
                v-if="member.githubUrl"
                class="member-spotlight__link"
                :href="member.githubUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              <a
                v-if="member.giteeUrl"
                class="member-spotlight__link"
                :href="member.giteeUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Gitee ↗
              </a>
              <a
                v-if="member.homepageUrl"
                class="member-spotlight__link"
                :href="member.homepageUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blog ↗
              </a>
            </div>
            <a
              v-if="member.email"
              class="member-spotlight__link member-spotlight__link--email"
              :href="`mailto:${member.email}`"
            >
              {{ member.email }}
            </a>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.member-spotlight {
  display: grid;
  grid-template-columns: minmax(11rem, 0.85fr) minmax(0, 1.25fr);
  gap: var(--space-8) var(--space-10);
  align-items: start;
  min-height: 22rem;
  padding-block: var(--space-2);
}

.member-spotlight__visual {
  min-width: 0;
}

.member-spotlight__copy {
  min-width: 0;
  min-height: 18rem;
}

.member-spotlight__panel {
  display: grid;
  gap: var(--space-3);
  align-content: start;
  max-width: 34rem;
}

.member-spotlight__dev {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.member-spotlight__index {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: 0.14em;
  color: var(--color-sky);
}

.member-spotlight__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(var(--text-2xl), 2.8vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--color-text);
}

.member-spotlight__role {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.member-spotlight__meta {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.member-spotlight__dot {
  opacity: 0.5;
}

.member-spotlight__bio {
  margin: var(--space-2) 0 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  max-width: var(--measure-lede);
}

.member-spotlight__skills {
  margin: var(--space-1) 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-mountain) 70%, var(--color-text-muted));
  line-height: var(--leading-relaxed);
}

.member-spotlight__work {
  margin-top: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid color-mix(in srgb, var(--color-line) 65%, transparent);
  display: grid;
  gap: var(--space-2);
}

.member-spotlight__work-label {
  margin: 0;
  font-size: var(--text-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.member-spotlight__work-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.member-spotlight__links {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.member-spotlight__link-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.member-spotlight__link {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-mountain);
  text-decoration: none;
}

.member-spotlight__link--email {
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.member-spotlight__link:hover {
  color: var(--color-sky);
}

.member-spotlight__link:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-aurora) 70%, transparent);
  outline-offset: 3px;
}

.spotlight-visual-enter-active,
.spotlight-visual-leave-active,
.spotlight-copy-enter-active,
.spotlight-copy-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out-soft),
    transform var(--duration-normal) var(--ease-out-soft);
}

.spotlight-visual-enter-from,
.spotlight-copy-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.spotlight-visual-leave-to,
.spotlight-copy-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 900px) {
  .member-spotlight {
    grid-template-columns: 1fr;
    gap: var(--space-5);
    min-height: 0;
  }

  .member-spotlight__copy {
    min-height: 14rem;
  }

  .member-spotlight__visual {
    justify-self: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spotlight-visual-enter-active,
  .spotlight-visual-leave-active,
  .spotlight-copy-enter-active,
  .spotlight-copy-leave-active {
    transition: none;
  }

  .spotlight-visual-enter-from,
  .spotlight-copy-enter-from,
  .spotlight-visual-leave-to,
  .spotlight-copy-leave-to {
    transform: none;
  }
}
</style>
