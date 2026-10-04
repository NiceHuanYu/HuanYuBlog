<script setup lang="ts">
import type { TocLink } from '~/types/content'

const props = defineProps<{
  links: TocLink[]
}>()

const activeId = ref('')
const visible = new Set<string>()
let observer: IntersectionObserver | undefined

// 展平成一维，方便按文档顺序判断"当前最靠上的可见标题"
const flatLinks = computed(() => {
  const out: TocLink[] = []
  const walk = (items: TocLink[]) => {
    for (const item of items) {
      out.push(item)
      if (item.children?.length) {
        walk(item.children)
      }
    }
  }
  walk(props.links)
  return out
})

onMounted(() => {
  const headings = flatLinks.value
    .map((link) => document.getElementById(link.id))
    .filter((element): element is HTMLElement => element !== null)

  if (!headings.length) {
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.add(entry.target.id)
        } else {
          visible.delete(entry.target.id)
        }
      }
      activeId.value =
        flatLinks.value.find((link) => visible.has(link.id))?.id ?? ''
    },
    // 上边让开 sticky header，下边收到视口上部 1/3，
    // 这样高亮的是"刚滚过顶部"的那一节
    { rootMargin: '-80px 0px -66% 0px' }
  )

  for (const heading of headings) {
    observer.observe(heading)
  }
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav aria-label="文章目录">
    <p class="mb-3 text-xs font-medium tracking-widest text-ink-faint uppercase">
      目录
    </p>

    <ul class="border-l border-line">
      <li v-for="link in links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="-ml-px block border-l py-1.5 pl-3 text-xs/5 transition-colors"
          :class="
            activeId === link.id
              ? 'border-accent font-medium text-accent-ink'
              : 'border-transparent text-ink-soft hover:text-ink'
          "
        >
          {{ link.text }}
        </a>

        <ul v-if="link.children?.length">
          <li v-for="child in link.children" :key="child.id">
            <a
              :href="`#${child.id}`"
              class="-ml-px block border-l py-1.5 pl-6 text-xs/5 transition-colors"
              :class="
                activeId === child.id
                  ? 'border-accent text-accent-ink'
                  : 'border-transparent text-ink-faint hover:text-ink'
              "
            >
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
