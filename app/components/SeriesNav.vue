<script setup lang="ts">
import type { PostSummary } from '~/types/content'

defineProps<{
  /** 系列名，用来链接到系列详情页 */
  name: string
  /** 系列内的文章，调用方已按 seriesOrder 排好 */
  posts: PostSummary[]
  /** 当前文章路径，用来高亮当前这一条 */
  currentPath: string
}>()
</script>

<template>
  <nav aria-label="系列文章列表">
    <p class="mb-2 text-xs font-medium tracking-widest text-ink-faint uppercase">
      系列
    </p>

    <NuxtLink
      :to="`/series/${encodeURIComponent(name)}`"
      class="mb-3 block text-sm font-medium text-ink transition-colors hover:text-accent-ink"
    >
      《{{ name }}》
    </NuxtLink>

    <ol class="border-l border-line">
      <li v-for="(post, index) in posts" :key="post.path">
        <NuxtLink
          :to="post.path"
          class="-ml-px block border-l py-1.5 pl-3 text-xs/5 transition-colors"
          :class="
            post.path === currentPath
              ? 'border-accent font-medium text-accent-ink'
              : 'border-transparent text-ink-soft hover:text-ink'
          "
        >
          <span class="mr-1 tabular-nums text-ink-faint">
            {{ index + 1 }}.
          </span>{{ post.title }}
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>
