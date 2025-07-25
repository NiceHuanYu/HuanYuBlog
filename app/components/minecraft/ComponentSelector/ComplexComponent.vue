<script setup>
import { ref } from 'vue'

const props = defineProps(['item'])
const emit = defineEmits(['update'])

const complexComponents = [
  {
    id: 'enchantments',
    name: '附魔',
    description: '添加物品附魔效果',
    component: 'EnchantmentEditor' // 可以拆分为单独组件
  },
  {
    id: 'attribute_modifiers',
    name: '属性修饰符',
    description: '修改持有者属性',
    component: 'AttributeEditor' // 可以拆分为单独组件
  },
  {
    id: 'lore',
    name: '物品描述',
    description: '添加物品提示框描述',
    component: 'LoreEditor' // 可以拆分为单独组件
  },
  // 其他复杂组件...
]

const activeComponent = ref(null)

function openComponentEditor(componentId) {
  activeComponent.value = componentId
}

function saveComponentData(componentId, data) {
  emit('update', componentId, data)
  activeComponent.value = null
}
</script>

<template>
  <div class="component-section">
    <h3>复杂数据组件</h3>
    <div class="complex-grid">
      <div 
        v-for="comp in complexComponents" 
        :key="comp.id"
        class="complex-item"
        @click="openComponentEditor(comp.id)"
      >
        <div class="component-name">{{ comp.name }}</div>
        <div class="component-desc">{{ comp.description }}</div>
      </div>
    </div>
    
    <!-- 复杂组件编辑器模态框 -->
    <div v-if="activeComponent" class="component-modal">
      <div class="modal-content">
        <h4>{{ complexComponents.find(c => c.id === activeComponent).name }}</h4>
        
        <!-- 这里可以根据activeComponent渲染不同的编辑器 -->
        <div v-if="activeComponent === 'enchantments'">
          <!-- 附魔编辑器内容 -->
        </div>
        
        <div v-if="activeComponent === 'attribute_modifiers'">
          <!-- 属性修饰符编辑器内容 -->
        </div>
        
        <div v-if="activeComponent === 'lore'">
          <!-- Lore编辑器内容 -->
        </div>
        
        <div class="modal-actions">
          <button @click="activeComponent = null">取消</button>
          <button @click="saveComponentData(activeComponent, {})">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.complex-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.complex-item {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.complex-item:hover {
  background: #e0e0e0;
}

.component-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>