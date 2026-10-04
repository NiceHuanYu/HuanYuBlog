<script setup lang="ts">
const colorMode = useColorMode()

// 滑块只有两态：点一下在日间 / 夜间之间切换。
// 首次访问时 preference 仍是 system（跟随系统），点击后变成显式选择。
function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="relative ml-1 h-6 w-11 shrink-0 rounded-full border border-line bg-surface-strong transition-colors hover:border-ink-faint"
    aria-label="切换日间 / 夜间模式"
    title="切换日间 / 夜间模式"
    @click="toggle"
  >
    <!-- 滑块位置和图标都由 CSS 决定：SSR 阶段拿不到用户偏好，
         用 JS 状态会导致水合前后不一致 -->
    <span
      class="absolute left-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-surface shadow-sm transition-transform duration-200 dark:translate-x-5"
    >
      <svg
        class="size-3 text-ink-soft dark:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>

      <svg
        class="hidden size-3 text-ink-soft dark:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    </span>
  </button>
</template>
