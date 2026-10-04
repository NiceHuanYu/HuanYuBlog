<script setup lang="ts">
import type { PostSummary } from '~/types/content'

const props = defineProps<{
  /** 按哪个字段筛选 */
  field: 'category' | 'tag' | 'series'
  /** 要展开的分组名 */
  name: string
}>()

const appConfig = useAppConfig()

const { data: posts } = await useAsyncData('posts:all', () =>
  queryCollection('posts').order('date', 'DESC').all()
)

// 在 JS 里过滤而不是用 queryCollection 的 where：tags 是数组字段，
// 用 where 匹配单个值并不可靠；文章量级很小，这点过滤代价可以忽略。
const matched = computed(() => {
  const list = (posts.value ?? []) as PostSummary[]
  return list.filter((post) => {
    if (props.field === 'category') {
      return post.category === props.name
    }
    if (props.field === 'series') {
      return post.series === props.name
    }
    return post.tags.includes(props.name)
  })
})

// 系列有阅读顺序，其余按时间倒序
const ordered = computed(() =>
  props.field === 'series'
    ? [...matched.value].sort(
        (a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)
      )
    : matched.value
)

const fieldLabel = computed(
  () =>
    ({ category: '分类', tag: '标签', series: '系列' })[props.field] ?? '分组'
)

usePageSeo({
  title: `${props.name} · ${appConfig.site.name}`,
  description: `${fieldLabel.value}「${props.name}」下的全部文章，共 ${ordered.value.length} 篇。`
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <header class="py-2">
      <NuxtLink
        :to="`/posts?view=${field}`"
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
        返回{{ fieldLabel }}视图
      </NuxtLink>

      <h1
        class="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
      >
        {{ name }}
      </h1>
      <p class="mt-2 text-sm text-ink-soft">
        {{ fieldLabel }} · 共 {{ ordered.length }} 篇
        <template v-if="field === 'series'">，按阅读顺序排列</template>
      </p>
    </header>

    <SectionPanel v-if="ordered.length" :title="`${name} 下的文章`">
      <div class="grid gap-1 sm:grid-cols-2">
        <PostRow v-for="post in ordered" :key="post.path" :post="post" />
      </div>
    </SectionPanel>

    <SectionPanel v-else title="没有找到文章">
      <p class="text-sm text-ink-soft">
        这个{{ fieldLabel }}下暂时没有文章。
      </p>
    </SectionPanel>
  </div>
</template>
