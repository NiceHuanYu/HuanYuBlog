<script setup lang="ts">
import type { ContactItem } from '~/types/content'

const props = defineProps<{
  contact: ContactItem
}>()

// Tailwind 只识别源码里出现的完整类名，所以这里必须把整套 class 写全，
// 不能用 `bg-${accent}-100` 这种拼接
const ACCENTS: Record<string, string> = {
  green:
    'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  slate:
    'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400'
}

const accentClass = computed(
  () => ACCENTS[props.contact.accent] ?? ACCENTS.slate
)
</script>

<template>
  <a
    :href="contact.href"
    class="group flex items-start gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
  >
    <span
      class="flex size-12 shrink-0 items-center justify-center rounded-full"
      :class="accentClass"
    >
      <AppIcon :name="contact.icon" class="size-6" />
    </span>

    <span class="min-w-0 flex-1">
      <span class="block text-sm font-medium text-ink">
        {{ contact.label }}
      </span>
      <span class="mt-0.5 block truncate text-xs text-ink-soft">
        {{ contact.value }}
      </span>
      <span
        v-if="contact.action"
        class="mt-2 inline-block text-xs text-accent-ink underline-offset-4 group-hover:underline"
      >
        {{ contact.action }}
      </span>
    </span>

    <svg
      class="mt-1 size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
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
  </a>
</template>
