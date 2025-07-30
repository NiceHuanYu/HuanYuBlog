<!-- MinecraftHome.vue -->
<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <BlogHeader />
    
    <main class="flex-1 py-8">
      <HeroSection 
        title="Minecraft 工具中心"
        subtitle="收集实用的 Minecraft 工具和资源"
        ctaText="探索工具"
        ctaLink="/minecraft"
      />
      
      <div class="max-w-6xl mx-auto px-6">
        <section class="mb-16 bg-white p-8 rounded-lg shadow-sm">
          <h2 class="text-2xl font-bold text-gray-800 mb-8 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-[3px] after:bg-emerald-500">
            热门工具
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ToolCard 
              v-for="tool in featuredTools"
              :key="tool.id"
              :title="tool.title"
              :description="tool.description"
              :icon="tool.icon"
              :link="tool.link"
              :category="tool.category"
            />
          </div>
        </section>
        
        <section class="mb-16 bg-white p-8 rounded-lg shadow-sm">
          <h2 class="text-2xl font-bold text-gray-800 mb-8 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-[3px] after:bg-emerald-500">
            资源下载
          </h2>
          <ResourceList :resources="resources" />
        </section>
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
// 导入组件
import BlogHeader from '@/components/BlogHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import BlogFooter from '@/components/BlogFooter.vue'
import ToolCard from '@/components/minecraft/ToolCard.vue'
import ResourceList from '@/components/minecraft/ResourceList.vue'
import { minecraftResources } from '@/data/MinecraftResources'

// Minecraft 工具数据
const featuredTools = [
  {
    id: 1,
    title: '指令生成器',
    description: '随心所欲的编辑一切物品或者实体！',
    icon: '🌱🌱',
    link: '/minecraft/command-helper/',
    category: '实用工具'
  }
]

const resources = minecraftResources
</script>

<style scoped>
/* 保留自定义伪元素 */
.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #42b983;
}
</style>