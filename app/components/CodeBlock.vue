<template>
  <div class="code-block" :class="{ 'with-filename': filename }">
    <div v-if="filename" class="filename">
      {{ filename }}
    </div>
    <div class="code-container">
      <button v-if="copyable" class="copy-button" @click="copyCode">
        <i class="fas fa-copy"></i>
      </button>
      <pre><code ref="codeElement" :class="`language-${language}`"><slot /></code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  },
  filename: {
    type: String,
    default: ''
  },
  copyable: {
    type: Boolean,
    default: true
  }
})

const codeElement = ref(null)

const copyCode = async () => {
  try {
    const code = codeElement.value?.textContent || ''
    await navigator.clipboard.writeText(code)
    alert('代码已复制到剪贴板!')
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.code-block {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.code-block.with-filename {
  margin-top: 2.2rem;
}

.filename {
  position: absolute;
  top: -1.8rem;
  left: 0;
  background-color: #2d2d2d;
  color: #ccc;
  padding: 0.3rem 0.8rem;
  border-radius: 6px 6px 0 0;
  font-size: 0.85rem;
  font-family: 'Courier New', Courier, monospace;
}

.code-container {
  position: relative;
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ccc;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

pre {
  margin: 0;
  padding: 1.2rem;
  background-color: #2d2d2d;
  color: #f8f8f2;
  overflow-x: auto;
  font-size: 0.95rem;
  line-height: 1.5;
}

code {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  display: block;
}

/* 语法高亮颜色 (可以替换为你喜欢的主题) */
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
:deep(.token.url),
:deep(.language-css .token.string),
:deep(.style .token.string) {
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