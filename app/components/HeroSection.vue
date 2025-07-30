<template>
  <section class="bg-gradient-to-br from-green-700 to-green-900 text-white py-16 px-4 mb-8">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ title }}</h1>
      <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">{{ subtitle }}</p>
      
      <NuxtLink 
        v-if="ctaText" 
        :to="ctaLink" 
        class="inline-block bg-yellow-400 hover:bg-yellow-500 transition-colors text-gray-900 font-bold py-3 px-6 rounded-md"
        :target="ctaTarget"
      >
        {{ ctaText }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  ctaText: {
    type: String,
    default: ''
  },
  ctaLink: {
    type: [String, Object],
    default: '/'
  },
  ctaTarget: {
    type: String,
    default: '_self',
    validator: (value) => ['_self', '_blank'].includes(value)
  }
})
</script>