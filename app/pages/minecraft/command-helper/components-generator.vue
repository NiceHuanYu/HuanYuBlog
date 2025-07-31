<template>
  <div class="min-h-screen flex flex-col bg-gray-900 text-gray-200">
    <!-- 页眉 -->
    <header class="bg-gray-800 border-b border-gray-700 py-4 px-6">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center">
          <div class="bg-gray-700 border-2 border-gray-600 w-10 h-10 rounded-md mr-3 flex items-center justify-center">
            <span class="text-green-400 font-bold">MC</span>
          </div>
          <h1 class="text-2xl font-bold text-green-400">Minecraft 数据组件编辑器</h1>
        </div>
        <div class="flex items-center">
          <button class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors mr-3">
            保存配置
          </button>
          <button class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors">
            导出数据
          </button>
        </div>
      </div>
    </header>

    <!-- 一级分类导航 -->
    <nav class="bg-gray-800 border-b border-gray-700 py-2">
      <div class="container mx-auto flex space-x-1">
        <button 
          v-for="(category, index) in primaryCategories" 
          :key="index"
          @click="selectPrimaryCategory(category)"
          :class="{
            'bg-green-700 text-white': selectedPrimary === category,
            'hover:bg-gray-700': selectedPrimary !== category
          }"
          class="px-6 py-3 rounded-t-md transition-colors duration-200 font-medium"
        >
          {{ category }}
        </button>
      </div>
    </nav>

    <main class="flex flex-1 overflow-hidden">
      <!-- 二级分类侧边栏 -->
      <aside class="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-3 text-gray-400">二级分类</h2>
          
          <template v-if="selectedPrimary">
            <div 
              v-for="(subCategory, index) in currentSecondaryCategories" 
              :key="index"
              @click="selectSecondaryCategory(subCategory)"
              :class="{
                'bg-green-700 text-white': selectedSecondary === subCategory,
                'hover:bg-gray-700': selectedSecondary !== subCategory
              }"
              class="px-4 py-2 rounded-md mb-2 cursor-pointer transition-colors duration-150"
            >
              {{ subCategory.name }}
            </div>
          </template>
          
          <div v-else class="text-gray-500 text-center py-8">
            请先选择一级分类
          </div>
        </div>
      </aside>

      <!-- 内容区域 -->
      <section class="flex-1 overflow-y-auto bg-gray-850">
        <div class="p-6">
          <div v-if="selectedPrimary && selectedSecondary" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">
                {{ selectedPrimary }} > {{ selectedSecondary.name }}
              </h2>
              <div class="flex space-x-2">
                <button @click="resetSelectedItems" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                  重置
                </button>
                <button @click="applyChanges" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                  应用
                </button>
              </div>
            </div>

            <!-- 内容区域 - 修改为卡片选择模式 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="(item, index) in selectedSecondary.items" 
                :key="index"
                @click="handleCardClick(item, $event)"
                :class="{
                  'border-green-500 bg-gray-750': item.selected,
                  'border-gray-700 bg-gray-800': !item.selected,
                  'cursor-pointer': true
                }"
                class="rounded-md border p-4 transition-all duration-200 hover:bg-gray-750"
              >
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      :checked="item.selected"
                      class="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      @click.stop="toggleItemSelection(item)"
                    >
                  </div>
                  <div class="ml-3">
                    <h3 class="font-semibold mb-1 text-gray-300">{{ item.name }}</h3>
                    <p class="text-sm text-gray-500">{{ item.description }}</p>
                    
                    <!-- 示例值（仅单一数据型显示） -->
                    <p v-if="selectedPrimary === '单一数据变量型' && item.example" class="text-xs text-gray-500 mt-1">
                      示例值: {{ item.example }}
                    </p>
                  </div>
                </div>

                <!-- 编辑区域 - 只在选中时显示 -->
                <div v-if="item.selected" class="mt-4 pt-4 border-t border-gray-700">
                  <!-- 布尔型编辑 -->
                  <div v-if="selectedPrimary === '布尔型'" class="flex items-center space-x-3">
                    <div class="relative inline-block w-12 h-6">
                      <input 
                        type="checkbox" 
                        v-model="item.value"
                        class="opacity-0 w-0 h-0 peer" 
                        :id="`toggle-${item.name}-${index}`"
                        @click.stop
                      >
                      <label 
                        :for="`toggle-${item.name}-${index}`" 
                        class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-600 rounded-full transition duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-gray-300 before:rounded-full before:transition before:duration-300 peer-checked:bg-green-600 peer-checked:before:translate-x-6"
                      ></label>
                    </div>
                    <label :for="`toggle-${item.name}-${index}`" class="cursor-pointer text-sm">
                      {{ item.value ? '已启用' : '已禁用' }}
                    </label>
                  </div>
                  
                  <!-- 单一数据型编辑 -->
                  <div v-else-if="selectedPrimary === '单一数据变量型'" class="space-y-2">
                    <input 
                      type="text" 
                      v-model="item.value"
                      :placeholder="`输入 ${item.name} 值`" 
                      class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      @click.stop
                    >
                  </div>
                  
                  <!-- 复杂型编辑 -->
                  <div v-else class="space-y-4">
                    <button 
                      @click.stop="openComplexEditor(item)"
                      class="w-full py-2 px-4 bg-green-700 hover:bg-green-600 rounded-md transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947z" clip-rule="evenodd" />
                      </svg>
                      打开编辑器
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 未选择分类时的提示 -->
          <div v-else class="flex items-center justify-center h-full py-20">
            <div class="text-center">
              <div class="bg-gray-800 border border-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 class="text-xl font-medium text-gray-400 mb-2">选择分类</h3>
              <p class="text-gray-600 max-w-md mx-auto">
                请从左侧选择一级分类和二级分类以开始编辑数据组件。
                您可以选择布尔型、单一数据变量型或复杂型配置。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-800 border-t border-gray-700 py-4 px-6">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Minecraft 数据组件编辑器 v1.0.0
        </div>
        <div class="text-sm text-gray-500">
          © 2023 Minecraft Modding Studio
        </div>
      </div>
    </footer>

    <!-- 复杂配置编辑器模态框 -->
    <div v-if="showComplexEditor" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-xl font-bold">
            编辑 {{ currentComplexItem?.name }}
          </h3>
          <button @click="closeComplexEditor" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm mb-1 text-gray-400">参数名称</label>
              <input 
                type="text" 
                :value="currentComplexItem?.name"
                class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled
              >
            </div>
            <div>
              <label class="block text-sm mb-1 text-gray-400">参数类型</label>
              <select v-model="complexEditorType" class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>对象</option>
                <option>数组</option>
                <option>布尔值</option>
                <option>整数</option>
                <option>浮点数</option>
                <option>字符串</option>
              </select>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm mb-1 text-gray-400">JSON 配置</label>
            <textarea 
              v-model="complexEditorContent"
              class="w-full h-64 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="输入 JSON 配置..."
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-2">
            <button @click="closeComplexEditor" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
              取消
            </button>
            <button @click="saveComplexEditor" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//导入外部数据
import componentData from '@/data/componentData.js';
export default {
  data() {
    return {
      primaryCategories: ['布尔型', '单一数据变量型', '复杂型'],
      selectedPrimary: null,
      selectedSecondary: null,
      showComplexEditor: false,
      currentComplexItem: null,
      complexEditorContent: '',
      complexEditorType: '对象',
      // 使用导入的数据
      secondaryCategories: {
        '布尔型': componentData.bool,
        '单一数据变量型': componentData.single,
        '复杂型': componentData.complex
      }
    };
  },
  computed: {
    currentSecondaryCategories() {
      return this.selectedPrimary ? this.secondaryCategories[this.selectedPrimary] : [];
    }
  },
  methods: {
    selectPrimaryCategory(category) {
      this.selectedPrimary = category;
      this.selectedSecondary = null;
    },
    selectSecondaryCategory(subCategory) {
      this.selectedSecondary = subCategory;
    },
    
    // 修复后的卡片点击处理
    handleCardClick(item, event) {
      // 如果点击的是开关或输入框，则不切换选中状态
      if (event.target.type === 'checkbox' || event.target.tagName === 'LABEL') {
        return;
      }
      this.toggleItemSelection(item);
    },
    
    // 切换项目选择状态
    toggleItemSelection(item) {
      item.selected = !item.selected;
      
      // 为复杂类型设置默认值
      if (item.selected && this.selectedPrimary === '复杂型' && !item.value) {
        if (item.name === 'dyed_color') {
          item.value = '#FFFFFF';
        } else if (item.name.includes('enchantments') || item.name.includes('banner_patterns')) {
          item.value = [];
        } else {
          item.value = {};
        }
      }
    },
    
    // 打开复杂配置编辑器
    openComplexEditor(item) {
      this.currentComplexItem = item;
      try {
        // 尝试将值转换为JSON字符串
        this.complexEditorContent = JSON.stringify(item.value, null, 2);
      } catch (e) {
        // 如果转换失败，使用空对象
        this.complexEditorContent = '{}';
      }
      this.showComplexEditor = true;
    },
    
    // 关闭复杂配置编辑器
    closeComplexEditor() {
      this.showComplexEditor = false;
      this.currentComplexItem = null;
      this.complexEditorContent = '';
    },
    
    // 保存复杂配置
    saveComplexEditor() {
      try {
        if (this.currentComplexItem) {
          // 解析JSON内容
          this.currentComplexItem.value = JSON.parse(this.complexEditorContent);
          this.closeComplexEditor();
        }
      } catch (e) {
        console.error('JSON解析错误', e);
        alert('JSON格式错误，请检查输入');
      }
    },
    
    // 重置选中的项目
    resetSelectedItems() {
      if (this.selectedSecondary && this.selectedSecondary.items) {
        this.selectedSecondary.items.forEach(item => {
          if (item.selected) {
            item.selected = false;
            // 重置值到初始状态
            if (this.selectedPrimary === '布尔型') {
              item.value = false;
            } else if (this.selectedPrimary === '单一数据变量型') {
              item.value = '';
            } else {
              // 复杂型重置为默认值
              if (item.name === 'dyed_color') {
                item.value = '#FFFFFF';
              } else if (item.name.includes('enchantments') || item.name.includes('banner_patterns')) {
                item.value = [];
              } else {
                item.value = {};
              }
            }
          }
        });
      }
    },
    
    // 应用更改
    applyChanges() {
      // 在实际应用中，这里会处理应用逻辑
      alert('配置已应用！');
    }
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #111827;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>