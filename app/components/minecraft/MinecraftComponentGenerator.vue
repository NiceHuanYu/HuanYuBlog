<script setup>
import { ref, computed } from 'vue'
import ItemSelector from '@/components/MinecraftItemSelector.vue'
import BooleanComponent from '@/components/ComponentSelector/BooleanComponent.vue'
import SimpleDataComponent from '@/components/ComponentSelector/SimpleDataComponent.vue'
import ComplexComponent from '@/components/ComponentSelector/ComplexComponent.vue'
import ItemSpecificComponents from '@/components/ComponentSelector/ItemSpecificComponents.vue'
import OutputPanel from '@/components/OutputPanel.vue'

// 物品数据
const selectedItem = ref(null)
const componentsData = ref({})

// 根据选择的物品显示特定组件
const showSpecificComponents = computed(() => {
  if (!selectedItem.value) return false
  const itemId = selectedItem.value.id
  
  // 判断是否为特定物品类型
  return [
    'minecraft:map', 
    'minecraft:filled_map',
    'minecraft:shield',
    'minecraft:written_book',
    // 其他需要特定组件的物品...
  ].includes(itemId)
})

function handleItemSelected(item) {
  selectedItem.value = item
  // 重置组件数据
  componentsData.value = {}
}

function updateComponentData(componentName, data) {
  componentsData.value[componentName] = data
}

// 生成最终数据组件
const generatedComponents = computed(() => {
  return {
    ...componentsData.value,
    // 可以在这里添加一些全局处理
  }
})
</script>

<template>
  <div class="component-generator">
    <div class="item-selection">
      <h2>1. 选择物品</h2>
      <ItemSelector @update:modelValue="handleItemSelected" />
    </div>
    
    <div v-if="selectedItem" class="component-sections">
      <h2>2. 配置数据组件</h2>
      
      <!-- 布尔型组件 -->
      <BooleanComponent 
        :item="selectedItem"
        @update="updateComponentData"
      />
      
      <!-- 简单数据组件 -->
      <SimpleDataComponent 
        :item="selectedItem"
        @update="updateComponentData"
      />
      
      <!-- 复杂组件 -->
      <ComplexComponent 
        :item="selectedItem"
        @update="updateComponentData"
      />
      
      <!-- 物品特定组件 (仅当选择特定物品时显示) -->
      <ItemSpecificComponents 
        v-if="showSpecificComponents"
        :item="selectedItem"
        @update="updateComponentData"
      />
    </div>
    
    <!-- 输出面板 -->
    <OutputPanel 
      v-if="selectedItem"
      :item="selectedItem"
      :components="generatedComponents"
    />
  </div>
</template>

<style scoped>
.component-generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.item-selection {
  grid-column: 1;
}

.component-sections {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h2 {
  color: #4CAF50;
  margin-bottom: 10px;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 5px;
}
</style>