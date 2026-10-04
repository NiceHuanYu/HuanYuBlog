<script setup lang="ts">
import type { PostSummary } from '~/types/content'

defineProps<{
  post: PostSummary
}>()
</script>

<template>
  <NuxtLink
    :to="post.path"
    class="group flex gap-4 rounded-lg p-3 transition-colors hover:bg-surface-strong"
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
