<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-sm"
  >
    <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
      <NuxtLink
        to="/"
        class="shrink-0 whitespace-nowrap text-sm font-semibold tracking-tight text-ink transition-opacity hover:opacity-80"
      >
        {{ appConfig.site.name }}
      </NuxtLink>

      <nav class="flex items-center gap-1">
        <template v-for="item in appConfig.nav" :key="item.label">
          <NavDropdown
            v-if="item.children?.length"
            :label="item.label"
            :items="item.children"
          />

          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            class="relative whitespace-nowrap px-1.5 py-1.5 text-sm transition-colors sm:px-2.5"
            :class="
              route.path === item.to
                ? 'text-ink'
                : 'text-ink-soft hover:text-ink'
            "
          >
            {{ item.label }}
            <span
              v-if="route.path === item.to"
              class="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent sm:inset-x-2"
              aria-hidden="true"
            />
          </NuxtLink>
        </template>
      </nav>

      <div class="ml-auto flex items-center">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
