<script setup lang="ts">
const route = useRoute()
const name = computed(() => String(route.params.name ?? ''))
</script>

<template>
  <GroupDetail field="series" :name="name" />
</template>
