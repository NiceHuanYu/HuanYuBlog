<template>
  <div class="flex flex-col min-h-screen bg-gray-900">
    <BlogHeader />
    
    <main class="flex-grow py-8">
      <HeroSection 
        title="Minecraft 命令助手"
        subtitle="快速生成各种 Minecraft 命令，提高你的游戏效率"
        ctaText="开始使用"
        ctaLink="/minecraft/command-helper/"
      />
      
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <!-- 分类卡片容器 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          <!-- 物品组件生成 -->
          <a 
            href="https://ds3.huanyu666.top" 
            target="_blank"
            class="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500 hover:shadow-lg"
          >

            <h2 class="text-xl font-bold text-green-400 mb-3">物品生成（临时）</h2>
            <p class="text-gray-300 mb-4">生成自定义物品、附魔、NBT标签等</p>
            <ul class="space-y-2 pl-5 list-disc text-gray-400">
              <li>自定义物品属性</li>
              <li>附魔生成器</li>
              <li>NBT标签编辑器</li>
            </ul>
          </a>
          
          <NuxtLink 
            to="/minecraft/command-helper/components-generator" 
            class="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500 hover:shadow-lg"
          >
            <div class="flex justify-center mb-4">
              
            </div>
            <h2 class="text-xl font-bold text-green-400 mb-3">物品组件生成</h2>
            <p class="text-gray-300 mb-4">生成自定义物品、附魔、NBT标签等</p>
            <ul class="space-y-2 pl-5 list-disc text-gray-400">
              <li>自定义物品属性</li>
              <li>附魔生成器</li>
              <li>NBT标签编辑器</li>
            </ul>
          </NuxtLink>

          <!-- 实体生成 -->
          <NuxtLink 
            to="/minecraft/command-helper/entity-generator" 
            class="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500 hover:shadow-lg"
          >

            <h2 class="text-xl font-bold text-green-400 mb-3">实体生成</h2>
            <p class="text-gray-300 mb-4">生成各种实体、设置属性和行为</p>
            <ul class="space-y-2 pl-5 list-disc text-gray-400">
              <li>自定义生物生成</li>
              <li>实体属性设置</li>
              <li>实体行为控制</li>
            </ul>
          </NuxtLink>

          <!-- 多命令合一 -->
          <NuxtLink 
            to="/minecraft/command-helper/command-combiner" 
            class="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500 hover:shadow-lg"
          >

            <h2 class="text-xl font-bold text-green-400 mb-3">多命令合一</h2>
            <p class="text-gray-300 mb-4">将多个命令组合成一个高效命令</p>
            <ul class="space-y-2 pl-5 list-disc text-gray-400">
              <li>命令链生成</li>
              <li>函数文件创建</li>
              <li>条件命令组合</li>
            </ul>
          </NuxtLink>

          <!-- 其他功能 -->
          <NuxtLink 
            to="/minecraft/command-helper/other-tools" 
            class="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500 hover:shadow-lg"
          >

            <h2 class="text-xl font-bold text-green-400 mb-3">其他工具</h2>
            <p class="text-gray-300 mb-4">各种有用的 Minecraft 命令工具</p>
            <ul class="space-y-2 pl-5 list-disc text-gray-400">
              <li>世界编辑工具</li>
              <li>玩家管理</li>
              <li>游戏规则设置</li>
            </ul>
          </NuxtLink>
        </div>

      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import BlogFooter from '@/components/BlogFooter.vue'


</script>

<style scoped>
/* 自定义滚动条样式 */
code::-webkit-scrollbar {
  height: 4px;
}

code::-webkit-scrollbar-track {
  background: #1a1a1a;
}

code::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 2px;
}

code::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>