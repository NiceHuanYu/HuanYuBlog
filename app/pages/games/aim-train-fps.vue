<script setup lang="ts">
const appConfig = useAppConfig()

usePageSeo({
  title: `瞄靶训练 FPS · ${appConfig.site.name}`,
  description:
    '第一人称瞄准训练：3D 场景里从准星中心开火打靶，可用无畏契约的准星分享码自定义准星，目标刷新角度与距离都能调。成绩保存在本地浏览器。'
})
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <header class="mb-6">
      <p class="text-xs text-ink-faint">
        <NuxtLink to="/games" class="transition-colors hover:text-ink">
          小游戏
        </NuxtLink>
        <span class="px-1">/</span>瞄靶训练 FPS
      </p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        瞄靶训练 FPS
      </h1>
      <p class="mt-2 text-sm text-ink-soft">
        第一人称视角：准星固定在屏幕中心，移动鼠标转视角，点击开火。目标在相机前方的扇形区域里刷新，
        打掉一个立刻在别处补一个。准星可以直接粘贴无畏契约的分享码。
      </p>
    </header>

    <!-- 3D 场景、指针锁定、localStorage 全都只存在于客户端，用 ClientOnly 隔开，
         SSR 阶段只输出骨架，不会出现 hydration mismatch -->
    <ClientOnly>
      <AimTrainFps />

      <template #fallback>
        <div
          class="flex h-[62vh] max-h-[660px] min-h-[360px] items-center justify-center rounded-xl border border-line bg-surface-strong"
        >
          <p class="text-sm text-ink-faint">正在准备 3D 场景…</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
