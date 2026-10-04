<script setup lang="ts">
import type { PageProfile } from '~/types/content'

const appConfig = useAppConfig()

const { data: page } = await useAsyncData('page:about', () =>
  queryCollection('pages').path('/about').first()
)

const profile = computed(() => (page.value ?? null) as PageProfile | null)

usePageSeo({
  title: `关于 · ${appConfig.site.name}`,
  description: appConfig.site.description,
  // 不希望这一页出现在搜索结果里
  noindex: true
})

// 同时把它从 sitemap 里去掉——sitemap 是「请收录我」，
// 和 noindex 是互相矛盾的信号
definePageMeta({ sitemap: false })
</script>

<template>
  <div v-if="profile" class="mx-auto max-w-3xl space-y-4">
    <!-- 身份卡 -->
    <section
      class="relative overflow-hidden rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8"
    >
      <div
        class="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full bg-accent-soft blur-3xl"
        aria-hidden="true"
      />

      <div class="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <img
          v-if="profile.avatar"
          :src="profile.avatar"
          :alt="profile.name ? `${profile.name} 的头像` : '头像'"
          width="80"
          height="80"
          class="size-20 shrink-0 rounded-2xl border border-line object-cover"
        >
        <div
          v-else-if="profile.name"
          class="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-strong text-2xl font-medium text-ink-soft"
        >
          {{ profile.name.slice(0, 1) }}
        </div>

        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tight text-ink">
            {{ profile.name ?? profile.title }}
          </h1>
          <p v-if="profile.tagline" class="mt-1.5 text-sm text-ink-soft">
            {{ profile.tagline }}
          </p>
          <p
            v-if="profile.role"
            class="mt-1.5 flex items-center gap-1.5 text-xs text-ink-faint"
          >
            <AppIcon name="code" class="size-3.5" />
            {{ profile.role }}
          </p>
        </div>
      </div>
    </section>

    <SectionPanel title="个人简介" icon="user">
      <div v-if="page" class="rich-text">
        <ContentRenderer :value="page" />
      </div>
    </SectionPanel>

    <SectionPanel v-if="profile.daily.length" title="我的日常" icon="code">
      <IconGrid :items="profile.daily" />
    </SectionPanel>

    <SectionPanel
      v-if="profile.interests.length"
      title="兴趣爱好"
      icon="heart"
    >
      <IconGrid :items="profile.interests" />
    </SectionPanel>

    <SectionPanel v-if="profile.skills.length" title="技能" icon="cog">
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="skill in profile.skills"
          :key="skill"
          class="rounded-md border border-line px-2.5 py-1 text-xs text-ink-soft"
        >
          {{ skill }}
        </li>
      </ul>
    </SectionPanel>

    <!-- 具体联系方式集中在 /contact，这里只留入口 -->
    <NuxtLink
      to="/contact"
      class="group flex items-center gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
    >
      <span
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink"
      >
        <AppIcon name="mail" class="size-6" />
      </span>

      <span class="min-w-0 flex-1">
        <span class="block text-sm font-medium text-ink">联系我</span>
        <span class="mt-0.5 block text-xs text-ink-soft">
          邮件、QQ、GitHub、Bilibili 都在联系页面
        </span>
      </span>

      <svg
        class="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </NuxtLink>
  </div>

  <p v-else class="text-sm text-ink-soft">
    没有找到
    <code class="rounded bg-surface-strong px-1.5 py-0.5 text-xs">content/about.md</code>。
  </p>
</template>
