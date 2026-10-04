<script setup lang="ts">
import type { TocLink } from '~/types/content'
import { resolveCover } from '~/utils/cover'

const route = useRoute()
const appConfig = useAppConfig()

const { data: post } = await useAsyncData(`post:${route.path}`, () =>
  queryCollection('posts').path(route.path).first()
)

// 取到局部变量，下面的模板和 SEO 才能确定它非空
const article = post.value

if (!article) {
  throw createError({
    statusCode: 404,
    statusMessage: '找不到这篇文章',
    fatal: true
  })
}

const { data: ordered } = await useAsyncData('posts:ordered', () =>
  queryCollection('posts')
    .select('path', 'title', 'description', 'date', 'series', 'seriesOrder')
    .order('date', 'DESC')
    .all()
)

// 上下篇按和列表页一致的顺序（date DESC）自己算相邻项。
// 不用 queryCollectionItemSurroundings：它按自己的默认顺序（实测是按 path）
// 取相邻项，和列表页展示的顺序对不上，而且 SurroundOptions 里没有排序列可配。
const position = computed(() =>
  (ordered.value ?? []).findIndex((item) => item.path === route.path)
)

const newer = computed(() => {
  const list = ordered.value ?? []
  return position.value > 0 ? list[position.value - 1] : undefined
})

const older = computed(() => {
  const list = ordered.value ?? []
  const index = position.value
  return index >= 0 && index < list.length - 1 ? list[index + 1] : undefined
})

// 系列内的文章按 seriesOrder 排，而不是按时间——系列是有阅读顺序的
const seriesPosts = computed(() => {
  const name = article.series
  if (!name) {
    return []
  }
  return (ordered.value ?? [])
    .filter((item) => item.series === name)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
})

const seriesPosition = computed(() =>
  seriesPosts.value.findIndex((item) => item.path === route.path)
)

// 只有一篇的「系列」不构成系列，不显示系列导航
const inSeries = computed(() => seriesPosts.value.length > 1)

const seriesPrev = computed(() =>
  seriesPosition.value > 0
    ? seriesPosts.value[seriesPosition.value - 1]
    : undefined
)

const seriesNext = computed(() => {
  const list = seriesPosts.value
  const index = seriesPosition.value
  return index >= 0 && index < list.length - 1 ? list[index + 1] : undefined
})

// 目录由 Content 在构建时从标题生成，字段是 { id, depth, text, children }
const toc = computed<TocLink[]>(
  () =>
    (article.body as { toc?: { links?: TocLink[] } } | undefined)?.toc?.links ??
    []
)

usePageSeo({
  title: `${article.title} · ${appConfig.site.name}`,
  description: article.description,
  type: 'article',
  // 文章封面兼作分享图；没有 cover 就用按路径挑的那张默认封面
  image: resolveCover(article.cover, article.path)
})
</script>

<template>
  <div class="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[190px_minmax(0,1fr)]">
    <aside v-if="toc.length" class="hidden lg:block">
      <div class="sticky top-20 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
        <TocList :links="toc" />
      </div>
    </aside>

    <article class="min-w-0">
      <header>
        <NuxtLink
          to="/posts"
          class="inline-flex items-center gap-1 text-xs text-ink-faint transition-colors hover:text-accent-ink"
        >
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
            <path d="m15 18-6-6 6-6" />
          </svg>
          全部文章
        </NuxtLink>

        <h1
          class="mt-5 text-2xl font-semibold tracking-tight text-balance text-ink sm:text-3xl"
        >
          {{ article.title }}
        </h1>

        <p class="mt-3 text-sm/6 text-pretty text-ink-soft">
          {{ article.description }}
        </p>

        <div
          class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-faint"
        >
          <time class="tabular-nums">{{ article.date }}</time>
          <NuxtLink
            :to="`/posts?view=category#${article.category}`"
            class="rounded bg-surface-strong px-2 py-0.5 text-ink-soft transition-colors hover:text-ink"
          >
            {{ article.category }}
          </NuxtLink>
          <span v-for="tag in article.tags" :key="tag">#{{ tag }}</span>
        </div>

        <!-- 属于系列时说明这是系列里的第几篇 -->
        <p v-if="inSeries" class="mt-4 text-xs text-ink-soft">
          本文是
          <span class="font-medium text-ink">《{{ article.series }}》</span>
          系列的第 {{ seriesPosition + 1 }} 篇，共 {{ seriesPosts.length }} 篇
        </p>
      </header>

      <div class="rich-text mt-10">
        <ContentRenderer :value="article" />
      </div>

      <!-- 在系列里就按系列顺序导航，否则按发布时间导航 -->
      <nav
        v-if="inSeries && (seriesPrev || seriesNext)"
        class="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
      >
        <NuxtLink
          v-if="seriesPrev"
          :to="seriesPrev.path"
          class="group rounded-lg border border-line p-4 transition-colors hover:border-accent/40"
        >
          <span class="text-xs text-ink-faint">
            《{{ article.series }}》上一篇
          </span>
          <p
            class="mt-1 text-sm font-medium text-ink transition-colors group-hover:text-accent-ink"
          >
            {{ seriesPrev.title }}
          </p>
        </NuxtLink>
        <span v-else />

        <NuxtLink
          v-if="seriesNext"
          :to="seriesNext.path"
          class="group rounded-lg border border-line p-4 transition-colors hover:border-accent/40 sm:text-right"
        >
          <span class="text-xs text-ink-faint">
            《{{ article.series }}》下一篇
          </span>
          <p
            class="mt-1 text-sm font-medium text-ink transition-colors group-hover:text-accent-ink"
          >
            {{ seriesNext.title }}
          </p>
        </NuxtLink>
      </nav>

      <nav
        v-else-if="newer || older"
        class="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
      >
        <NuxtLink
          v-if="newer"
          :to="newer.path"
          class="group rounded-lg border border-line p-4 transition-colors hover:border-accent/40"
        >
          <span class="text-xs text-ink-faint">较新一篇</span>
          <p
            class="mt-1 text-sm font-medium text-ink transition-colors group-hover:text-accent-ink"
          >
            {{ newer.title }}
          </p>
        </NuxtLink>
        <span v-else />

        <NuxtLink
          v-if="older"
          :to="older.path"
          class="group rounded-lg border border-line p-4 transition-colors hover:border-accent/40 sm:text-right"
        >
          <span class="text-xs text-ink-faint">较旧一篇</span>
          <p
            class="mt-1 text-sm font-medium text-ink transition-colors group-hover:text-accent-ink"
          >
            {{ older.title }}
          </p>
        </NuxtLink>
      </nav>
    </article>
  </div>
</template>
