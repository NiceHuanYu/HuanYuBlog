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
                <button class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                  重置
                </button>
                <button class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                  应用
                </button>
              </div>
            </div>

            <!-- 内容区域 -->
            <div class="space-y-6">
              <div v-for="(item, index) in selectedSecondary.items" :key="index" class="bg-gray-750 rounded-md p-4">
                <h3 class="font-semibold mb-2 text-gray-300">{{ item.name }}</h3>
                <p class="text-sm text-gray-500 mb-3">{{ item.description }}</p>
                
                <!-- 组件编辑区域 -->
                <div class="mt-3">
                  <!-- 布尔型编辑 -->
                  <div v-if="selectedPrimary === '布尔型'" class="flex items-center space-x-3">
                    <div class="relative inline-block w-12 h-6">
                      <input type="checkbox" class="opacity-0 w-0 h-0 peer" :id="`toggle-${index}`">
                      <label 
                        :for="`toggle-${index}`" 
                        class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-600 rounded-full transition duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-gray-300 before:rounded-full before:transition before:duration-300 peer-checked:bg-green-600 peer-checked:before:translate-x-6"
                      ></label>
                    </div>
                    <label :for="`toggle-${index}`" class="cursor-pointer text-sm">启用/禁用</label>
                  </div>
                  
                  <!-- 单一数据型编辑 -->
                  <div v-else-if="selectedPrimary === '单一数据变量型'" class="space-y-2">
                    <input 
                      type="text" 
                      :placeholder="`输入 ${item.name} 值`" 
                      class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500">示例值: {{ item.example }}</p>
                  </div>
                  
                  <!-- 复杂型编辑 -->
                  <div v-else class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm mb-1">参数名称</label>
                        <input 
                          type="text" 
                          class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                      </div>
                      <div>
                        <label class="block text-sm mb-1">参数类型</label>
                        <select class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option>布尔值</option>
                          <option>整数</option>
                          <option>浮点数</option>
                          <option>字符串</option>
                          <option>对象</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm mb-1">JSON 配置</label>
                      <textarea 
                        class="w-full h-32 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="输入 JSON 配置..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      primaryCategories: ['布尔型', '单一数据变量型', '复杂型'],
      selectedPrimary: null,
      selectedSecondary: null,
      secondaryCategories: {
        '布尔型': [
          {
            name: '核心物品行为 (Core Item Behavior)',
            description: '控制物品最基本的功能、交互和显示规则',
            items: [
              {name: 'blocks_attacks', description: '物品用于格挡时的核心行为'},
              {name: 'can_always_eat', description: '物品在非饥饿状态下的核心食用行为'},
              {name: 'enchantment_glint_override', description: '核心视觉效果开关 (光效)'},
              {name: 'has_consume_particles', description: '物品使用时的核心视觉反馈 (粒子)'},
              {name: 'intangible_projectile', description: '投射物实体的核心拾取规则'},
              {name: 'resolved', description: '成书实体的核心状态'},
              {name: 'swappable', description: '装备的核心交互规则'},
              {name: 'unbreakable', description: '物品耐久度机制的核心开关'},
            ]
          },
          {
            name: '创造模式/调试专用 (Creative/Debug Specific)',
            description: '控制创造模式或调试相关的特殊状态',
            items: [
              {name: 'creative_slot_lock', description: '创造模式物品栏管理'},
              {name: 'debug_stick_state', description: '调试棒的核心功能状态'},
            ]
          },
          {
            name: '实体相关属性 (Entity-Related Properties)',
            description: '影响物品关联的生物实体的行为或表现',
            items: [
              {name: 'no_ai', description: '生物实体的 AI 核心开关'},
              {name: 'no_gravity', description: '生物实体的物理核心规则'},
              {name: 'silent', description: '生物实体的核心声音开关'},
            ]
          },
          {
            name: '视觉特效 (Visual Effects)',
            description: '控制额外的视觉效果',
            items: [
              {name: 'glider', description: '滑翔翼功能开关 (同时也控制滑翔动作)'},
              {name: 'has_trail', description: '烟火飞行时的视觉轨迹'},
              {name: 'has_twinkle', description: '烟火爆炸时的视觉闪烁效果'},
            ]
          }
        ],
        '单一数据变量型': [
          {
            name: '外观 - 实体变种 (Appearance - Mob Variant)',
            items: [
              {name: 'axolotl/variant', description: '美西螈变种', example: 'wild'},
              {name: 'cow/variant', description: '牛变种', example: 'default'},
              {name: 'fox/variant', description: '狐狸变种', example: 'red'},
              {name: 'frog/variant', description: '青蛙变种', example: 'temperate'},
              {name: 'horse/variant', description: '马变种', example: 'black'},
            ]
          },
          {
            name: '外观 - 颜色/染色 (Appearance - Color/Dye)',
            items: [
              {name: 'base_color', description: '盾牌基础颜色', example: '#FF5733'},
              {name: 'cat/collar', description: '猫项圈颜色', example: 'red'},
              {name: 'map_color', description: '地图物品颜色', example: '0xFF0000'},
            ]
          },
          {
            name: '基本属性 - 功能/识别 (Basic Attributes - Function/Identification)',
            items: [
              {name: 'map_id', description: '地图物品的核心唯一标识符', example: 'map_12345'},
            ]
          },
          {
            name: '基本属性 - 耐用性 (Basic Attributes - Durability)',
            items: [
              {name: 'damage', description: '当前耐久值', example: '32'},
              {name: 'max_damage', description: '最大耐久值上限', example: '256'},
            ]
          }
        ],
        '复杂型': [
          {
            name: '属性修改 (Attribute Modifiers)',
            description: '直接改变玩家或实体的属性',
            items: [
              {name: 'attribute_modifiers', description: '对持有者/穿戴者的属性加成/削弱'}
            ]
          },
          {
            name: '容器与内容 (Containers & Contents)',
            description: '管理物品所包含的其他物品',
            items: [
              {name: 'bundle_contents', description: '收纳袋的物品列表'},
              {name: 'container', description: '容器方块物品的内部物品数据'},
            ]
          },
          {
            name: '消耗品效果 (Consumable Effects)',
            description: '定义食物、药水、迷之炖菜等物品的具体效果',
            items: [
              {name: 'consumable', description: '消耗后触发的效果集合'},
              {name: 'potion_contents', description: '药水的状态效果列表、颜色等'},
            ]
          },
          {
            name: '外观定制 - 高级 (Appearance Customization - Advanced)',
            description: '复杂的模型、渲染、纹饰控制',
            items: [
              {name: 'dyed_color', description: '染色皮革盔甲的精确 RGB 颜色值'},
              {name: 'item_model', description: '定义复杂的物品模型映射'},
            ]
          }
        ]
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