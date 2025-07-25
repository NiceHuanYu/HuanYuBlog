<template>
  <div class="deepseek-code-block" :class="`language-${language}`">
    <div class="code-header">
      <span class="language-tag">{{ languageDisplay }}</span>
      <button class="copy-button" @click="copyCode">
        <svg class="copy-icon" viewBox="0 0 24 24">
          <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
        </svg>
        <span class="copy-text">复制</span>
      </button>
    </div>
    <pre ref="preElement"><code ref="codeElement" :class="`language-${language}`">{{ rawCode }}</code></pre>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  },
  code: {
    type: String,
    required: true
  }
})

const preElement = ref(null)
const codeElement = ref(null)

// 处理语言显示名称
const languageDisplay = computed(() => {
  const langMap = {
    html: 'HTML',
    javascript: 'JavaScript',
    bash: 'Bash',
    // 添加其他语言映射
  }
  return langMap[props.language] || props.language
})

// 处理原始代码，确保换行和缩进
const rawCode = computed(() => {
  // 移除首尾空白
  let code = props.code.trim()
  // 统一换行符
  code = code.replace(/\r\n/g, '\n')
  return code
})

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    const btn = document.querySelector('.copy-button')
    if (btn) {
      const originalText = btn.querySelector('.copy-text').textContent
      btn.querySelector('.copy-text').textContent = '已复制!'
      setTimeout(() => {
        btn.querySelector('.copy-text').textContent = originalText
      }, 2000)
    }
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 高亮代码
onMounted(() => {
  // 动态导入所需的Prism语言组件
  const importLanguage = async () => {
    try {
      switch (props.language) {
        case 'html':
          await import('prismjs/components/prism-markup')
          break
        case 'javascript':
          await import('prismjs/components/prism-javascript')
          break
        case 'bash':
          await import('prismjs/components/prism-bash')
          break
        // 添加其他语言支持
        default:
          await import('prismjs/components/prism-javascript')
      }
      
      // 手动高亮代码
      if (window.Prism) {
        window.Prism.highlightElement(codeElement.value)
      }
    } catch (error) {
      console.error('加载语言组件失败:', error)
    }
  }

  importLanguage()
})
</script>

<style scoped>
.deepseek-code-block {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 8px;
  background-color: #1e1e1e;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #252526;
  border-bottom: 1px solid #2d2d2d;
}

.language-tag {
  font-size: 0.85rem;
  color: #9cdcfe;
  text-transform: uppercase;
  font-family: 'Fira Code', monospace;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #d4d4d4;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.copy-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.copy-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #d4d4d4;
  font-family: 'Fira Code', 'Courier New', monospace;
  white-space: pre;
  tab-size: 2;
}

code {
  display: block;
  white-space: pre;
  font-family: inherit;
  color: inherit;
  line-height: inherit;
  font-size: inherit;
  background: transparent;
}

/* 语法高亮样式 */
:deep(.token.comment),
:deep(.token.prolog),
:deep(.token.doctype),
:deep(.token.cdata) {
  color: #6a9955;
}

:deep(.token.tag),
:deep(.token.punctuation) {
  color: #569cd6;
}

:deep(.token.attr-name) {
  color: #9cdcfe;
}

:deep(.token.attr-value),
:deep(.token.string) {
  color: #ce9178;
}

:deep(.token.keyword) {
  color: #569cd6;
}

:deep(.token.selector) {
  color: #d7ba7d;
}

:deep(.token.property),
:deep(.token.boolean),
:deep(.token.number),
:deep(.token.constant),
:deep(.token.symbol),
:deep(.token.deleted) {
  color: #b5cea8;
}

:deep(.token.operator),
:deep(.token.entity),
:deep(.token.url) {
  color: #d4d4d4;
}

:deep(.token.atrule),
:deep(.token.attr-value),
:deep(.token.keyword) {
  color: #569cd6;
}

:deep(.token.function),
:deep(.token.class-name) {
  color: #dcdcaa;
}

:deep(.token.regex),
:deep(.token.important),
:deep(.token.variable) {
  color: #d16969;
}
</style>