<script setup lang="ts">
const appConfig = useAppConfig()

usePageSeo({
  title: `小游戏 · ${appConfig.site.name}`,
  description:
    '一些用来练手和放松的小游戏，成绩保存在你自己的浏览器里，不上传服务器。'
})

/** 目前只有瞄靶训练；以后加游戏往这里追加一项即可 */
const games = [
  {
    to: '/games/aim-train',
    name: '瞄靶训练',
    icon: 'gamepad',
    summary:
      '屏幕上出现小球，尽快点中它们。小球数量、是否移动、移动方式与单局时长都可以自己调，结束后给出命中率与反应时间。',
    tags: ['反应速度', '鼠标 / 触屏']
  }
]
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <header class="mb-8 text-center">
      <h1 class="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        小游戏
      </h1>
      <p class="mt-2 text-sm text-ink-soft">
        随手一玩的小东西，记录只存在本机浏览器里。
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="game in games"
        :key="game.to"
        :to="game.to"
        class="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-sm transition-colors hover:border-accent"
      >
        <span class="flex items-center gap-2">
          <AppIcon :name="game.icon" class="size-5 text-accent-ink" />
          <span class="text-base font-semibold text-ink">{{ game.name }}</span>
        </span>

        <span class="text-sm leading-relaxed text-ink-soft">
          {{ game.summary }}
        </span>

        <span class="mt-auto flex flex-wrap gap-2 pt-1">
          <span
            v-for="tag in game.tags"
            :key="tag"
            class="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-ink"
          >
            {{ tag }}
          </span>
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
