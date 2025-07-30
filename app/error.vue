<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
    <!-- 顶部装饰条 -->
    <div class="h-2 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
    
    <main class="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ease-out">
        <!-- 错误代码展示区 -->
        <div class="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center">
          <div class="inline-block bg-gray-800 rounded-full p-4 mb-6">
            <div class="h-16 w-16 mx-auto text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <h1 class="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            {{ error?.statusCode || 'Error' }}
          </h1>
          <p class="text-gray-300 text-lg font-medium">
            {{ statusMessage }}
          </p>
        </div>

        <!-- 错误内容区 -->
        <div class="p-8 sm:p-10">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              {{ errorTitle }}
            </h2>
            <p class="text-gray-600 mb-8 leading-relaxed">
              {{ error?.description || '请检查网址是否正确，或稍后再试' }}
            </p>

            <!-- 动态错误详情 -->
            <div v-if="error?.message" class="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 text-left rounded">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9.303-3.376c.866 1.5.217 3.374-1.948 3.374-1.313 0-2.503-.92-2.754-2.122m-7.5 0V4.5c0-1.1.9-2 2-2s2 .9 2 2v6.636m-7.5 0a3.001 3.001 0 00-3-3 3.001 3.001 0 013-3h6.636a3.001 3.001 0 013 3 3.001 3.001 0 01-3 3m-7.5 0V21" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-amber-700 font-medium">
                    {{ error.message }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 操作按钮组 -->
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <button @click="handleRetry" 
                class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                重试操作
              </button>
              <button @click="goHome" 
                class="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center">
                <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                返回首页
              </button>
              <a href="mailto:3308225809@qq.com" 
                class="px-6 py-3 text-gray-600 font-medium rounded-lg hover:text-cyan-600 transition-colors flex items-center justify-center">
                <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.083 1.5 1.996v3.006c0 1.201-1.06 2.16-2.31 2.16H5.31c-1.24 0-2.31-.96-2.31-2.16V10.5c0-.91.61-1.71 1.5-1.996V7.75c0-1.38 1.11-2.5 2.5-2.5h11c1.38 0 2.5 1.12 2.5 2.5v.761zm-8.5 5l5-3m-5 0l5 3" />
                </svg>
                联系支持
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="py-6 text-center text-gray-500 text-sm">
      © {{ new Date().getFullYear() }} HuanYu & Blog · 保留所有权利
    </footer>
  </div>
</template>

<script setup>
import { useError, clearError, useRouter } from '#app'
import { computed, ref } from 'vue'

// 处理错误对象
const router = useRouter()
const error = ref(useError() || {
  statusCode: 500,
  message: '未知错误',
  description: '发生意外的系统错误'
})

// 根据状态码生成友好提示
const statusMessage = computed(() => {
  if (!error.value?.statusCode) return '出错了'
  switch (error.value.statusCode) {
    case 404: return '页面不存在'
    case 403: return '访问被拒绝'
    case 500: return '服务器内部错误'
    default: return '出错了'
  }
})

// 根据错误类型生成标题
const errorTitle = computed(() => {
  if (error.value?.statusCode === 404) {
    return '您寻找的页面已消失'
  }
  return '遇到了一些问题'
})

// 重试操作
const handleRetry = () => {
  clearError()
  window.location.reload()
}

// 返回首页
const goHome = () => {
  clearError()
  router.push('/')
}
</script>

<style scoped>
/* 添加微妙的动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

main {
  animation: fadeIn 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
</style>