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
          
          <h2>前言：你的准备工作</h2>
          <p>在开始之前，请确保您已经安装了 Node.js & Git & VSCode。推荐使用最新的 LTS 版本。</p>
          <p>Node.js 无需配置-一路回车（笑</p>
          <p>但是Git需要配置：</p>
          <CodeBlock 
            language="bash"
            code="git config --global user.name '你的名字'
git config --global user.email '你的邮箱@example.com'"
          />
          <p>创建SSH Key。在用户主目录下，看看有没有.ssh目录，如果有，再看看这个目录下有没有id_rsa和id_rsa.pub这两个文件，如果已经有了，可直接跳到下一步。如果没有，打开Shell（Windows下打开Git Bash），创建SSH Key：</p>
          <CodeBlock 
            language="bash"
            code="ssh-keygen -t rsa -C '你的邮箱@example.com'"
          />
          <p>如果一切顺利的话，可以在用户主目录里找到.ssh目录，里面有id_rsa和id_rsa.pub两个文件，这两个就是SSH Key的秘钥对，id_rsa是私钥，不能泄露出去，id_rsa.pub是公钥，可以放心地告诉任何人。</p>
          <p>登陆GitHub，打开“Account settings”，“SSH Keys”页面。
然后，点“Add SSH Key”，填上任意Title，在Key文本框里粘贴id_rsa.pub文件的内容</p>
          
          <p>VsCode配置：其实就是安装一些插件。</p>
          <p>包括但不限于：</p>
          <CodeBlock 
            language="bash"
            code="Chinese (Simplified) Language Pack for Visual Studio Code
HTML CSS Support
Live Server
vscode-pdf#unnessary
Vue Language Features (Volar)
Vue(official)
Auto Rename Tag"    
          />
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
          <CodeBlock 
            language="bash"
            code="npx nuxi init my-nuxt-app
cd my-nuxt-app
npm install
npm run dev"
          />
          
          <p>项目结构如下：</p>
          <CodeBlock 
            language="bash"
            code="my-nuxt-app/
├── .nuxt/          # 构建输出目录
├── node_modules/   # 依赖模块
├── public/         # 静态资源目录
├── app/
    ├── components/     # Vue 组件
    ├── layouts/        # 布局组件
    ├── pages/          # 页面组件
    ├── plugins/        # 插件
    ├── store/          # Vuex 状态管理
    ├── middleware/     # 中间件
    ├── assets/         # 静态资源（图片、样式等）
    ├── app.vue         # 主应用组件
├── nuxt.config.ts  # Nuxt 配置文件
├── package.json
└── tsconfig.json   # TypeScript 配置"
          />
          
          <h2>3. 核心概念</h2>
          
          <h3>3.1 页面路由</h3>
          
          <p>Nuxt4 延续了基于文件系统的路由。在 <code>pages</code> 目录下创建 Vue 文件即可自动生成路由：</p>
          <CodeBlock 
            language="bash"
            code="pages/
├── index.vue       # 对应 /
├── about.vue       # 对应 /about
└── posts/
    ├── index.vue   # 对应 /posts
    └── [id].vue    # 对应 /posts/:id"
          />

          <h3>3.2 布局系统</h3>
          
          <p>在 <code>layouts</code> 目录下创建布局组件，然后在页面中使用 <code>definePageMeta</code> 指定布局：</p>
          <CodeBlock 
            language="html"
            code="<!-- layouts/default.vue -->;
<template>;
  <div>;
    <AppHeader />
    <slot />
    <AppFooter />
  </div>
</template>

<!-- pages/index.vue -->
<script setup>
definePageMeta({
  layout: 'default'
})
</script>"
          />
          
          <h2>4. 数据获取</h2>
          
          <p>Nuxt4 提供了多种数据获取方式：</p>
          
          <h3>4.1 useAsyncData</h3>
          <CodeBlock 
            language="javascript"
            code="const { data } = await useAsyncData('posts', () => {
  return $fetch('/api/posts')
})"
          />
          
          <h3>4.2 useFetch</h3>
          <CodeBlock 
            language="javascript"
            code="const { data } = await useFetch('/api/posts')"
          />
          
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
          
          <p>Nuxt4 为 Vue 开发者提供了更强大、更高效的开发体验。本文只是入门介绍，更多高级特性如中间件、插件、模块等,可以访问
            <u><a href="https://nuxt.com.cn/docs/4.x/guide/" target="_blank">Nuxt4的官方指导文件</a></u>
          </p>
          
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
            <NuxtLink to="/posts/1" class="nav-link prev">
              <i class="fas fa-arrow-left"></i>
              <span>上一篇：无</span>
            </NuxtLink>
            <NuxtLink to="/posts/2" class="nav-link next">
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