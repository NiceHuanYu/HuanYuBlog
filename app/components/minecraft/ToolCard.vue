<!-- ToolCard.vue -->
<template>
  <NuxtLink 
    :to="link" 
    class="flex flex-col bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full"
  >
    <div class="text-5xl text-center py-6 bg-blue-50 text-gray-800">
      {{ icon }}
    </div>
    
    <div class="flex flex-col p-6 flex-grow">
      <span class="inline-block self-start bg-green-100 text-gray-800 text-xs px-3 py-1 rounded-full mb-3">
        {{ category }}
      </span>
      <h3 class="text-xl font-bold text-gray-800 mb-3">{{ title }}</h3>
      <p class="text-gray-600 leading-relaxed mt-auto">{{ description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
/* 保留卡片悬停效果 */
.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>