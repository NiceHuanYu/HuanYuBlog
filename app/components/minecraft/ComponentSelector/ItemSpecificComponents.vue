<script setup>
import { computed } from 'vue'

const props = defineProps(['item'])
const emit = defineEmits(['update'])

// 根据物品ID返回特定组件
const specificComponents = computed(() => {
  const itemId = props.item?.id
  
  if (!itemId) return []
  
  // 地图特定组件
  if (itemId.includes('map')) {
    return [
      {
        id: 'map_id',
        name: '地图编号',
        type: 'number',
        description: '设置地图的唯一编号'
      },
      {
        id: 'map_color',
        name: '地图颜色',
        type: 'color',
        description: '设置地图的显示颜色'
      }
    ]
  }
  
  // 盾牌特定组件
  if (itemId.includes('shield')) {
    return [
      {
        id: 'base_color',
        name: '盾牌基色',
        type: 'color',
        description: '设置盾牌的基础颜色'
      }
    ]
  }
  
  // 其他物品特定组件...
  
  return []
})

function updateSpecificComponent(componentId, value) {
  emit('update', componentId, value)
}
</script>

<template>
  <div v-if="specificComponents.length > 0" class="component-section">
    <h3>物品特定组件</h3>
    <div class="specific-grid">
      <div 
        v-for="comp in specificComponents" 
        :key="comp.id"
        class="specific-item"
      >
        <label :for="comp.id">{{ comp.name }}</label>
        <div class="component-desc">{{ comp.description }}</div>
        
        <input
          v-if="comp.type === 'number'"
          :id="comp.id"
          type="number"
          @input="updateSpecificComponent(comp.id, $event.target.value)"
        />
        
        <input
          v-if="comp.type === 'color'"
          :id="comp.id"
          type="color"
          @input="updateSpecificComponent(comp.id, $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.specific-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.specific-item {
  padding: 15px;
  background: #f0f8ff;
  border-radius: 4px;
}
</style>