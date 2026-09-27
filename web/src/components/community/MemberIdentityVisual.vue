<script setup lang="ts">
import { computed } from 'vue'

import type { Member } from '../../types/member'

const props = defineProps<{
  member: Member
}>()

/** Resolve public/ assets against Vite `base`. */
const avatarSrc = computed(() => {
  const avatar = props.member.avatar
  if (!avatar) return undefined
  if (/^(https?:|data:)/i.test(avatar)) return avatar
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${avatar.replace(/^\//, '')}`
})
</script>

<template>
  <div
    class="member-identity"
    :class="[
      `member-identity--${member.direction}`,
      { 'member-identity--portrait': Boolean(avatarSrc) },
    ]"
    aria-hidden="true"
  >
    <div class="member-identity__field">
      <img
        v-if="avatarSrc"
        class="member-identity__avatar"
        :src="avatarSrc"
        :alt="''"
        loading="lazy"
        decoding="async"
      />
      <template v-else>
        <svg class="member-identity__geometry" viewBox="0 0 240 280" fill="none">
          <defs>
            <linearGradient :id="`id-grad-${member.id}`" x1="40" y1="40" x2="200" y2="240">
              <stop stop-color="#DDEEFF" stop-opacity="0.9" />
              <stop offset="0.55" stop-color="#79BEFF" stop-opacity="0.35" />
              <stop offset="1" stop-color="#B8DEFF" stop-opacity="0.15" />
            </linearGradient>
          </defs>
          <rect
            x="18"
            y="18"
            width="204"
            height="244"
            rx="2"
            stroke="#D5DEE7"
            stroke-opacity="0.7"
          />
          <path
            v-if="member.direction === 'ai'"
            d="M48 210 H192 M48 70 L120 150 L192 70"
            :stroke="`url(#id-grad-${member.id})`"
            stroke-width="1.2"
          />
          <g v-else-if="member.direction === 'research'" stroke="#4EA5F5" stroke-opacity="0.35">
            <circle cx="120" cy="118" r="46" />
            <circle cx="120" cy="118" r="22" />
            <path d="M74 118 H166 M120 72 V164" stroke-width="1" />
          </g>
          <g v-else stroke="#79BEFF" stroke-opacity="0.4">
            <path d="M56 88 H184 M56 140 H184 M56 192 H184" stroke-width="1" />
            <path d="M88 60 V220 M152 60 V220" stroke-width="1" />
          </g>
          <circle cx="120" cy="118" r="3.5" fill="#4EA5F5" fill-opacity="0.55" />
        </svg>
        <span class="member-identity__mono">{{ member.monogram }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.member-identity {
  position: relative;
  width: 100%;
  max-width: 16rem;
  aspect-ratio: 6 / 7;
  min-height: 12rem;
}

.member-identity__field {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(
      ellipse at 35% 30%,
      color-mix(in srgb, var(--color-glacier) 70%, transparent),
      transparent 58%
    ),
    linear-gradient(
      165deg,
      color-mix(in srgb, var(--color-morning) 80%, var(--color-snow)),
      color-mix(in srgb, var(--color-frost) 40%, var(--color-snow))
    );
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-line) 70%, transparent);
}

.member-identity__avatar {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
  display: block;
}

.member-identity--portrait .member-identity__field {
  background: var(--color-snow);
}

.member-identity__geometry {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
}

.member-identity__mono {
  position: relative;
  z-index: 1;
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 6vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  color: color-mix(in srgb, var(--color-mountain) 72%, var(--color-text));
  line-height: 1;
}

.member-identity--research .member-identity__field {
  background:
    radial-gradient(
      ellipse at 60% 40%,
      color-mix(in srgb, var(--color-stream) 35%, transparent),
      transparent 55%
    ),
    linear-gradient(
      165deg,
      color-mix(in srgb, var(--color-frost) 55%, var(--color-snow)),
      var(--color-morning)
    );
}

.member-identity--hybrid .member-identity__field {
  background:
    radial-gradient(
      ellipse at 45% 55%,
      color-mix(in srgb, var(--color-aurora) 22%, transparent),
      transparent 50%
    ),
    linear-gradient(
      165deg,
      color-mix(in srgb, var(--color-ivory) 40%, var(--color-snow)),
      color-mix(in srgb, var(--color-glacier) 35%, var(--color-snow))
    );
}

@media (max-width: 720px) {
  .member-identity {
    max-width: 11rem;
    min-height: 9.5rem;
  }

  .member-identity__mono {
    font-size: 2.4rem;
  }
}
</style>
