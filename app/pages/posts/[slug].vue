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

const seriesName = computed(() => article.series ?? '')

// 顶部那处紧凑导航和文末那份共用同一组数据，只是文案更短、体量更小
const navPrev = computed(() => (inSeries.value ? seriesPrev.value : newer.value))
const navNext = computed(() => (inSeries.value ? seriesNext.value : older.value))
const navLabels = computed(() =>
  inSeries.value
    ? { prev: '系列上一篇', next: '系列下一篇' }
    : { prev: '较新一篇', next: '较旧一篇' }
)

// 布局：目录占左栏；文章属于系列时右侧再挂一栏系列列表。
// 三栏要到 xl 才撑得开（lg 宽度下会挤），所以容器宽度也一并放到 xl 才放宽。
// 正文列限宽 40rem，多出来的空间交给 justify-center 变成两侧留白——比把正文拉满更耐读。
// 注意这些 class 必须写成完整字面量，Tailwind 扫不到拼出来的名字。
const layoutClass = computed(() => {
  const hasToc = toc.value.length > 0
  if (inSeries.value) {
    return hasToc
      ? 'justify-center lg:gap-12 lg:grid-cols-[180px_minmax(0,40rem)] xl:max-w-6xl xl:gap-16 xl:grid-cols-[180px_minmax(0,40rem)_200px]'
      : 'justify-center lg:gap-12 lg:grid-cols-[minmax(0,40rem)] xl:max-w-5xl xl:gap-16 xl:grid-cols-[minmax(0,40rem)_200px]'
  }
  // 没有目录时不定义列，否则文章会被塞进那个 180px 宽的第一列
  return hasToc ? 'justify-center lg:gap-12 lg:grid-cols-[180px_minmax(0,40rem)]' : ''
})

usePageSeo({
  title: `${article.title} · ${appConfig.site.name}`,
  description: article.description,
  type: 'article',
  // 文章封面兼作分享图；没有 cover 就用按路径挑的那张默认封面
  image: resolveCover(article.cover, article.path)
})
</script>

<template>
  <div class="article-shell mx-auto grid max-w-5xl gap-10" :class="layoutClass">
    <aside v-if="toc.length" class="hidden min-w-0 lg:block">
      <div class="sticky top-20 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
        <TocList :links="toc" />
      </div>
    </aside>

    <article class="min-w-0">
      <header>
        <!-- 页头这一行：左边回列表，右边是紧凑版的上下篇（详细那份在文末） -->
        <div class="flex items-center justify-between gap-4">
          <NuxtLink
            to="/posts"
            class="inline-flex shrink-0 items-center gap-1 text-xs text-ink-faint transition-colors hover:text-accent-ink"
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

          <nav
            v-if="navPrev || navNext"
            aria-label="上下篇"
            class="flex min-w-0 items-center gap-1"
          >
            <NuxtLink
              v-if="navPrev"
              :to="navPrev.path"
              :title="`${navLabels.prev}：${navPrev.title}`"
              class="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-faint transition-colors hover:bg-surface-strong hover:text-accent-ink"
            >
              <svg
                class="size-3.5 shrink-0"
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
              <span class="hidden max-w-[10rem] truncate sm:inline">
                {{ navPrev.title }}
              </span>
            </NuxtLink>

            <NuxtLink
              v-if="navNext"
              :to="navNext.path"
              :title="`${navLabels.next}：${navNext.title}`"
              class="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-faint transition-colors hover:bg-surface-strong hover:text-accent-ink"
            >
              <span class="hidden max-w-[10rem] truncate sm:inline">
                {{ navNext.title }}
              </span>
              <svg
                class="size-3.5 shrink-0"
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
          </nav>
        </div>

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

    <!-- 系列文章列表：xl 起显示，与左侧目录对称地贴在正文另一边 -->
    <aside v-if="inSeries" class="hidden min-w-0 xl:block">
      <div class="sticky top-20 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
        <SeriesNav
          :name="seriesName"
          :posts="seriesPosts"
          :current-path="article.path"
        />
      </div>
    </aside>
  </div>
</template>
