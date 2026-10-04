<script setup lang="ts">
const appConfig = useAppConfig()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line">
    <div
      class="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-xs text-ink-faint sm:flex-row sm:justify-between sm:px-6"
    >
      <p>© {{ year }} {{ appConfig.site.name }}</p>
      <p>{{ appConfig.site.tagline }}</p>
    </div>
  </footer>
</template>
