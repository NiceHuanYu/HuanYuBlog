<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <BlogHeader />
    
    <main class="flex-1 py-8">
      <div class="container mx-auto px-6">
        <section>
          <!-- 标题部分 -->
          <div class="text-center mb-8">
            <h1 class="text-4xl text-gray-800 mb-2 relative pb-2">
              关于我
              <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-green-500"></span>
            </h1>
            <p class="text-lg text-gray-600">一个平平无奇的大学牲</p>
          </div>
          
          <!-- 网格布局 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 个人资料卡片 -->
            <div class="bg-white p-6 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-md transition-all col-span-full lg:col-span-3 flex flex-col md:flex-row items-center">
              <div class="w-36 h-36 rounded-full overflow-hidden border-4 border-green-500 mb-4 md:mr-6 md:mb-0">
                <img src="/images/profile.jpg" alt="我的头像" class="w-full h-full object-cover">
              </div>
              <div class="text-center md:text-left">
                <h2 class="text-2xl text-gray-800 mb-2">寰宇Actor</h2>
                <p class="text-gray-600 mb-4">小小程序员 & Minecraft爱好者</p>
                <div class="flex justify-center md:justify-start gap-4">
                  <a href="https://github.com/yourusername" target="_blank" class="text-gray-800 text-xl hover:text-green-500 transition-colors">
                    <i class="fab fa-github"></i>
                  </a>
                  <a href="https://space.bilibili.com/621662356" target="_blank" class="text-gray-800 text-xl hover:text-green-500 transition-colors">
                    <i class="fab fa-bilibili"></i>
                  </a>
                  <a href="https://twitter.com/yourusername" target="_blank" class="text-gray-800 text-xl hover:text-green-500 transition-colors">
                    <i class="fab fa-twitter"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <!-- 个人简介 -->
            <div class="bg-white p-6 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-md transition-all lg:col-span-3">
              <h3 class="text-xl text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                <i class="fas fa-user text-green-500"></i> 个人简介
              </h3>
              <div class="space-y-3">
                <p>你好！我是寰宇Actor，喜欢开发一些小玩意。</p>
                <p>我热爱创造和分享，喜欢探索新技术并将其应用到实际项目中。我的博客主要分享技术教程、开发经验和一些有趣的项目。</p>
                <p>在业余时间，我喜欢玩Minecraft并开发相关工具和插件，这也是我创建Minecraft工具页面的原因。</p>
              </div>
            </div>
            
            <!-- 我的日常 -->
            <div class="bg-white p-6 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <h3 class="text-xl text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                <i class="fas fa-code text-green-500"></i> 我的日常
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="text-sm text-gray-800 mb-1">CounterStrike:Global Offensive & Minecraft</div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: 90%"></div>
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-800 mb-1">健身</div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: 85%"></div>
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-800 mb-1">机械设计</div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: 80%"></div>
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-800 mb-1">游泳</div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: 75%"></div>
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-800 mb-1">程序设计</div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: 70%"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 兴趣爱好 -->
            <div class="bg-white p-6 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <h3 class="text-xl text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                <i class="fas fa-heart text-green-500"></i> 兴趣爱好
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div class="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-all hover:bg-green-500 hover:text-white">
                  <i class="fas fa-gamepad text-2xl mb-2"></i>
                  <span>游戏开发</span>
                </div>
                <div class="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-all hover:bg-green-500 hover:text-white">
                  <i class="fas fa-music text-2xl mb-2"></i>
                  <span>音乐</span>
                </div>
                <div class="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-all hover:bg-green-500 hover:text-white">
                  <i class="fas fa-book text-2xl mb-2"></i>
                  <span>阅读</span>
                </div>
                <div class="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-all hover:bg-green-500 hover:text-white">
                  <i class="fas fa-camera text-2xl mb-2"></i>
                  <span>摄影</span>
                </div>
                <div class="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-all hover:bg-green-500 hover:text-white">
                  <i class="fas fa-utensils text-2xl mb-2"></i>
                  <span>烹饪</span>
                </div>
                <div class="flex flex-col items-center p-4 bg-gray-100 rounded-lg transition-all hover:bg-green-500 hover:text-white">
                  <i class="fas fa-plane text-2xl mb-2"></i>
                  <span>旅行</span>
                </div>
              </div>
            </div>
            
            <!-- 联系我 -->
            <div class="bg-white p-6 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <h3 class="text-xl text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                <i class="fas fa-envelope text-green-500"></i> 联系我
              </h3>
              <div>
                <p class="mb-4">如果你有任何问题或合作意向，欢迎通过以下方式联系我：</p>
                <ul class="space-y-3">
                  <li class="flex items-center gap-3 text-gray-800">
                    <i class="fas fa-envelope text-green-500 w-5 text-center"></i>
                    <span>邮箱: 3308225809@qq.com</span>
                  </li>
                  <li class="flex items-center gap-3 text-gray-800">
                    <i class="fab fa-github text-green-500 w-5 text-center"></i>
                    <span>GitHub: NiceHuanYu</span>
                  </li>
                  <li class="flex items-center gap-3 text-gray-800">
                    <i class="fab fa-telegram text-green-500 w-5 text-center"></i>
                    <span>Telegram: @木有哦</span>
                  </li>
                  <li class="flex items-center gap-3 text-gray-800">
                    <i class="fab fa-discord text-green-500 w-5 text-center"></i>
                    <span>Discord: 忘记惹#1234</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import BlogFooter from '@/components/BlogFooter.vue'
</script>