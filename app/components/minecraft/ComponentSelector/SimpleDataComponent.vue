<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['item'])
const emit = defineEmits(['update'])

const simpleComponents = {
  damage: {
    name: '损坏值',
    type: 'number',
    min: 0,
    max: 1000,
    step: 1
  },
  max_damage: {
    name: '最大耐久',
    type: 'number',
    min: 1,
    max: 10000,
    step: 1
  },
  custom_model_data: {
    name: '自定义模型数据',
    type: 'number',
    min: 0,
    step: 1
  },
  // 其他简单组件...
}

const componentValues = ref({})

function updateValue(componentId, value) {
  componentValues.value[componentId] = value
  emit('update', componentId, value)
}

// 根据物品类型过滤可用的简单组件
const availableComponents = computed(() => {
  const filtered = {}
  
  for (const [id, config] of Object.entries(simpleComponents)) {
    // 这里可以添加特定物品的过滤逻辑
    filtered[id] = config
  }
  
  return filtered
})
</script>

<template>
  <div class="component-section">
    <h3>简单数据组件</h3>
    <div class="simple-components">
      <div 
        v-for="([id, config], index) in Object.entries(availableComponents)" 
        :key="index"
        class="form-group"
      >
        <label :for="id">{{ config.name }}</label>
        <input
          :id="id"
          v-model="componentValues[id]"
          :type="config.type"
          :min="config.min"
          :max="config.max"
          :step="config.step"
          @input="updateValue(id, $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.simple-components {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>