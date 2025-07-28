<template>
  <div>
    <h1>文件下载</h1>
    <ul>
      <li>
        <a href="/downloads/minecraft/sample.pdf" download>下载示例文件</a>
      </li>
      <!-- 或者使用动态方式 -->
      <li v-for="file in files" :key="file.name">
        <a :href="`/downloads/minecraft/${file.name}`" :download="file.name">
          下载 {{ file.displayName }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      files: [
        { name: 'sample.pdf', displayName: '示例PDF文件' },
        { name: 'guide.docx', displayName: '使用指南' }
      ]
    }
  }
}
</script>