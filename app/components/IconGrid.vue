<script setup lang="ts">
import type { IconItem } from '~/types/content'

defineProps<{
  items: IconItem[]
}>()
</script>

<template>
  <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3">
    <li
      v-for="item in items"
      :key="item.text"
      class="group flex flex-col items-center gap-2 rounded-lg bg-surface-strong px-3 py-4 text-center transition-colors hover:bg-accent-soft"
    >
      <AppIcon
        :name="item.icon"
        class="size-5 text-ink-faint transition-colors group-hover:text-accent-ink"
      />
      <span
        class="text-xs/5 text-ink-soft transition-colors group-hover:text-ink"
      >
        {{ item.text }}
      </span>
    </li>
  </ul>
</template>
