<template>
  <section class="mb-16">
    <h2 class="text-2xl text-gray-800 mb-8 pb-1 relative">
      最新文章
      <span class="absolute bottom-0 left-0 w-14 h-1 bg-green-500"></span>
    </h2>
    
    <div class="space-y-6 mb-8">
      <article 
        v-for="post in posts" 
        :key="post.id" 
        class="py-6 border-b border-gray-200 last:border-0"
      >
        <div class="max-w-4xl mx-auto">
          <span class="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs mb-3">
            {{ post.category }}
          </span>
          <h3 class="text-xl text-gray-800 font-semibold mb-3">{{ post.title }}</h3>
          <p class="text-gray-600 mb-4 leading-relaxed">{{ post.excerpt }}</p>
          
          <div class="flex justify-between items-center text-gray-500 text-sm">
            <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            <NuxtLink 
              :to="`/posts/${post.id}`" 
              class="text-green-500 font-semibold hover:underline"
            >
              阅读更多
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>
    
    <NuxtLink 
      to="/archive" 
      class="block text-center text-green-500 font-semibold hover:underline mt-8"
    >
      查看所有文章 →
    </NuxtLink>
  </section>
</template>

<script setup>
const props = defineProps({
  posts: {
    type: Array,
    required: true
  }
})

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}
</script>