<template>
  <div class="command-helper-home">
    <BlogHeader />
    
    <main class="main-content">
      <HeroSection 
        title="Minecraft 命令助手"
        subtitle="快速生成各种 Minecraft 命令，提高你的游戏效率"
        ctaText="开始使用"
        ctaLink="/minecraft/command-helper/"/>
      
      <div class="content-container">
        <!-- 分类卡片容器 -->
        <div class="category-container">
          <!-- 物品组件生成 -->
          <a href="https://ds3.huanyu666.top" target="_blank" class="category-card">
            <div class="category-icon">
              <img src="/images/minecraft/diamond.png" alt="物品生成" />
            </div>
            <h2>物品生成（临时）</h2>
            <p>生成自定义物品、附魔、NBT标签等</p>
            <ul>
              <li>自定义物品属性</li>
              <li>附魔生成器</li>
              <li>NBT标签编辑器</li>
            </ul>
          </a>
          <NuxtLink to="/minecraft/command-helper/components-generator" class="category-card">
            <div class="category-icon">
              <img src="/images/minecraft/diamond.png" alt="物品生成" />
            </div>
            <h2>物品组件生成</h2>
            <p>生成自定义物品、附魔、NBT标签等</p>
            <ul>
              <li>自定义物品属性</li>
              <li>附魔生成器</li>
              <li>NBT标签编辑器</li>
            </ul>
          </NuxtLink>

          <!-- 实体生成 -->
          <NuxtLink to="/minecraft/command-helper/entity-generator" class="category-card">
            <div class="category-icon">
              <img src="/images/minecraft/egg.png" alt="实体生成" />
            </div>
            <h2>实体生成</h2>
            <p>生成各种实体、设置属性和行为</p>
            <ul>
              <li>自定义生物生成</li>
              <li>实体属性设置</li>
              <li>实体行为控制</li>
            </ul>
          </NuxtLink>

          <!-- 多命令合一 -->
          <NuxtLink to="/minecraft/command-helper/command-combiner" class="category-card">
            <div class="category-icon">
              <img src="/images/minecraft/command_block_minecart.png" alt="命令组合" />
            </div>
            <h2>多命令合一</h2>
            <p>将多个命令组合成一个高效命令</p>
            <ul>
              <li>命令链生成</li>
              <li>函数文件创建</li>
              <li>条件命令组合</li>
            </ul>
          </NuxtLink>

          <!-- 其他功能 -->
          <NuxtLink to="/minecraft/command-helper/other-tools" class="category-card">
            <div class="category-icon">
              <img src="/images/minecraft/redstone.png" alt="其他工具" />
            </div>
            <h2>其他工具</h2>
            <p>各种有用的 Minecraft 命令工具</p>
            <ul>
              <li>世界编辑工具</li>
              <li>玩家管理</li>
              <li>游戏规则设置</li>
            </ul>
          </NuxtLink>
        </div>

        <!-- 最近使用的命令 -->
        <div class="recent-commands" v-if="recentCommands.length > 0">
          <h2>最近使用的命令</h2>
          <div class="recent-list">
            <div 
              v-for="(cmd, index) in recentCommands" 
              :key="index" 
              class="recent-item"
              @click="copyCommand(cmd)"
            >
              <code>{{ cmd }}</code>
              <span class="copy-hint">点击复制</span>
            </div>
          </div>
        </div>
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

const recentCommands = ref([]);

// 从本地存储加载最近使用的命令
onMounted(() => {
  const savedCommands = localStorage.getItem('mcRecentCommands');
  if (savedCommands) {
    recentCommands.value = JSON.parse(savedCommands);
  }
});

const copyCommand = (command) => {
  navigator.clipboard.writeText(command);
  // 添加到最近使用
  if (!recentCommands.value.includes(command)) {
    recentCommands.value.unshift(command);
    if (recentCommands.value.length > 5) {
      recentCommands.value.pop();
    }
    localStorage.setItem('mcRecentCommands', JSON.stringify(recentCommands.value));
  }
  alert('命令已复制到剪贴板！');
};
</script>

<style scoped>
.command-helper-home {
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

.category-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 2rem 0;
}

.category-card {
  background-color: #333;
  border: 2px solid #555;
  padding: 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  text-decoration: none;
  color: inherit;
  display: block;
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: #55FF55;
}

.category-icon img {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

.category-card h2 {
  color: #55FF55;
  margin-top: 0;
  margin-bottom: 10px;
}

.category-card p {
  color: #AAA;
  margin-bottom: 15px;
}

.category-card ul {
  padding-left: 20px;
  color: #DDD;
}

.category-card li {
  margin-bottom: 5px;
}

.recent-commands {
  margin-top: 40px;
}

.recent-commands h2 {
  color: #55FF55;
  border-bottom: 1px solid #555;
  padding-bottom: 10px;
}

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.recent-item {
  background-color: #222;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #555;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recent-item:hover {
  background-color: #333;
  border-color: #55FF55;
}

.recent-item code {
  color: #FFAA00;
  font-family: 'Minecraft', monospace;
}

.copy-hint {
  margin-left: 10px;
  color: #AAA;
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-container {
    grid-template-columns: 1fr;
  }
}
</style>