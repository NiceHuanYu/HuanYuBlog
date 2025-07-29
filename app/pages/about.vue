<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <BlogHeader />
    
    <main class="flex-1 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <section class="text-center mb-12">
          <h1 class="relative inline-block text-3xl sm:text-4xl font-bold text-gray-800 pb-2">
            关于我
            <span class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-green-500"></span>
          </h1>
          <p class="mt-3 text-gray-600 text-lg">一个平平无奇的大学牲</p>
        </section>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 个人信息卡片 -->
          <div class="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div class="p-6 flex flex-col md:flex-row items-center">
              <div class="relative mb-6 md:mb-0 md:mr-6">
                <div class="w-36 h-36 rounded-full border-4 border-green-500 overflow-hidden">
                  <img src="/images/profile.jpg" alt="我的头像" class="w-full h-full object-cover">
                </div>
              </div>
              <div class="text-center md:text-left">
                <h2 class="text-2xl font-bold text-gray-800">寰宇Actor</h2>
                <p class="mt-1 text-gray-600">小小程序员 & Minecraft爱好者</p>
                <!-- <div class="mt-4 flex justify-center md:justify-start space-x-4">
                  <a href="https://github.com/yourusername" target="_blank" class="text-gray-700 hover:text-green-500 text-xl transition-colors">
                    <i class="fab fa-github"></i>
                  </a>
                  <a href="https://space.bilibili.com/621662356" target="_blank" class="text-gray-700 hover:text-green-500 text-xl transition-colors">
                    <i class="fab fa-bilibili"></i>
                  </a>
                  <a href="https://twitter.com/yourusername" target="_blank" class="text-gray-700 hover:text-green-500 text-xl transition-colors">
                    <i class="fab fa-twitter"></i>
                  </a>
                </div> -->
              </div>
            </div>
          </div>
          
          <!-- 个人简介卡片 -->
          <div class="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div class="p-6">
              <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
                <i class="fas fa-user text-green-500 mr-2"></i>
                <h3 class="text-xl font-semibold text-gray-800">个人简介</h3>
              </div>
              <div class="text-gray-700 space-y-3">
                <p>你好！我是寰宇Actor，喜欢开发一些小玩意。</p>
                <p>我热爱创造和分享，喜欢探索新技术并将其应用到实际项目中。我的博客主要分享技术教程、开发经验和一些有趣的项目。</p>
                <p>在业余时间，我喜欢玩Minecraft并开发相关工具和插件，这也是我创建Minecraft工具页面的原因。</p>
              </div>
            </div>
          </div>
          
          <!-- 技能卡片 -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div class="p-6">
              <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
                <i class="fas fa-code text-green-500 mr-2"></i>
                <h3 class="text-xl font-semibold text-gray-800">我的日常</h3>
              </div>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">CounterStrike:Global Offensive & Minecraft</span>
                    <span class="text-sm text-gray-500">90%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 90%"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">健身</span>
                    <span class="text-sm text-gray-500">85%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 85%"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">机械设计</span>
                    <span class="text-sm text-gray-500">80%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 80%"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">游泳</span>
                    <span class="text-sm text-gray-500">75%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 75%"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">程序设计</span>
                    <span class="text-sm text-gray-500">70%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 70%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 兴趣卡片 -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div class="p-6">
              <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
                <i class="fas fa-heart text-green-500 mr-2"></i>
                <h3 class="text-xl font-semibold text-gray-800">兴趣爱好</h3>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-green-500 group">
                  <i class="fas fa-gamepad text-xl text-gray-600 group-hover:text-white mb-2"></i>
                  <span class="text-gray-700 group-hover:text-white">游戏开发</span>
                </div>
                
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-green-500 group">
                  <i class="fas fa-music text-xl text-gray-600 group-hover:text-white mb-2"></i>
                  <span class="text-gray-700 group-hover:text-white">音乐</span>
                </div>
                
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-green-500 group">
                  <i class="fas fa-book text-xl text-gray-600 group-hover:text-white mb-2"></i>
                  <span class="text-gray-700 group-hover:text-white">阅读</span>
                </div>
                
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-green-500 group">
                  <i class="fas fa-camera text-xl text-gray-600 group-hover:text-white mb-2"></i>
                  <span class="text-gray-700 group-hover:text-white">摄影</span>
                </div>
                
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-green-500 group">
                  <i class="fas fa-utensils text-xl text-gray-600 group-hover:text-white mb-2"></i>
                  <span class="text-gray-700 group-hover:text-white">烹饪</span>
                </div>
                
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-green-500 group">
                  <i class="fas fa-plane text-xl text-gray-600 group-hover:text-white mb-2"></i>
                  <span class="text-gray-700 group-hover:text-white">旅行</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 联系卡片 -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div class="p-6">
              <div class="flex items-center mb-4 pb-2 border-b border-gray-100">
                <i class="fas fa-envelope text-green-500 mr-2"></i>
                <h3 class="text-xl font-semibold text-gray-800">联系我</h3>
              </div>
              <div class="space-y-3">
                <p class="text-gray-700">如果你有任何问题或合作意向，欢迎通过以下方式联系我：</p>
                <ul class="space-y-3 mt-4">
                  <li class="flex items-center">
                    <i class="fas fa-envelope text-green-500 w-6"></i>
                    <span class="text-gray-700 ml-2">邮箱: 3308225809@qq.com</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fab fa-github text-green-500 w-6"></i>
                    <span class="text-gray-700 ml-2">GitHub: NiceHuanYu</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fab fa-telegram text-green-500 w-6"></i>
                    <span class="text-gray-700 ml-2">Telegram: @木有哦</span>
                  </li>
                  <li class="flex items-center">
                    <i class="fab fa-discord text-green-500 w-6"></i>
                    <span class="text-gray-700 ml-2">Discord: 忘记惹#1234</span>
                  </li>
                </ul>
              </div>
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
import BlogFooter from '@/components/BlogFooter.vue'
</script>