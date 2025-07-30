<template>
  <div class="relative my-6 rounded-lg overflow-hidden shadow-md border border-gray-700 bg-gray-900">
    <div class="flex items-center justify-between px-4 py-2 bg-[#191e29]">
      <span class="text-xs font-medium tracking-wider text-blue-400 uppercase">
        {{ languageDisplay }}
      </span>
      <button
        class="flex items-center gap-1.5 group text-gray-400 hover:text-blue-400 transition-colors"
        @click="copyCode"
      >
        <div :class="['transition-transform', { 'scale-90': copied }]">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M19 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" 
                  :class="['stroke-current transition-colors', copied ? 'text-blue-400' : 'group-hover:stroke-blue-400']" 
                  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 1H4C3.44772 1 3 1.44772 3 2V16" 
                  :class="['stroke-current', copied ? 'text-blue-400' : 'text-gray-500']"
                  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="text-xs font-medium transition-colors duration-300">
          {{ copyText }}
        </span>
      </button>
    </div>
    
    <pre class="m-0 p-4 overflow-x-auto scroll-smooth bg-gray-900">
      <code 
        ref="codeElement" 
        class="block font-mono text-[13px] leading-relaxed text-gray-100"
        :class="`language-${language}`"
        v-html="highlightedCode"
      />
    </pre>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  },
  code: {
    type: String,
    required: true
  },
  autoDedent: {
    type: Boolean,
    default: true
  }
})

const codeElement = ref(null)
const copyText = ref('复制')
const copied = ref(false)
const highlightedCode = ref('')

// 语言名称映射
const languageDisplay = computed(() => {
  const langMap = {
    html: 'HTML',
    javascript: 'JavaScript',
    bash: 'Shell',
    css: 'CSS',
    vue: 'Vue',
    typescript: 'TypeScript',
    json: 'JSON',
    markdown: 'Markdown',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    php: 'PHP',
    ruby: 'Ruby',
    go: 'Go',
    rust: 'Rust',
    kotlin: 'Kotlin',
    swift: 'Swift',
    shell: 'Shell',
    sql: 'SQL',
    yaml: 'YAML',
    xml: 'XML',
    dockerfile: 'Docker',
    makefile: 'Make',
    nginx: 'Nginx',
    apache: 'Apache',
    git: 'Git',
    diff: 'Diff',
    ini: 'INI',
    toml: 'TOML',
    graphql: 'GraphQL',
    scss: 'SCSS',
    less: 'Less',
    stylus: 'Stylus',
    sass: 'Sass',
    tsx: 'TSX',
    jsx: 'JSX'
  }
  return langMap[props.language] || props.language
})

// 智能删除公共缩进
const cleanedCode = computed(() => {
  let code = props.code.replace(/\r\n/g, '\n').trim()
  
  if (props.autoDedent && code.includes('\n')) {
    const lines = code.split('\n')
    const indentSizes = lines
      .filter(line => line.trim().length > 0)
      .map(line => line.match(/^[ \t]*(?=\S)/)?.[0]?.length || 0)
    
    if (indentSizes.length > 0) {
      const minIndent = Math.min(...indentSizes)
      code = lines.map(line => 
        line.startsWith(' '.repeat(minIndent)) 
          ? line.slice(minIndent) 
          : line
      ).join('\n')
    }
  }
  
  return code
})

// 复制处理
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(cleanedCode.value)
    
    // 视觉反馈
    copyText.value = '已复制'
    copied.value = true
    
    setTimeout(() => {
      copied.value = false
      copyText.value = '复制'
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    copyText.value = '复制失败'
    setTimeout(() => {
      copyText.value = '复制'
    }, 2000)
  }
}

// 高亮代码
onMounted(async () => {
  try {
    // 按需加载语言
    const langModules = {
      html: () => import('prismjs/components/prism-markup-templating'),
      javascript: () => import('prismjs/components/prism-javascript'),
      bash: () => import('prismjs/components/prism-bash'),
      css: () => import('prismjs/components/prism-css'),
      vue: () => import('prismjs/components/prism-markup-templating'),
      typescript: () => import('prismjs/components/prism-typescript'),
      tsx: () => Promise.all([
        import('prismjs/components/prism-typescript'),
        import('prismjs/components/prism-jsx')
      ]),
      jsx: () => import('prismjs/components/prism-jsx'),
      json: () => import('prismjs/components/prism-json'),
      // 其他语言...
    }
    
    const loader = langModules[props.language] || langModules.javascript
    await loader()
    
    // 应用高亮
    if (window.Prism) {
      highlightedCode.value = window.Prism.highlight(
        cleanedCode.value,
        window.Prism.languages[props.language] || window.Prism.languages.javascript,
        props.language
      )
    }
  } catch (error) {
    console.error('语法高亮错误:', error)
    highlightedCode.value = cleanedCode.value
  }
})
</script>

<style scoped>
/* 滚动条优化 */
pre::-webkit-scrollbar {
  height: 8px;
  background-color: #11161f;
}

pre::-webkit-scrollbar-thumb {
  background-color: #334155;
  border-radius: 4px;
  border: 1px solid #1e293b;
}

pre::-webkit-scrollbar-thumb:hover {
  background-color: #475569;
}
</style>