<script setup lang="ts">
import CommunityClosing from '../components/community/CommunityClosing.vue'
import CommunityGiscusBoard from '../components/community/CommunityGiscusBoard.vue'
import CommunityPrinciples from '../components/community/CommunityPrinciples.vue'
import PublicMemberRoster from '../components/community/PublicMemberRoster.vue'
import PageContainer from '../components/layout/PageContainer.vue'

/*
 * 已移除的区块（组件文件保留在 components/community/ 下，未删除）：
 *   · CommunityPageHero   —— 页面主标题「实践背后的人。」及其引导语
 *   · ContributionStream  —— 「我们的贡献方式」
 *   · CollaborationField  —— 「协作 / 工作把人连接起来。」
 *
 * 随之移除的 activeMode 状态：它原本由 Hero 与 ContributionStream 共享，
 * 一个负责显示、一个负责在悬停时上报当前贡献方向。两者都移除后，
 * 这个状态不再有任何消费方，留着会成为每次悬停都触发的无效重渲染。
 */
</script>

<template>
  <main class="community-page">
    <PageContainer class="community-page__inner">
      <CommunityGiscusBoard />
      <PublicMemberRoster />
      <CommunityPrinciples />
      <CommunityClosing />
    </PageContainer>
  </main>
</template>

<style scoped>
.community-page {
  padding-block: var(--space-12) var(--space-20);
  background: linear-gradient(
    180deg,
    var(--color-snow) 0%,
    color-mix(in srgb, var(--color-morning) 70%, var(--color-glacier)) 44%,
    color-mix(in srgb, var(--color-frost) 28%, var(--color-snow)) 100%
  );
}

.community-page__inner {
  display: grid;
  gap: var(--space-12);
}

@media (max-width: 720px) {
  .community-page {
    padding-block: var(--space-10) var(--space-16);
  }

  .community-page__inner {
    gap: var(--space-10);
  }
}
</style>
