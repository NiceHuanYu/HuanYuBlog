<template>
  <section class="mb-16">
    <h2 class="text-2xl text-gray-800 mb-8 pb-1 relative">
      精选文章
      <span class="absolute bottom-0 left-0 w-14 h-1 bg-green-500"></span>
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article 
        v-for="post in posts" 
        :key="post.id" 
        class="bg-white rounded-lg overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
      >
        <div class="h-48 overflow-hidden">
          <img :src="post.image" :alt="post.title" class="w-full h-full object-cover">
        </div>
        
        <div class="p-6">
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