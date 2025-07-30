<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <BlogHeader />
    
    <main class="flex-grow py-8">
      <div class="container mx-auto px-4 max-w-5xl">
        <section class="text-center mb-10">
          <h1 class="text-3xl font-bold text-gray-800 mb-2 relative pb-2 inline-block">
            文章归档
            <span class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-green-500"></span>
          </h1>
          <p class="text-lg text-gray-600">按时间顺序浏览所有文章</p>
        </section>
        
        <div class="space-y-8">
          <div 
            v-for="year in archiveData" 
            :key="year.year" 
            class="bg-white rounded-xl shadow-md p-6"
          >
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
              <i class="fas fa-calendar-alt text-green-500"></i> {{ year.year }} 年
              <span class="text-gray-500 text-sm font-normal ml-auto">({{ year.posts.length }} 篇)</span>
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div 
                v-for="month in year.months" 
                :key="month.name" 
                class="bg-gray-50 rounded-lg p-4"
              >
                <h3 class="font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-200">{{ month.name }}月</h3>
                <ul class="space-y-2">
                  <li 
                    v-for="post in month.posts" 
                    :key="post.id" 
                    class="group"
                  >
                    <NuxtLink 
                      :to="`/posts/${post.id}`" 
                      class="flex items-center gap-3 p-2 rounded hover:bg-green-50 transition-colors"
                    >
                      <span class="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {{ formatDay(post.date) }}
                      </span>
                      <span class="flex-grow text-gray-700 group-hover:text-green-600 transition-colors truncate">
                        {{ post.title }}
                      </span>
                      <span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {{ post.category }}
                      </span>
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import BlogFooter from '@/components/BlogFooter.vue'

// 模拟归档数据
const archiveData = ref([
  {
    year: 2023,
    posts: [
      { id: 1, title: 'Nuxt4入门指南', date: '2023-05-15', category: '技术' },
      { id: 2, title: 'Vue3组合式API实践', date: '2023-04-22', category: '技术' },
      { id: 3, title: 'CSS现代布局技巧', date: '2023-05-10', category: '前端' },
      { id: 4, title: 'JavaScript性能优化', date: '2023-05-05', category: '前端' },
      { id: 5, title: '设计系统构建', date: '2023-04-30', category: '设计' }
    ],
    get months() {
      const monthsMap = {}
      this.posts.forEach(post => {
        const date = new Date(post.date)
        const month = date.getMonth()
        if (!monthsMap[month]) {
          monthsMap[month] = { name: month + 1, posts: [] }
        }
        monthsMap[month].posts.push(post)
      })
      return Object.values(monthsMap).sort((a, b) => b.name - a.name)
    }
  },
  {
    year: 2022,
    posts: [
      { id: 6, title: '2022年终总结', date: '2022-12-31', category: '生活' },
      { id: 7, title: 'React Hooks深入解析', date: '2022-08-15', category: '技术' }
    ],
    get months() {
      const monthsMap = {}
      this.posts.forEach(post => {
        const date = new Date(post.date)
        const month = date.getMonth()
        if (!monthsMap[month]) {
          monthsMap[month] = { name: month + 1, posts: [] }
        }
        monthsMap[month].posts.push(post)
      })
      return Object.values(monthsMap).sort((a, b) => b.name - a.name)
    }
  }
])

// 格式化日期显示
const formatDay = (dateString) => {
  const date = new Date(dateString)
  return date.getDate()
}
</script>