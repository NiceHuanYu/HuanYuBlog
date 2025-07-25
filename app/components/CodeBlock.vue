<template>
  <div class="deepseek-code-block" :class="`language-${language}`">
    <div class="code-header">
      <span class="language-tag">{{ language }}</span>
      <button class="copy-button" @click="copyCode">
        <svg class="copy-icon" viewBox="0 0 24 24">
          <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
        </svg>
        <span class="copy-text">复制</span>
      </button>
    </div>
    <pre><code ref="codeElement" :class="`language-${language}`">{{ formattedCode }}</code></pre>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const codeElement = ref(null)

// 确保代码中的换行符被保留
const formattedCode = computed(() => {
  return props.code
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '\n') // 保留换行符
})

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
</script>

<style scoped>
:deep(pre code) {
  white-space: pre !important;
}
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
}

code {
  display: block;
  white-space: pre;
  font-family: 'Fira Code', monospace;
  color: #d4d4d4;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 语法高亮样式 - 类似VS Code深色主题 */
:deep(.token.comment),
:deep(.token.prolog),
:deep(.token.doctype),
:deep(.token.cdata) {
  color: #6a9955;
}

:deep(.token.punctuation) {
  color: #d4d4d4;
}

:deep(.token.property),
:deep(.token.tag),
:deep(.token.boolean),
:deep(.token.number),
:deep(.token.constant),
:deep(.token.symbol),
:deep(.token.deleted) {
  color: #b5cea8;
}

:deep(.token.selector),
:deep(.token.attr-name),
:deep(.token.string),
:deep(.token.char),
:deep(.token.builtin),
:deep(.token.inserted) {
  color: #ce9178;
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