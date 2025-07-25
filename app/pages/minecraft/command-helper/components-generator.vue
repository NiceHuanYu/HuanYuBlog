<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: Object,
  components: Object
})

// 处理不同类型数据组件的格式化
const formatComponentValue = (key, value) => {
  switch(key) {
    case 'enchantments':
      // 处理附魔组件 格式: {id:"enchantment",lvl:1}
      return `{${value.map(e => `{id:"${e.id}",lvl:${e.level}}`).join(',')}}`
    
    case 'attribute_modifiers':
      // 处理属性修饰符
      return `[${value.map(a => (
        `{AttributeName:"${a.name}",` +
        `Name:"${a.name}",` +
        `Amount:${a.amount},` +
        `Operation:${a.operation},` +
        `UUID:[I;${a.uuid.join(',')}],` +
        `Slot:"${a.slot}"}`
      )).join(',')}]`
    
    case 'display':
      // 处理显示属性
      const display = {}
      if(value.name) display.Name = `'{"text":"${value.name}"}'`
      if(value.lore) display.Lore = `[${value.lore.map(l => `'{"text":"${l}"}'`).join(',')}]`
      if(value.color) display.color = value.color
      return JSON.stringify(display)
    
    case 'custom_model_data':
      return value.toString()
      
    case 'unbreakable':
    case 'fire_resistant':
    case 'hide_tooltip':
      return value ? '1b' : '0b'
      
    default:
      return typeof value === 'object' ? JSON.stringify(value) : value
  }
}

const outputCommand = computed(() => {
  if (!props.item) return ''
  
  // 构建数据组件部分 
  const componentsStr = Object.entries(props.components)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${formatComponentValue(key, value)}`)
    .join(',')
  
  // 返回多种格式
  return {
    dataComponent: componentsStr ? `{${componentsStr}}` : '',
    giveCommand: `/give @p ${props.item.id}${componentsStr ? ` {${componentsStr}}` : ''} 1`,
    executeCommand: `/execute as @p run give @s ${props.item.id}${componentsStr ? ` {${componentsStr}}` : ''} 1`,
    summonCommand: `/summon item ~ ~1 ~ {Item:{id:"${props.item.id}",Count:1b${componentsStr ? `,tag:{${componentsStr}}` : ''}}}`
  }
})

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="output-panel">
    <h3>生成结果</h3>
    
    <div class="output-section">
      <h4>数据组件 (NBT)</h4>
      <pre class="code-block">{{ outputCommand.dataComponent || '无数据组件' }}</pre>
      <button @click="copyToClipboard(outputCommand.dataComponent)" class="copy-btn">
        <span class="btn-text">复制 NBT</span>
      </button>
    </div>
    
    <div class="output-section">
      <h4>Give 指令</h4>
      <pre class="code-block">{{ outputCommand.giveCommand }}</pre>
      <button @click="copyToClipboard(outputCommand.giveCommand)" class="copy-btn">
        <span class="btn-text">复制指令</span>
      </button>
    </div>
    
    <div class="output-section">
      <h4>Execute 指令</h4>
      <pre class="code-block">{{ outputCommand.executeCommand }}</pre>
      <button @click="copyToClipboard(outputCommand.executeCommand)" class="copy-btn">
        <span class="btn-text">复制指令</span>
      </button>
    </div>

    <div class="output-section">
      <h4>Summon 指令</h4>
      <pre class="code-block">{{ outputCommand.summonCommand }}</pre>
      <button @click="copyToClipboard(outputCommand.summonCommand)" class="copy-btn">
        <span class="btn-text">复制指令</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.output-panel {
  grid-column: 1 / -1;
  margin-top: 30px;
  border-top: 2px solid #4CAF50;
  padding-top: 20px;
}

.output-section {
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.output-section h4 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.1em;
}

.code-block {
  background: #2c3e50;
  color: #fff;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  margin: 10px 0;
}

.copy-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background: #45a049;
}

.btn-text {
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .code-block {
    font-size: 0.9em;
  }
  
  .copy-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>