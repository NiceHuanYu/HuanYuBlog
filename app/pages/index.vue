<template>
  <MusicPlayer/>
  <div class="min-h-screen flex flex-col">
    <BlogHeader />
    
    <main class="flex-grow py-10">
      <HeroSection 
        title="欢迎来到HuanYu & 博客"
        subtitle="本博客是面向AI编程~"
        ctaText="了解更多"
        ctaLink="/archive"
      />
      
      <div class="container mx-auto px-4 md:px-6 max-w-7xl">
        <FeaturedPosts :posts="featuredPosts" />
        <RecentPosts :posts="recentPosts" />
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import FeaturedPosts from '@/components/FeaturedPosts.vue'
import RecentPosts from '@/components/RecentPosts.vue'
import BlogFooter from '@/components/BlogFooter.vue'

import postsData from '@/data/posts.json'

const featuredPosts = postsData.featuredPosts
const recentPosts = postsData.recentPosts
</script>