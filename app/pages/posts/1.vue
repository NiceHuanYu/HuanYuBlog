<template>
  <div class="post-page">
    <BlogHeader />
    
    <main class="main-content">
      <article class="post-container">
        <header class="post-header">
          <div class="post-meta">
            <span class="post-category">技术</span>
            <time class="post-date">2023年5月15日</time>
          </div>
          <h1 class="post-title">Nuxt4 入门指南</h1>
          <p class="post-excerpt">学习如何使用Nuxt4构建现代Web应用</p>
        </header>
        
        <div class="post-content">
          <img src="/images/nuxt4-banner.jpg" alt="Nuxt4 介绍" class="post-featured-image">
          
          <p>Nuxt.js 是一个基于 Vue.js 的通用应用框架，最新发布的 Nuxt4 带来了许多令人兴奋的新特性和改进。本文将带您快速入门 Nuxt4 开发。</p>
          
          <h2>1. 为什么选择 Nuxt4？</h2>
          
          <p>Nuxt4 相比前代版本有以下优势：</p>
          
          <ul>
            <li><strong>性能提升</strong>：更快的构建速度和更小的包体积</li>
            <li><strong>开发体验优化</strong>：改进的 HMR (热模块替换) 和更快的服务器启动</li>
            <li><strong>现代工具链</strong>：默认使用 Vite 4 和 Vue 3</li>
            <li><strong>更好的 TypeScript 支持</strong>：开箱即用的 TS 支持</li>
          </ul>
          
          <h2>2. 创建 Nuxt4 项目</h2>
          
          <p>使用以下命令创建一个新的 Nuxt4 项目：</p>
          
        <CodeBlock language="bash" filename="setup.sh">
            npx nuxi init my-nuxt-app
            cd my-nuxt-app
            npm install
            npm run dev
        </CodeBlock>
          
          <p>项目结构如下：</p>
          
          <pre><code class="language-markdown">my-nuxt-app/
├── .nuxt/          # 构建输出目录
├── node_modules/   # 依赖模块
├── app.vue         # 主应用组件
├── nuxt.config.ts  # Nuxt 配置文件
├── package.json
└── tsconfig.json   # TypeScript 配置</code></pre>
          
          <h2>3. 核心概念</h2>
          
          <h3>3.1 页面路由</h3>
          
          <p>Nuxt4 延续了基于文件系统的路由。在 <code>pages</code> 目录下创建 Vue 文件即可自动生成路由：</p>
          
          <pre><code class="language-markdown">pages/
├── index.vue       # 对应 /
├── about.vue       # 对应 /about
└── posts/
    ├── index.vue   # 对应 /posts
    └── [id].vue    # 对应 /posts/:id</code></pre>
          
          <h3>3.2 布局系统</h3>
          
          <p>在 <code>layouts</code> 目录下创建布局组件，然后在页面中使用 <code>definePageMeta</code> 指定布局：</p>
          
          <pre><code class="language-html">&lt;!-- layouts/default.vue --&gt;
&lt;template&gt;
  &lt;div&gt;
    &lt;AppHeader /&gt;
    &lt;slot /&gt;
    &lt;AppFooter /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;!-- pages/index.vue --&gt;
&lt;script setup&gt;
definePageMeta({
  layout: 'default'
})
&lt;/script&gt;</code></pre>
          
          <h2>4. 数据获取</h2>
          
          <p>Nuxt4 提供了多种数据获取方式：</p>
          
          <h3>4.1 useAsyncData</h3>
          
          <pre><code class="language-javascript">&lt;script setup&gt;
const { data } = await useAsyncData('posts', () => {
  return $fetch('/api/posts')
})
&lt;/script&gt;</code></pre>
          
          <h3>4.2 useFetch</h3>
          
          <pre><code class="language-javascript">&lt;script setup&gt;
const { data } = await useFetch('/api/posts')
&lt;/script&gt;</code></pre>
          
          <h2>5. 部署</h2>
          
          <p>Nuxt4 支持多种部署方式：</p>
          
          <ul>
            <li><strong>静态站点</strong>：<code>npm run generate</code> 生成静态文件</li>
            <li><strong>Node 服务器</strong>：<code>npm run build</code> + <code>npm run start</code></li>
            <li><strong>Serverless</strong>：部署到 Vercel、Netlify 等平台</li>
          </ul>
          
          <div class="post-note">
            <p><strong>提示</strong>：Nuxt4 默认支持自动导入，无需手动导入 Vue 组合式 API 和 Nuxt 工具函数。</p>
          </div>
          
          <h2>结语</h2>
          
          <p>Nuxt4 为 Vue 开发者提供了更强大、更高效的开发体验。本文只是入门介绍，更多高级特性如中间件、插件、模块等将在后续文章中探讨。</p>
          
          <div class="post-tags">
            <span class="tag">#Nuxt4</span>
            <span class="tag">#Vue3</span>
            <span class="tag">#前端开发</span>
          </div>
        </div>
        
        <footer class="post-footer">
          <div class="author-card">
            <img src="/images/author-avatar.jpg" alt="作者头像" class="author-avatar">
            <div class="author-info">
              <h3>寰宇Actor</h3>
              <p>全栈开发者，专注于 Web 技术和游戏开发</p>
            </div>
          </div>
          
          <div class="post-navigation">
            <NuxtLink to="/posts/vue3-composition-api" class="nav-link prev">
              <i class="fas fa-arrow-left"></i>
              <span>上一篇：Vue3 组合式 API 实践</span>
            </NuxtLink>
            <NuxtLink to="/posts/css-modern-layout" class="nav-link next">
              <span>下一篇：CSS 现代布局技巧</span>
              <i class="fas fa-arrow-right"></i>
            </NuxtLink>
          </div>
        </footer>
      </article>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import BlogFooter from '@/components/BlogFooter.vue'
import CodeBlock from '@/components/CodeBlock.vue'

useHead({
  title: 'Nuxt4 入门指南 | 寰宇Actor的博客',
  meta: [
    { name: 'description', content: '学习如何使用Nuxt4构建现代Web应用' },
    { name: 'keywords', content: 'Nuxt4,Vue3,前端开发' }
  ]
})
</script>

<style scoped>
.post-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.post-header {
  margin-bottom: 2rem;
  text-align: center;
}

.post-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.post-category {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
}

.post-date {
  color: #888;
}

.post-title {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.post-excerpt {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.post-featured-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-content {
  line-height: 1.8;
  color: #333;
}

.post-content h2 {
  font-size: 1.6rem;
  color: #2c3e50;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.post-content h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 1.5rem 0 0.8rem;
}

.post-content p {
  margin-bottom: 1.2rem;
}

.post-content ul,
.post-content ol {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.post-content li {
  margin-bottom: 0.5rem;
}

.post-content pre {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-family: 'Courier New', Courier, monospace;
}

.post-content code {
  font-family: 'Courier New', Courier, monospace;
  background-color: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

.post-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.post-note {
  background-color: #f0f7f0;
  border-left: 4px solid #42b983;
  padding: 1rem;
  margin: 1.5rem 0;
  border-radius: 0 4px 4px 0;
}

.post-tags {
  display: flex;
  gap: 0.8rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.tag {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.post-footer {
  margin-top: 3rem;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.author-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #42b983;
}

.author-info h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.3rem;
}

.author-info p {
  color: #666;
  margin: 0;
}

.post-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem;
  border-radius: 4px;
}

.nav-link:hover {
  color: #42b983;
  background-color: #f0f7f0;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.8rem;
  }
  
  .post-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-link {
    justify-content: space-between;
  }
}
</style>