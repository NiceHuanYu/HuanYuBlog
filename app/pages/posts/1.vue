<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <BlogHeader />
    
    <main class="flex-grow py-8">
      <article class="max-w-4xl mx-auto px-4 md:px-6">
        <header class="text-center mb-10">
          <div class="flex justify-center gap-4 mb-4">
            <span class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              技术
            </span>
            <time class="text-gray-500">2023年5月15日</time>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Nuxt4 入门指南</h1>
          <p class="text-xl text-gray-600">学习如何使用Nuxt4构建现代Web应用</p>
        </header>
        
        <div class="prose prose-lg max-w-none mb-10">
          <img 
            src="/images/nuxt4-banner.jpg" 
            alt="Nuxt4 介绍" 
            class="w-full rounded-xl shadow-md mb-8"
          >
          
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
            code="<!-- layouts/default.vue -->
<template>
  <div>
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
          
          <div class="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded">
            <p class="font-medium text-green-800">提示：Nuxt4 默认支持自动导入，无需手动导入 Vue 组合式 API 和 Nuxt 工具函数。</p>
          </div>
          
          <h2>结语</h2>
          
          <p>Nuxt4 为 Vue 开发者提供了更强大、更高效的开发体验。本文只是入门介绍，更多高级特性如中间件、插件、模块等,可以访问
            <a 
              href="https://nuxt.com.cn/docs/4.x/guide/" 
              target="_blank"
              class="text-blue-600 hover:underline"
            >Nuxt4的官方指导文件</a>
          </p>
          
          <div class="flex gap-2 my-8 flex-wrap">
            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#Nuxt4</span>
            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#Vue3</span>
            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#前端开发</span>
          </div>
        </div>
        
        <footer class="border-t border-gray-200 pt-8 mt-8">
          <div class="flex items-center gap-4 mb-8">
            <img 
              src="/images/author-avatar.jpg" 
              alt="作者头像" 
              class="w-16 h-16 rounded-full border-2 border-green-500"
            >
            <div>
              <h3 class="text-xl font-bold text-gray-800">寰宇Actor</h3>
              <p class="text-gray-600">全栈开发者，专注于 Web 技术和游戏开发</p>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row justify-between gap-4">
            <NuxtLink 
              to="/posts/1" 
              class="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              <i class="fas fa-arrow-left"></i>
              <span>上一篇：无</span>
            </NuxtLink>
            <NuxtLink 
              to="/posts/2" 
              class="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 justify-end"
            >
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