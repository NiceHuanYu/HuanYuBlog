<!-- ResourceList.vue -->
<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <div class="grid grid-cols-12 gap-4 bg-gray-800 text-white font-bold p-4  md:grid">
      <span class="col-span-5">资源名称</span>
      <span class="col-span-2">类型</span>
      <span class="col-span-2">大小</span>
      <span class="col-span-1">下载量</span>
      <span class="col-span-2">更新时间</span>
    </div>
    
    <div class="divide-y divide-gray-200">
      <div 
        v-for="resource in resources" 
        :key="resource.id" 
        class="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 hover:bg-gray-50 transition-colors"
      >
        <div class="md:hidden font-medium text-gray-600">资源名称</div>
        <span class="font-medium md:col-span-5" :data-label="'资源名称'">{{ resource.name }}</span>
        
        <div class="md:hidden font-medium text-gray-600">类型</div>
        <span class="md:col-span-2" :data-label="'类型'">{{ resource.type }}</span>
        
        <div class="md:hidden font-medium text-gray-600">大小</div>
        <span class="md:col-span-2" :data-label="'大小'">{{ resource.size }}</span>
        
        <div class="md:hidden font-medium text-gray-600">下载量</div>
        <span class="md:col-span-1" :data-label="'下载量'">{{ resource.downloads.toLocaleString() }}</span>
        
        <div class="md:hidden font-medium text-gray-600">更新时间</div>
        <span class="md:col-span-2" :data-label="'更新时间'">{{ formatDate(resource.updated) }}</span>

        <a 
          class="mt-2 md:mt-0 inline-block md:col-start-12 py-2 px-4 bg-emerald-500 text-white text-center rounded transition-colors hover:bg-emerald-600"
          :href="`${resource.filePath}`" 
          :download="`${resource.name}.${resource.type.toLowerCase()}`"
          @click="handleDownload(resource)"
        >
          下载
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  resources: {
    type: Array,
    required: true
  }
})

const handleDownload = (resource) => {
  // 更新本地下载计数
  resource.downloads++
  // 这里可以添加其他逻辑，如发送统计信息等
  console.log(`Downloading ${resource.name}`)
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}
</script>

<style scoped>
/* 移动端标签显示 */
@media (max-width: 768px) {
  .resource-item > span::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 0.5rem;
    color: #666;
    display: inline;
  }
}
</style>