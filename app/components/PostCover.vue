<script setup lang="ts">
import { resolveCover } from '~/utils/cover'

const props = defineProps<{
  /** 文章自己上传的封面；不传就用默认封面 */
  cover?: string
  /** 用来稳定挑选默认封面的种子，通常传文章 slug */
  seed: string
  alt: string
}>()

const src = computed(() => resolveCover(props.cover, props.seed))
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    loading="lazy"
    decoding="async"
    class="h-full w-full object-cover"
  />
</template>
