<template>
  <div class="minecraft-item-selector">
    <!-- 简单模式 -->
    <div v-if="mode === 'simple'" class="simple-mode">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="search-input"
      />
      <div class="items-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item"
          :class="{ selected: selectedItems.some(i => i.id === item.id) }"
          @click="toggleItem(item)"
        >
          <span class="item-name">{{ item.name }}</span>
          <span class="item-id">{{ item.id }}</span>
        </div>
      </div>
    </div>
    
    <!-- 复杂模式 -->
    <div v-else class="complex-mode">
      <div class="controls">
        <select v-model="selectedCategory" class="category-select">
          <option value="all">所有分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          class="search-input"
        />
      </div>
      <div class="items-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item"
          :class="{ selected: selectedItems.some(i => i.id === item.id) }"
          @click="toggleItem(item)"
        >
          <span class="item-name">{{ item.name }}</span>
          <span class="item-id">{{ item.id }}</span>
        </div>
      </div>
      <div v-if="multiple" class="selected-items">
        <h4>已选择:</h4>
        <div v-for="item in selectedItems" :key="item.id" class="selected-item">
          {{ item.name }}
          <button @click="toggleItem(item)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'simple', // 'simple' 或 'complex'
    validator: value => ['simple', 'complex'].includes(value)
  },
  multiple: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => ['all', 'tools', 'weapons', 'armor', 'food', 'materials', 'transport', 'misc']
  },
  placeholder: {
    type: String,
    default: '搜索 Minecraft 物品...'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 这里可以导入您提供的物品数据
import { minecraftItems } from '@/data/MinecraftItem'
const items = ref(minecraftItems)

const selectedItems = ref([])
const searchQuery = ref('')
const selectedCategory = ref('all')

// 根据模式过滤物品
const filteredItems = computed(() => {
  let result = [...items.value]
  
  // 分类过滤
  if (selectedCategory.value !== 'all') {
    result = result.filter(item => item.category === selectedCategory.value)
  }
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.id.toLowerCase().includes(query)
    )
  }
  
  return result
})

function toggleItem(item) {
  if (props.multiple) {
    const index = selectedItems.value.findIndex(i => i.id === item.id)
    if (index === -1) {
      selectedItems.value.push(item)
    } else {
      selectedItems.value.splice(index, 1)
    }
  } else {
    selectedItems.value = [item]
  }
  emit('update:modelValue', props.multiple ? selectedItems.value : selectedItems.value[0])
  emit('change', props.multiple ? selectedItems.value : selectedItems.value[0])
}
</script>


<style scoped>
.minecraft-item-selector {
  font-family: 'Minecraft', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  border: 2px solid #8b8b8b;
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 10px;
}

.search-input, .category-select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 2px solid #8b8b8b;
  background-color: white;
}

.controls {
  display: flex;
  gap: 10px;
}

.controls .search-input {
  flex: 3;
}

.controls .category-select {
  flex: 1;
}

.items-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: white;
}

.item {
  padding: 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.item:hover {
  background-color: #f5f5f5;
}

.item.selected {
  background-color: #d4e6ff;
}

.item-id {
  color: #666;
  font-size: 0.8em;
}

.selected-items {
  margin-top: 10px;
  padding: 10px;
  background-color: #e8e8e8;
  border-radius: 4px;
}

.selected-item {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  background-color: white;
  border-radius: 3px;
}

.selected-item button {
  margin-left: 5px;
  cursor: pointer;
  background: none;
  border: none;
}
</style>

