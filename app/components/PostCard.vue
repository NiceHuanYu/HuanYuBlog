<script setup lang="ts">
import type { PostSummary } from '~/types/content'

defineProps<{
  post: PostSummary
}>()
</script>

<template>
  <article
    class="group overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-colors hover:border-accent/40"
  >
    <NuxtLink :to="post.path" class="block">
      <div class="relative aspect-[16/9] overflow-hidden bg-surface-strong">
        <PostCover
          :cover="post.cover"
          :seed="post.path"
          :alt="post.title"
          class="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span
          class="absolute left-3 top-3 rounded-md bg-white/85 px-2 py-0.5 text-xs font-medium text-neutral-800 backdrop-blur-sm"
        >
          {{ post.category }}
        </span>
      </div>

      <div class="p-4">
        <h3
          class="text-sm font-semibold text-ink transition-colors group-hover:text-accent-ink"
        >
          {{ post.title }}
        </h3>

        <p class="mt-2 line-clamp-2 text-xs/5 text-ink-soft">
          {{ post.description }}
        </p>

        <div class="mt-3 flex items-center gap-2 text-xs text-ink-faint">
          <time class="tabular-nums">{{ post.date }}</time>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
