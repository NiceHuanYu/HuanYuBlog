<template>
  <div class="archive-page">
    <BlogHeader />
    
    <main class="main-content">
      <div class="content-container">
        <section class="archive-section">
          <h1 class="page-title">文章归档</h1>
          <p class="subtitle">按时间顺序浏览所有文章</p>
          
          <div class="archive-years">
            <div 
              v-for="year in archiveData" 
              :key="year.year" 
              class="year-section"
            >
              <h2 class="year-title">
                <i class="fas fa-calendar-alt"></i> {{ year.year }} 年
                <span class="post-count">({{ year.posts.length }} 篇)</span>
              </h2>
              
              <div class="month-grid">
                <div 
                  v-for="month in year.months" 
                  :key="month.name" 
                  class="month-card"
                >
                  <h3 class="month-title">{{ month.name }}月</h3>
                  <ul class="post-list">
                    <li 
                      v-for="post in month.posts" 
                      :key="post.id" 
                      class="post-item"
                    >
                      <NuxtLink :to="`/posts/${post.id}`" class="post-link">
                        <span class="post-date">{{ formatDay(post.date) }}</span>
                        <span class="post-title">{{ post.title }}</span>
                        <span class="post-category">{{ post.category }}</span>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import BlogFooter from '@/components/BlogFooter.vue'

// 模拟归档数据 - 实际项目中应从API获取
const archiveData = ref([
  {
    year: 2023,
    posts: [
      {
        id: 1,
        title: 'Nuxt4入门指南',
        date: '2023-05-15',
        category: '技术'
      },
      {
        id: 2,
        title: 'Vue3组合式API实践',
        date: '2023-04-22',
        category: '技术'
      },
      {
        id: 3,
        title: 'CSS现代布局技巧',
        date: '2023-05-10',
        category: '前端'
      },
      {
        id: 4,
        title: 'JavaScript性能优化',
        date: '2023-05-05',
        category: '前端'
      },
      {
        id: 5,
        title: '设计系统构建',
        date: '2023-04-30',
        category: '设计'
      }
    ],
    // 根据posts自动生成months数据
    get months() {
      const monthsMap = {}
      
      this.posts.forEach(post => {
        const date = new Date(post.date)
        const month = date.getMonth()
        
        if (!monthsMap[month]) {
          monthsMap[month] = {
            name: month + 1,
            posts: []
          }
        }
        
        monthsMap[month].posts.push(post)
      })
      
      // 转换为数组并按月份排序
      return Object.values(monthsMap)
        .sort((a, b) => b.name - a.name)
        .map(month => ({
          ...month,
          name: month.name // 可以在这里添加月份名称转换
        }))
    }
  },
  {
    year: 2022,
    posts: [
      {
        id: 6,
        title: '2022年终总结',
        date: '2022-12-31',
        category: '生活'
      },
      {
        id: 7,
        title: 'React Hooks深入解析',
        date: '2022-08-15',
        category: '技术'
      }
    ],
    get months() {
      // 同上处理months
      const monthsMap = {}
      
      this.posts.forEach(post => {
        const date = new Date(post.date)
        const month = date.getMonth()
        
        if (!monthsMap[month]) {
          monthsMap[month] = {
            name: month + 1,
            posts: []
          }
        }
        
        monthsMap[month].posts.push(post)
      })
      
      return Object.values(monthsMap)
        .sort((a, b) => b.name - a.name)
        .map(month => ({
          ...month,
          name: month.name
        }))
    }
  }
])

// 格式化日期显示
const formatDay = (dateString) => {
  const date = new Date(dateString)
  return date.getDate()
}
</script>

<style scoped>
.archive-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
  position: relative;
  padding-bottom: 0.5rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #42b983;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-bottom: 3rem;
}

.archive-years {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.year-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.year-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.year-title i {
  color: #42b983;
}

.post-count {
  font-size: 1rem;
  color: #666;
  margin-left: auto;
}

.month-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .month-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.month-card {
  background: #f8faf8;
  border-radius: 6px;
  padding: 1rem;
}

.month-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  margin-bottom: 0.8rem;
}

.post-item:last-child {
  margin-bottom: 0;
}

.post-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.post-link:hover {
  background-color: #f0f7f0;
}

.post-date {
  width: 30px;
  height: 30px;
  background-color: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
}

.post-title {
  flex: 1;
  font-size: 0.95rem;
}

.post-category {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-left: auto;
}
</style>