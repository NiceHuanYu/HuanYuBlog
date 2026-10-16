<script setup lang="ts">
import {
  MOVE_MODE_OPTIONS,
  SPEED_OPTIONS,
  bestRecordFor,
  formatAccuracy,
  formatDate,
  formatDuration,
  formatElapsed,
  formatKpm,
  formatReaction,
  type AimTrainRecord
} from '~/utils/aimTrain'

const props = defineProps<{
  /** 刚结束的这一局 */
  record: AimTrainRecord
  /** 本地保存的全部历史（含本局，最新的在最前） */
  records: AimTrainRecord[]
}>()

const emit = defineEmits<{
  /** 同样参数再来一局 */
  restart: []
  /** 回到设置界面 */
  reset: []
  /** 清空本地记录 */
  clear: []
}>()

/** 该配置下 KPM 最高的那一局（含本局），用来判断是否刷新纪录 */
const best = computed(() => bestRecordFor(props.records, props.record.config))
const isBest = computed(() => best.value?.at === props.record.at)

function summarize(record: AimTrainRecord): string {
  const config = record.config
  const mode =
    MOVE_MODE_OPTIONS.find((item) => item.value === config.moveMode)?.label ??
    config.moveMode
  const speed =
    SPEED_OPTIONS.find((item) => item.value === config.speed)?.label ?? config.speed
  const motion = config.moving ? `${mode}·${speed}` : '静止'
  return `${formatDuration(config.duration)} · ${config.targetCount} 球 · ${motion}`
}

const currentSummary = computed(() => summarize(props.record))

// KPM 放第一项——得分那种加权数字没有实际意义，命中效率才说明问题
const metrics = computed(() => [
  { label: 'KPM（命中/分钟）', value: formatKpm(props.record.kpm) },
  { label: '命中', value: String(props.record.hits) },
  { label: '脱靶', value: String(props.record.misses) },
  { label: '命中率', value: formatAccuracy(props.record.accuracy) },
  { label: '平均反应', value: formatReaction(props.record.avgReactionMs) },
  { label: '最快反应', value: formatReaction(props.record.bestReactionMs) }
])
</script>

<template>
  <div class="space-y-4">
    <SectionPanel title="本次成绩">
      <template #action>
        <span class="text-right text-xs text-ink-faint">{{ currentSummary }}</span>
      </template>

      <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          v-for="(metric, index) in metrics"
          :key="metric.label"
          class="rounded-lg border border-line bg-surface-strong px-3 py-2.5"
          :class="index === 0 && 'border-accent'"
        >
          <dt class="text-xs text-ink-faint">{{ metric.label }}</dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums text-ink">
            {{ metric.value }}
          </dd>
        </div>
      </dl>

      <p class="mt-4 text-xs text-ink-faint">
        实际游玩 {{ formatElapsed(record.durationMs) }}。
        <template v-if="isBest">这是该配置下 KPM 最高的一局。</template>
        <template v-else-if="best">
          同样配置的历史最佳是 {{ formatKpm(best.kpm) }} KPM（{{ formatDate(best.at) }}）。
        </template>
        <template v-else>还没有可比较的历史记录。</template>
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          @click="emit('restart')"
        >
          再来一局
        </button>
        <button
          type="button"
          class="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          @click="emit('reset')"
        >
          调整参数
        </button>
      </div>
    </SectionPanel>

    <SectionPanel title="历史记录">
      <template #action>
        <button
          v-if="records.length"
          type="button"
          class="text-xs text-ink-faint transition-colors hover:text-ink"
          @click="emit('clear')"
        >
          清空
        </button>
      </template>

      <p v-if="!records.length" class="text-sm text-ink-soft">
        还没有记录。成绩会存在这台设备的浏览器里，换设备或清理浏览器数据就会丢失。
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="item in records"
          :key="item.at"
          class="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-surface-strong px-3 py-2"
          :class="item.at === record.at && 'border-accent'"
        >
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm text-ink">{{ summarize(item) }}</span>
            <span class="block text-xs text-ink-faint">
              {{ formatDate(item.at) }} · 玩了 {{ formatElapsed(item.durationMs) }}
            </span>
          </span>
          <span class="shrink-0 text-right">
            <span class="block text-sm font-semibold tabular-nums text-ink">
              {{ formatKpm(item.kpm) }}
            </span>
            <span class="block text-xs text-ink-faint">
              KPM · {{ formatAccuracy(item.accuracy) }}
            </span>
          </span>
        </li>
      </ul>
    </SectionPanel>
  </div>
</template>
