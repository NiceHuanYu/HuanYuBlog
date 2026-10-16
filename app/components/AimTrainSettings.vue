<script setup lang="ts">
import {
  BACKGROUND_OPTIONS,
  DURATION_OPTIONS,
  INFINITE_DURATION,
  MAX_TARGETS,
  MIN_TARGETS,
  MOVE_MODE_OPTIONS,
  SIZE_OPTIONS,
  SPEED_OPTIONS,
  type AimTrainConfig
} from '~/utils/aimTrain'

// 父组件用 v-model 绑定同一份配置对象，改动立刻生效，
// 战场上的预览球也会跟着变（主组件里 watch 了这几个字段）
const config = defineModel<AimTrainConfig>({ required: true })

const activeMoveHint = computed(
  () =>
    MOVE_MODE_OPTIONS.find((mode) => mode.value === config.value.moveMode)?.hint ?? ''
)

const activeSize = computed(
  () => SIZE_OPTIONS.find((size) => size.value === config.value.targetSize) ?? SIZE_OPTIONS[1]
)

// 选中态统一用 accent 打底配白字；accent 在明暗两套主题里都是中间蓝，
// 所以这里的对比度不用分主题处理。
const selectedClass = 'border-accent bg-accent text-white'
const idleClass = 'border-line bg-surface text-ink-soft hover:text-ink'
</script>

<template>
  <div class="grid gap-5 sm:grid-cols-2">
    <div>
      <p class="mb-2 text-sm font-medium text-ink">游戏时长</p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="游戏时长">
        <button
          v-for="option in DURATION_OPTIONS"
          :key="option.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
          :class="config.duration === option.value ? selectedClass : idleClass"
          :aria-pressed="config.duration === option.value"
          @click="config.duration = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <p v-if="config.duration === INFINITE_DURATION" class="mt-1 text-xs text-ink-faint">
        不限时，随时点「结束」停下来
      </p>
    </div>

    <div>
      <label
        for="aim-targets"
        class="mb-2 flex items-baseline justify-between gap-2 text-sm font-medium text-ink"
      >
        小球数量
        <span class="text-xs font-normal text-ink-faint">同时存在的靶数</span>
      </label>
      <input
        id="aim-targets"
        v-model.number="config.targetCount"
        type="range"
        :min="MIN_TARGETS"
        :max="MAX_TARGETS"
        step="1"
        class="w-full accent-accent"
      >
      <p class="mt-1 text-xs text-ink-faint">
        {{ config.targetCount }} 个 · 打掉一个立刻补一个
      </p>
    </div>

    <div>
      <p class="mb-2 text-sm font-medium text-ink">小球大小</p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="小球大小">
        <button
          v-for="size in SIZE_OPTIONS"
          :key="size.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
          :class="config.targetSize === size.value ? selectedClass : idleClass"
          :aria-pressed="config.targetSize === size.value"
          @click="config.targetSize = size.value"
        >
          {{ size.label }}
        </button>
      </div>
      <p class="mt-1 text-xs text-ink-faint">
        半径约 {{ activeSize.radius }}px，上方预览里就是实际大小
      </p>
    </div>

    <div>
      <p class="mb-2 text-sm font-medium text-ink">移动</p>
      <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
        <input v-model="config.moving" type="checkbox" class="size-4 accent-accent">
        让小球动起来
      </label>
      <p class="mt-1 text-xs text-ink-faint">
        {{ config.moving ? '关闭后小球静止，只考验反应速度' : '当前静止不动' }}
      </p>
    </div>

    <div :class="!config.moving && 'opacity-50'">
      <p class="mb-2 text-sm font-medium text-ink">移动方式</p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="移动方式">
        <button
          v-for="mode in MOVE_MODE_OPTIONS"
          :key="mode.value"
          type="button"
          :disabled="!config.moving"
          class="rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed"
          :class="config.moveMode === mode.value ? selectedClass : idleClass"
          :aria-pressed="config.moveMode === mode.value"
          @click="config.moveMode = mode.value"
        >
          {{ mode.label }}
        </button>
      </div>
      <p class="mt-1 text-xs text-ink-faint">{{ activeMoveHint }}</p>
    </div>

    <div :class="!config.moving && 'opacity-50'">
      <p class="mb-2 text-sm font-medium text-ink">移动速度</p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="移动速度">
        <button
          v-for="speed in SPEED_OPTIONS"
          :key="speed.value"
          type="button"
          :disabled="!config.moving"
          class="rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed"
          :class="config.speed === speed.value ? selectedClass : idleClass"
          :aria-pressed="config.speed === speed.value"
          @click="config.speed = speed.value"
        >
          {{ speed.label }}
        </button>
      </div>
    </div>

    <div class="sm:col-span-2">
      <p class="mb-2 text-sm font-medium text-ink">游戏背景</p>
      <div class="flex flex-wrap gap-3" role="group" aria-label="游戏背景">
        <button
          v-for="option in BACKGROUND_OPTIONS"
          :key="option.value"
          type="button"
          class="flex w-16 flex-col items-center gap-1.5"
          :aria-pressed="config.background === option.value"
          @click="config.background = option.value"
        >
          <span
            class="h-11 w-16 rounded-lg border transition-colors"
            :class="config.background === option.value ? 'border-accent' : 'border-line'"
            :style="{ backgroundColor: 'var(--surface-strong)', ...option.style }"
          />
          <span
            class="text-xs transition-colors"
            :class="config.background === option.value ? 'text-accent-ink' : 'text-ink-faint'"
          >
            {{ option.label }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
