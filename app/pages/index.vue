<template>
  <div class="blog-home">
    <BlogHeader  />
    
    <main class="main-content">
      <HeroSection 
        title="欢迎来到HuanYu & 博客"
        subtitle="分享我的数字生活"
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

// 导入数据
import postsData from '@/data/posts.json'

const featuredPosts = postsData.featuredPosts
const recentPosts = postsData.recentPosts

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