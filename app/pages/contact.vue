<script setup lang="ts">
import type { PageProfile } from '~/types/content'

const appConfig = useAppConfig()

const { data: page } = await useAsyncData('page:contact', () =>
  queryCollection('pages').path('/contact').first()
)

const profile = computed(() => (page.value ?? null) as PageProfile | null)

usePageSeo({
  title: `联系 · ${appConfig.site.name}`,
  description: '通过邮件、QQ、GitHub 或 Bilibili 联系我。',
  // 不希望这一页出现在搜索结果里
  noindex: true
})

// 同时把它从 sitemap 里去掉——sitemap 是「请收录我」，
// 和 noindex 是互相矛盾的信号
definePageMeta({ sitemap: false })
</script>

<template>
  <div v-if="profile" class="mx-auto max-w-3xl">
    <header class="mb-8 text-center">
      <h1 class="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        联系我
      </h1>
      <p v-if="profile.tagline" class="mt-2 text-sm text-ink-soft">
        {{ profile.tagline }}
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <ContactCard
        v-for="contact in profile.contacts"
        :key="contact.label"
        :contact="contact"
      />
    </div>

    <div v-if="page" class="rich-text mx-auto mt-10 max-w-xl">
      <ContentRenderer :value="page" />
    </div>
  </div>

  <p v-else class="text-sm text-ink-soft">
    没有找到
    <code class="rounded bg-surface-strong px-1.5 py-0.5 text-xs">content/contact.md</code>。
  </p>
</template>
