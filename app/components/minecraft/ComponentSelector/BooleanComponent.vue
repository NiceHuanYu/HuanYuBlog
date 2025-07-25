<script setup>
const props = defineProps(['item'])
const emit = defineEmits(['update'])

const booleanComponents = [
  { id: 'unbreakable', name: '无法破坏', description: '物品不会损失耐久' },
  { id: 'fire_resistant', name: '防火', description: '物品不会被火或熔岩烧毁' },
  { id: 'hide_tooltip', name: '隐藏提示', description: '不显示物品提示框' },
  // 其他布尔型组件...
]

const toggleComponent = (componentId, value) => {
  emit('update', componentId, value ? {} : undefined)
}
</script>

<template>
  <div class="component-section">
    <h3>开关型组件</h3>
    <div class="boolean-grid">
      <div 
        v-for="comp in booleanComponents" 
        :key="comp.id"
        class="boolean-item"
      >
        <label>
          <input 
            type="checkbox" 
            @change="toggleComponent(comp.id, $event.target.checked)"
          />
          <span class="component-name">{{ comp.name }}</span>
          <span class="component-desc">{{ comp.desc }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boolean-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.boolean-item {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.component-name {
  font-weight: bold;
  margin-left: 5px;
}

.component-desc {
  display: block;
  font-size: 0.8em;
  color: #666;
  margin-top: 5px;
}
</style>