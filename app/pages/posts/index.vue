<script setup lang="ts">
import type { PostGroup, PostSummary } from '~/types/content'

const appConfig = useAppConfig()
const route = useRoute()

const { data: posts } = await useAsyncData('posts:all', () =>
  queryCollection('posts').order('date', 'DESC').all()
)

const all = computed(() => (posts.value ?? []) as PostSummary[])

const VIEWS = [
  { key: 'all', label: '全部文章' },
  { key: 'featured', label: '精选文章' },
  { key: 'category', label: '按分类' },
  { key: 'tag', label: '按标签' },
  { key: 'series', label: '按系列' }
] as const

type ViewKey = (typeof VIEWS)[number]['key']

/** 分组卡片里最多先显示几篇，多出来的走「查看全部」 */
const PREVIEW_LIMIT = 5

// 视图放在 query 里，这样切换可后退、链接可分享。
// 用 /posts/<view> 是不行的——会被 /posts/[slug] 当成文章路径吃掉。
const activeView = computed<ViewKey>(() => {
  const value = route.query.view
  return VIEWS.some((view) => view.key === value) ? (value as ViewKey) : 'all'
})

const groups = computed<PostGroup[]>(() => {
  if (activeView.value === 'featured') {
    // 精选是人工挑的，总量可控，所以这里不设篇数上限
    return groupByMonth(all.value.filter((post) => post.featured))
  }

  if (activeView.value === 'category') {
    // 分类有兜底，每篇必有一个，所以这里不会漏文章
    return groupPosts(all.value, (post) => [post.category])
  }

  if (activeView.value === 'tag') {
    // 一篇文章的多个标签会让它出现在多个组里，这是标签视图本来的语义
    return groupPosts(all.value, (post) => post.tags)
  }

  if (activeView.value === 'series') {
    return groupPosts(all.value, (post) =>
      post.series ? [post.series] : []
    ).map((group) => ({
      ...group,
      // 系列内按阅读顺序排，不是按时间
      posts: [...group.posts].sort(
        (a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)
      )
    }))
  }

  return []
})

// 分组视图专用：卡片 -> 详情页
const DETAIL_SEGMENT = {
  category: 'categories',
  tag: 'tags',
  series: 'series'
} as const

function detailLink(name: string) {
  const key = activeView.value
  if (key === 'all' || key === 'featured') {
    return '/posts'
  }
  return `/${DETAIL_SEGMENT[key]}/${encodeURIComponent(name)}`
}

// 分组索引：把分类 / 标签 / 系列详情页的链接直接渲染在页面上。
// 这些链接原本只出现在 ?view= 视图的卡片里，而静态构建（generate）会跳过带查询串的链接，
// 于是 /categories、/tags、/series 下的页面从来没被预渲染过，线上直接 404。
// 渲染在这里既能修好预渲染，也顺便给站内补了一组内链。
const indexGroups = computed(() => [
  {
    key: 'category',
    label: '分类',
    segment: DETAIL_SEGMENT.category,
    names: groupPosts(all.value, (post) => [post.category]).map(
      (group) => group.name
    )
  },
  {
    key: 'tag',
    label: '标签',
    segment: DETAIL_SEGMENT.tag,
    names: groupPosts(all.value, (post) => post.tags).map(
      (group) => group.name
    )
  },
  {
    key: 'series',
    label: '系列',
    segment: DETAIL_SEGMENT.series,
    names: groupPosts(all.value, (post) =>
      post.series ? [post.series] : []
    ).map((group) => group.name)
  }
])

const groupLink = (segment: string, name: string) =>
  `/${segment}/${encodeURIComponent(name)}`

const viewLink = (key: ViewKey) =>
  key === 'all' ? '/posts' : { path: '/posts', query: { view: key } }

const emptyHint = computed(() => {
  if (activeView.value === 'featured') {
    return '还没有文章被标为精选。在文章的 frontmatter 里写 featured: true 即可。'
  }
  if (activeView.value === 'tag') {
    return '还没有任何文章写过 tags。'
  }
  if (activeView.value === 'series') {
    return '还没有任何文章写过 series。'
  }
  return '暂无内容。'
})

usePageSeo({
  title: `文章 · ${appConfig.site.name}`,
  description:
    '按时间、分类、标签和系列浏览全部文章，也可以只看精选。'
})
</script>

<template>
  <div class="space-y-4">
    <section class="py-2">
      <h1 class="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        文章
      </h1>
      <p class="mt-2 text-sm text-ink-soft">
        <template v-if="all.length">
          共 {{ all.length }} 篇，按发布时间从新到旧排列。
        </template>
        <template v-else>还没有发布任何文章。</template>
      </p>
    </section>

    <nav v-if="all.length" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="view in VIEWS"
        :key="view.key"
        :to="viewLink(view.key)"
        class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        :class="
          activeView === view.key
            ? 'bg-accent text-white'
            : 'bg-surface-strong text-ink-soft hover:text-ink'
        "
      >
        {{ view.label }}
      </NuxtLink>
    </nav>

    <SectionPanel v-if="activeView === 'all' && all.length" title="全部文章">
      <div class="grid gap-1 sm:grid-cols-2">
        <PostRow v-for="post in all" :key="post.path" :post="post" />
      </div>
    </SectionPanel>

    <template v-else-if="activeView !== 'all'">
      <SectionPanel
        v-for="group in groups"
        :id="group.name"
        :key="group.name"
        :title="group.name"
        class="scroll-mt-20"
      >
        <template #action>
          <NuxtLink
            v-if="group.posts.length > PREVIEW_LIMIT"
            :to="detailLink(group.name)"
            class="shrink-0 text-xs text-ink-soft transition-colors hover:text-accent-ink"
          >
            查看全部 {{ group.posts.length }} 篇
          </NuxtLink>
          <span v-else class="shrink-0 text-xs text-ink-faint tabular-nums">
            {{ group.posts.length }} 篇
          </span>
        </template>

        <div class="grid gap-1 sm:grid-cols-2">
          <PostRow
            v-for="post in group.posts.slice(0, PREVIEW_LIMIT)"
            :key="post.path"
            :post="post"
          />
        </div>
      </SectionPanel>

      <SectionPanel
        v-if="!groups.length"
        :title="
          activeView === 'featured' ? '还没有精选文章' : '暂时没有可分组的文章'
        "
      >
        <p class="text-sm text-ink-soft">{{ emptyHint }}</p>
      </SectionPanel>
    </template>

    <SectionPanel v-if="!all.length" title="还没有文章">
      <p class="text-sm text-ink-soft">
        在
        <code class="rounded bg-surface-strong px-1.5 py-0.5 text-xs text-ink">
          content/posts/
        </code>
        下新建 Markdown 文件，这里就会自动出现内容。
      </p>
    </SectionPanel>

    <SectionPanel v-if="all.length" title="分组索引">
      <div class="space-y-3">
        <div
          v-for="group in indexGroups.filter((item) => item.names.length)"
          :key="group.key"
          class="flex flex-wrap items-center gap-2"
        >
          <span class="min-w-10 shrink-0 text-xs text-ink-faint">
            {{ group.label }}
          </span>
          <NuxtLink
            v-for="name in group.names"
            :key="name"
            :to="groupLink(group.segment, name)"
            class="rounded-md bg-surface-strong px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-accent-ink"
          >
            {{ name }}
          </NuxtLink>
        </div>
      </div>
    </SectionPanel>
  </div>
</template>
