<template>
  <div class="resource-list">
    <div class="resource-header">
      <span class="header-name">资源名称</span>
      <span class="header-type">类型</span>
      <span class="header-size">大小</span>
      <span class="header-downloads">下载量</span>
      <span class="header-updated">更新时间</span>
    </div>
    
    <div class="resource-items">
      <div v-for="resource in resources" :key="resource.id" class="resource-item">
        <span class="resource-name">{{ resource.name }}</span>
        <span class="resource-type">{{ resource.type }}</span>
        <span class="resource-size">{{ resource.size }}</span>
        <span class="resource-downloads">{{ resource.downloads.toLocaleString() }}</span>
        <span class="resource-updated">{{ formatDate(resource.updated) }}</span>
        <button class="download-button" @click="downloadResource(resource.id)">下载</button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { minecraftResources } from '@/data/MinecraftResources'

const props = defineProps({
  resources: {
    type: Array,
    required: true
  }
})

const downloadResource = async (id) => {
  try {
    const response = await $fetch(`/api/download?id=${id}`, {
      method: 'GET',
      responseType: 'blob'
    })
    
    const resource = props.resources.find(r => r.id === id)
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${resource.name}.${resource.type.toLowerCase()}`) // 设置下载文件名和类型
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    // 更新本地下载计数
    resource.downloads++
  } catch (error) {
    console.error('Download failed:', error)
    alert('下载失败，请稍后再试')
  }
}


const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}
</script>

<style scoped>
.resource-list {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.resource-header,
.resource-item {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
}

.resource-header {
  background-color: #2c3e50;
  color: white;
  font-weight: bold;
}

.resource-item {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.resource-item:last-child {
  border-bottom: none;
}

.resource-item:hover {
  background-color: #f9f9f9;
}

.download-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.download-button:hover {
  background-color: #3aa876;
}

@media (max-width: 768px) {
  .resource-header {
    display: none;
  }
  
  .resource-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .resource-item > span::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 0.5rem;
    color: #666;
  }
  
  .download-button {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>