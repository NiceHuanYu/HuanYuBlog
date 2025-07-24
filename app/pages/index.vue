<template>
  <div class="blog-home">
    <BlogHeader  />
    
    <main class="main-content">
      <HeroSection 
        title="欢迎来到HuanYU & 博客"
        subtitle="分享前端开发、设计思考和数字生活"
        ctaText="了解更多"/>
      
      <div class="content-container">
        <FeaturedPosts :posts="featuredPosts" />
        <RecentPosts :posts="recentPosts" />
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
// 导入组件
import BlogHeader from '@/components/BlogHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import FeaturedPosts from '@/components/FeaturedPosts.vue'
import RecentPosts from '@/components/RecentPosts.vue'
import BlogFooter from '@/components/BlogFooter.vue'

// 模拟数据 - 实际项目中可以从API获取
const featuredPosts = [
  {
    id: 1,
    title: 'Nuxt4入门指南',
    excerpt: '学习如何使用Nuxt4构建现代Web应用',
    date: '2023-05-15',
    category: '技术',
    image: '/images/nuxt-guide.jpg'
  },
  {
    id: 2,
    title: 'Vue3组合式API实践',
    excerpt: '探索Vue3组合式API的最佳实践',
    date: '2023-04-22',
    category: '技术',
    image: '/images/vue-api.jpg'
  }
]

const recentPosts = [
  {
    id: 3,
    title: 'CSS现代布局技巧',
    excerpt: '使用Grid和Flexbox创建响应式布局',
    date: '2023-05-10',
    category: '前端'
  },
  {
    id: 4,
    title: 'JavaScript性能优化',
    excerpt: '提升你的JS代码运行效率',
    date: '2023-05-05',
    category: '前端'
  },
  {
    id: 5,
    title: '设计系统构建',
    excerpt: '从零开始构建企业级设计系统',
    date: '2023-04-30',
    category: '设计'
  }
]
</script>

<style scoped>
.blog-home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
</style>