<script setup lang="ts">
import type { PostSummary } from '~/types/content'

const appConfig = useAppConfig()

const { data: posts } = await useAsyncData('home:posts', () =>
  queryCollection('posts').order('date', 'DESC').all()
)

const all = computed(() => (posts.value ?? []) as PostSummary[])

const featured = computed(() => all.value.filter((post) => post.featured))
const latest = computed(() => all.value.slice(0, 4))
// 系列卡片要拿系列里文章的封面去拼文件夹视图，所以这里用 groupPosts
// 而不是只取计数的 collectSeries
const series = computed(() =>
  groupPosts(all.value, (post) => (post.series ? [post.series] : []))
)

usePageSeo({
  title: `${appConfig.site.name} · ${appConfig.site.tagline}`,
  description: appConfig.site.description
})
</script>

<template>
  <div class="space-y-4">
    <!-- 标题区：只讲站点本身，不放个人信息 -->
    <section
      class="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1
        class="text-2xl font-semibold tracking-tight text-balance text-ink sm:text-3xl"
      >
        {{ appConfig.site.tagline }}
      </h1>

      <div class="flex shrink-0 gap-2">
        <NuxtLink
          to="/posts"
          class="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-ink-faint"
        >
          浏览文章
        </NuxtLink>
        <a
          href="#subscribe"
          class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          订阅更新
        </a>
      </div>
    </section>

    <SectionPanel v-if="featured.length" title="精选文章">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PostCard v-for="post in featured" :key="post.path" :post="post" />
      </div>
    </SectionPanel>

    <SectionPanel v-if="latest.length" title="最新文章">
      <template #action>
        <NuxtLink
          to="/posts"
          class="flex items-center gap-0.5 text-xs text-ink-soft transition-colors hover:text-accent-ink"
        >
          查看全部
          <svg
            class="size-3.5"
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
      </template>

      <div class="grid gap-1 sm:grid-cols-2">
        <PostRow v-for="post in latest" :key="post.path" :post="post" />
      </div>
    </SectionPanel>

    <SectionPanel v-if="series.length" title="系列专栏">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SeriesCard
          v-for="item in series"
          :key="item.name"
          :series="item"
        />
      </div>
    </SectionPanel>

    <SectionPanel v-if="!latest.length" title="还没有文章">
      <p class="text-sm text-ink-soft">
        在
        <code class="rounded bg-surface-strong px-1.5 py-0.5 text-xs text-ink">
          content/posts/
        </code>
        下新建 Markdown 文件，这里就会自动出现内容。
      </p>
    </SectionPanel>

    <div id="subscribe" class="scroll-mt-20">
      <SubscribeForm />
    </div>
  </div>
</template>
