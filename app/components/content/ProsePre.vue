<script setup lang="ts">
const props = defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string | null
}>()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

function markCopied() {
  copied.value = true
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    copied.value = false
  }, 1600)
}

async function copyCode() {
  const text = props.code ?? ''
  if (!text) {
    return
  }

  // 用局域网 IP 访问时不是安全上下文，navigator.clipboard 会是 undefined，
  // 所以保留一条 execCommand 的退路
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      markCopied()
      return
    } catch {
      // 落到下面的兜底
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    if (document.execCommand('copy')) {
      markCopied()
    }
  } catch {
    // 复制不可用时不提示，页面其余部分不受影响
  } finally {
    document.body.removeChild(textarea)
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <!-- 覆盖 @nuxtjs/mdc 默认的 ProsePre：加上语言标签和复制按钮。
       外层负责边框、圆角和背景，里面的 pre 只保留排版，样式在 main.css 的 .rich-text 里 -->
  <div
    class="overflow-hidden rounded-xl border border-line bg-surface-strong"
  >
    <div class="flex items-center gap-3 border-b border-line px-4 py-2">
      <span class="text-xs font-medium tracking-wide text-ink-faint">
        {{ filename || language || 'text' }}
      </span>

      <button
        type="button"
        class="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-soft transition-colors hover:bg-surface hover:text-ink"
        :aria-label="copied ? '已复制' : '复制代码'"
        @click="copyCode"
      >
        <AppIcon :name="copied ? 'check' : 'content-copy'" class="size-3.5" />
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>

    <pre :class="class"><slot /></pre>
  </div>
</template>
