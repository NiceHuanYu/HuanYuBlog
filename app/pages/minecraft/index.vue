<template>
  <div class="minecraft-home">
    <BlogHeader />
    
    <main class="main-content">
      <HeroSection 
        title="Minecraft 工具中心"
        subtitle="收集实用的 Minecraft 工具和资源"
        ctaText="探索工具"
        ctaLink="/minecraft"
      />
      
      <div class="content-container">
        <section class="tools-section">
          <h2 class="section-title">热门工具</h2>
          <div class="tools-grid">
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
        
        <section class="resources-section">
          <h2 class="section-title">资源下载</h2>
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
    icon: '🌱',
    link: '/minecraft/command-helper/',
    category: '实用工具'
  }
]

const resources = minecraftResources

</script>

<style scoped>
.minecraft-home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
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

.tools-section,
.resources-section {
  margin-bottom: 4rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #42b983;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
</style>