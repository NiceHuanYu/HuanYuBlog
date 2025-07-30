<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <BlogHeader />
    
    <main class="flex-grow py-8">
      <div class="container mx-auto px-4 max-w-4xl">
        <section class="text-center mb-10">
          <h1 class="text-3xl font-bold text-gray-800 mb-2 relative pb-2 inline-block">
            联系我
            <span class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-green-500"></span>
          </h1>
          <p class="text-lg text-gray-600">通过以下方式与我取得联系</p>
        </section>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div class="bg-white rounded-xl shadow-md p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div class="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-envelope text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 mb-1">电子邮件</h2>
              <p class="text-gray-600 mb-3">3308225809@qq.com</p>
              <a 
                href="mailto:3308225809@qq.com" 
                class="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <i class="fas fa-paper-plane"></i>
                发送邮件
              </a>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-md p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div class="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fab fa-telegram text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 mb-1">QQ</h2>
              <p class="text-gray-600 mb-3">3308225809</p>
              <a 
                href="https://im.qq.com" 
                target="_blank"
                class="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <i class="fas fa-paper-plane"></i>
                发送消息
              </a>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-md p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div class="bg-gray-100 text-gray-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fab fa-github text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 mb-1">GitHub</h2>
              <p class="text-gray-600 mb-3">NiceHuanyu</p>
              <a 
                href="https://github.com/NiceHuanYu" 
                target="_blank"
                class="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <i class="fas fa-user-plus"></i>
                点点关注
              </a>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-md p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div class="bg-pink-100 text-pink-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fab fa-bilibili text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 mb-1">Bilibili</h2>
              <p class="text-gray-600 mb-3">寰宇Actor</p>
              <a 
                href="https://space.bilibili.com/621662356" 
                target="_blank"
                class="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <i class="fas fa-external-link-alt"></i>
                访问主页
              </a>
            </div>
          </div>
        </div>
        
        <div class="text-center py-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 inline-block relative pb-1">
            社交媒体
            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
          </h2>
          
          <div class="flex justify-center gap-8">
            <a 
              href="https://github.com/NiceHuanYu" 
              target="_blank"
              class="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors"
            >
              <div class="w-16 h-16 bg-gray-100 hover:bg-green-100 rounded-full flex items-center justify-center mb-2 transition-colors">
                <i class="fab fa-github text-3xl"></i>
              </div>
              <span>GitHub</span>
            </a>
            
            <a 
              href="https://space.bilibili.com/621662356" 
              target="_blank"
              class="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors"
            >
              <div class="w-16 h-16 bg-gray-100 hover:bg-pink-100 rounded-full flex items-center justify-center mb-2 transition-colors">
                <i class="fab fa-bilibili text-3xl"></i>
              </div>
              <span>Bilibili</span>
            </a>
          </div>
        </div>
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import BlogFooter from '@/components/BlogFooter.vue'
</script>