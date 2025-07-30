<template>
  <header class="bg-gray-800 text-white py-4 shadow-md">
    <div class="container mx-auto px-4 flex justify-between items-center">
      <div class="logo">
        <NuxtLink to="/" class="text-xl font-bold text-white hover:text-green-400 transition-colors">
          HuanYu & 博客
        </NuxtLink>
      </div>
      
      <nav class="main-nav">
        <ul class="flex space-x-6">
          <li><NuxtLink to="/" class="text-white hover:text-green-400 transition-colors" active-class="text-green-400 font-semibold">首页</NuxtLink></li>
          <li><NuxtLink to="/minecraft" class="text-white hover:text-green-400 transition-colors" active-class="text-green-400 font-semibold">MC</NuxtLink></li>
          <li><NuxtLink to="/about" class="text-white hover:text-green-400 transition-colors" active-class="text-green-400 font-semibold">关于</NuxtLink></li>
          <li><NuxtLink to="/archive" class="text-white hover:text-green-400 transition-colors" active-class="text-green-400 font-semibold">归档</NuxtLink></li>
          <li><NuxtLink to="/contact" class="text-white hover:text-green-400 transition-colors" active-class="text-green-400 font-semibold">联系</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>