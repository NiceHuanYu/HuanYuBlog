<script setup lang="ts">
const appConfig = useAppConfig()

usePageSeo({
  title: `瞄靶训练 · ${appConfig.site.name}`,
  description:
    '点击随机出现的小球，可调小球数量、是否移动、移动方式与游戏时长，结束后统计命中率与反应时间。成绩保存在本地浏览器。'
})
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <header class="mb-6">
      <p class="text-xs text-ink-faint">
        <NuxtLink to="/games" class="transition-colors hover:text-ink">
          小游戏
        </NuxtLink>
        <span class="px-1">/</span>瞄靶训练
      </p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        瞄靶训练
      </h1>
      <p class="mt-2 text-sm text-ink-soft">
        小球出现后尽快点中它；点到空白算一次脱靶。成绩只写在本机浏览器，清理浏览器数据就会丢。
      </p>
    </header>

    <!-- 游戏全程只在客户端跑：服务端渲染没有随机数与计时器，
         用 ClientOnly 把整块隔开，也顺带避免 hydration mismatch -->
    <ClientOnly>
      <AimTrain />

      <template #fallback>
        <div
          class="flex h-[58vh] max-h-[560px] min-h-[300px] items-center justify-center rounded-xl border border-line bg-surface-strong"
        >
          <p class="text-sm text-ink-faint">正在准备游戏…</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
