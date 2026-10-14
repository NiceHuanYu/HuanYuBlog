<script setup lang="ts">
import type { PostSummary } from '~/types/content'

defineProps<{
  post: PostSummary
}>()

// 根元素上的 min-w-0 不能省：这张卡片是网格项，网格项的 min-width 默认是 auto，
// 而标题的 truncate 是 nowrap，会让卡片的最小宽度等于整条标题的宽度，
// 于是窄屏上卡片比屏幕还宽、整页横向滚动。允许收缩之后标题才会正常出现省略号。
</script>

<template>
  <NuxtLink
    :to="post.path"
    class="group flex min-w-0 gap-4 rounded-lg p-3 transition-colors hover:bg-surface-strong"
  >
    <div class="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-surface-strong">
      <PostCover :cover="post.cover" :seed="post.path" :alt="post.title" />
    </div>

    <div class="min-w-0 flex-1">
      <h3
        class="truncate text-sm font-medium text-ink transition-colors group-hover:text-accent-ink"
      >
        {{ post.title }}
      </h3>

      <p class="mt-1 line-clamp-1 text-xs text-ink-soft">
        {{ post.description }}
      </p>

      <div
        class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint"
      >
        <time class="tabular-nums">{{ post.date }}</time>
        <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
