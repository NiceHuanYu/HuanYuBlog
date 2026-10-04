<script setup lang="ts">
const route = useRoute()
// Vue Router 已经解过码，中文分组名拿到即是原样
const name = computed(() => String(route.params.name ?? ''))
</script>

<template>
  <GroupDetail field="category" :name="name" />
</template>
