<script setup>
import MinecraftItemSelector from '@/components/minecraft/MinecraftItemSelector.vue'

const simpleSelectedItem = ref(null)
const complexSelectedItems = ref([])
</script>

<template>
  <div>
    <h2>简单选择器 (单选)</h2>
    <MinecraftItemSelector 
      mode="simple" 
      v-model="simpleSelectedItem"
    />
    <p>已选择: {{ simpleSelectedItem?.name || '无' }}</p>
    
    <h2>复杂选择器 (多选)</h2>
    <MinecraftItemSelector 
      mode="complex" 
      :multiple="true"
      v-model="complexSelectedItems"
    />
    <p>已选择: {{ complexSelectedItems.map(i => i.name).join(', ') || '无' }}</p>
  </div>
</template>