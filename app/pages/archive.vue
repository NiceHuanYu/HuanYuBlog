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
import postsData from '@/data/posts.json' // 导入实际JSON文件

const archiveDataRaw = postsData.archiveData // 假设archive数据在posts.json中
// 格式化日期显示
const formatDay = (dateString) => {
  const date = new Date(dateString)
  return date.getDate()
}

// 处理原始数据为所需结构
const processArchiveData = (rawData) => {
  const yearMap = new Map()
  
  // 按年份分组
  rawData.forEach(post => {
    const year = new Date(post.date).getFullYear()
    if (!yearMap.has(year)) {
      yearMap.set(year, [])
    }
    yearMap.get(year).push(post)
  })
  
  // 转换为数组并按年份倒序
  return Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, posts]) => {
      // 按月份分组
      const monthMap = new Map()
      posts.forEach(post => {
        const month = new Date(post.date).getMonth()
        if (!monthMap.has(month)) {
          monthMap.set(month, [])
        }
        monthMap.get(month).push(post)
      })
      
      return {
        year,
        posts,
        months: Array.from(monthMap.entries())
          .sort((a, b) => b[0] - a[0]) // 月份倒序
          .map(([monthIndex, posts]) => ({
            name: monthIndex + 1, // 月份从0开始计算，需+1
            posts: posts.sort((a, b) => 
              new Date(b.date) - new Date(a.date) // 按日期倒序
            )
          }))
      }
    })
}

// 使用处理后的数据
const archiveData = processArchiveData(archiveDataRaw)
</script>