<template>
  <section
    class="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
  >
    <div>
      <h2 class="text-base font-semibold tracking-tight text-ink">
        订阅本站更新
      </h2>
      <p class="mt-1 text-xs text-ink-soft">
        新文章发布时收到一封邮件，随时可以退订。
      </p>
    </div>

    <!-- 还没有后端，先拦下提交不发请求 -->
    <form class="flex w-full gap-2 sm:w-auto" @submit.prevent>
      <input
        type="email"
        required
        placeholder="你的邮箱"
        aria-label="邮箱地址"
        class="w-full min-w-0 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-accent focus:outline-none sm:w-56"
      >
      <button
        type="submit"
        class="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        订阅
      </button>
    </form>
  </section>
</template>
