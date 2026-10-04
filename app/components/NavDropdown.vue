<script setup lang="ts">
const props = defineProps<{
  label: string
  items: { label: string; to: string }[]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const route = useRoute()

// 当前路由命中任一子项时，父级也保持高亮
const isActive = computed(() =>
  props.items.some((item) => route.path === item.to)
)

function close() {
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) {
    close()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

// 跳转后收起菜单
watch(() => route.path, close)
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="relative flex items-center gap-1 whitespace-nowrap px-1.5 py-1.5 text-sm transition-colors sm:px-2.5"
      :class="isActive || open ? 'text-ink' : 'text-ink-soft hover:text-ink'"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      {{ label }}
      <svg
        class="size-3 transition-transform"
        :class="open && 'rotate-180'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>

      <span
        v-if="isActive"
        class="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
        aria-hidden="true"
      />
    </button>

    <ul
      v-if="open"
      class="absolute left-0 top-full z-30 mt-1 min-w-32 rounded-lg border border-line bg-surface p-1 shadow-lg"
    >
      <li v-for="item in items" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface-strong"
          :class="
            route.path === item.to
              ? 'text-accent-ink'
              : 'text-ink-soft hover:text-ink'
          "
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
