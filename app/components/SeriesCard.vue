<script setup lang="ts">
import type { PostGroup } from '~/types/content'

const props = defineProps<{
  series: PostGroup
}>()

const appConfig = useAppConfig()

/** 在 app.config.ts 里给这个系列配了固定封面就用它 */
const explicitCover = computed(
  () => (appConfig.seriesCovers as Record<string, string>)?.[props.series.name]
)

/** 文件夹视图最多拼 4 张，按系列阅读顺序取前几篇 */
const covers = computed(() =>
  [...props.series.posts]
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
    .slice(0, 4)
)

/**
 * 1 张占满，2 张左右均分，3 张是「左大右两小」，4 张及以上排 2×2。
 * 不铺满格子会留白，所以每种数量都单独给一套 grid 类。
 */
const layout = computed(() => {
  const count = covers.value.length
  if (count === 1) {
    return { grid: 'grid-cols-1 grid-rows-1', firstCell: '' }
  }
  if (count === 2) {
    return { grid: 'grid-cols-2 grid-rows-1', firstCell: '' }
  }
  if (count === 3) {
    return { grid: 'grid-cols-2 grid-rows-2', firstCell: 'row-span-2' }
  }
  return { grid: 'grid-cols-2 grid-rows-2', firstCell: '' }
})
</script>

<template>
  <NuxtLink
    :to="`/posts?view=series#${series.name}`"
    class="group relative block overflow-hidden rounded-xl border border-line shadow-sm"
  >
    <!-- 系列配了固定封面 -->
    <div v-if="explicitCover" class="aspect-[16/9]">
      <img
        :src="explicitCover"
        :alt="`${series.name} 系列封面`"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      >
    </div>

    <!-- 否则用系列内文章的封面拼成文件夹视图。
         缝隙要够宽、颜色要有对比，否则几张同系列的默认封面会糊成一张。
         用户给文章配了真实封面之后，这里的区分会更明显 -->
    <div
      v-else
      class="grid aspect-[16/9] gap-1 bg-canvas p-1"
      :class="layout.grid"
    >
      <div
        v-for="(post, index) in covers"
        :key="post.path"
        class="overflow-hidden rounded-sm bg-surface-strong"
        :class="index === 0 ? layout.firstCell : ''"
      >
        <PostCover
          :cover="post.cover"
          :seed="post.path"
          :alt="`${post.title} 的封面`"
          class="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
    </div>

    <!-- 压一层深蓝渐变：上方留得比较轻，好让拼贴本身看得见；
         下方压深，保证白字在任何封面上都能读清 -->
    <div
      class="absolute inset-0 bg-linear-to-t from-scrim/90 via-scrim/50 to-scrim/15"
      aria-hidden="true"
    />

    <div class="absolute inset-x-0 bottom-0 p-4">
      <div class="flex items-center gap-2 text-white">
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded bg-white/25 text-xs font-semibold tabular-nums backdrop-blur-sm"
        >
          {{ series.posts.length }}
        </span>
        <span class="text-sm font-medium">{{ series.name }}</span>
        <svg
          class="ml-auto size-4 transition-transform group-hover:translate-x-0.5"
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
      </div>
    </div>
  </NuxtLink>
</template>
