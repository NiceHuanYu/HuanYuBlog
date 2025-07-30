<template>
  <footer class="bg-gray-800 text-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4 text-green-400">关于我</h3>
          <p class="text-gray-300 leading-relaxed">
            一名热爱技术的前端开发者，喜欢分享知识和经验。
          </p>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4 text-green-400">链接</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/" class="text-gray-300 hover:text-green-400 transition-colors">首页</NuxtLink></li>
            <li><NuxtLink to="/minecraft" class="text-gray-300 hover:text-green-400 transition-colors">MC</NuxtLink></li>
            <li><NuxtLink to="/about" class="text-gray-300 hover:text-green-400 transition-colors">关于</NuxtLink></li>
            <li><NuxtLink to="/archive" class="text-gray-300 hover:text-green-400 transition-colors">归档</NuxtLink></li>
            <li><NuxtLink to="/contact" class="text-gray-300 hover:text-green-400 transition-colors">联系</NuxtLink></li>
          </ul>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4 text-green-400">社交</h3>
          <div class="flex space-x-3">
            <a href="#" class="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded text-sm">GitHub</a>
            <a href="#" class="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded text-sm">Bilibili</a>
            <a href="#" class="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded text-sm">QQ</a>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
      &copy; {{ new Date().getFullYear() }} 我的博客. 保留所有权利.
    </div>
  </footer>
</template>

<script setup>
</script>