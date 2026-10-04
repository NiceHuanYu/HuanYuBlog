<script setup lang="ts">
defineProps<{
  /** 模块标题 */
  title: string
  /** 可选的标题图标，名字对应 AppIcon 里的图标 */
  icon?: string
}>()
</script>

<template>
  <section
    class="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
  >
    <header class="mb-5 flex items-baseline justify-between gap-3">
      <h2
        class="flex items-center gap-2 text-base font-semibold tracking-tight text-ink"
      >
        <AppIcon v-if="icon" :name="icon" class="size-4 text-ink-faint" />
        {{ title }}
      </h2>
      <slot name="action" />
    </header>

    <slot />
  </section>
</template>
