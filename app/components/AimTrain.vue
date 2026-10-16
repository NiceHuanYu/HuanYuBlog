<script setup lang="ts">
import {
  DEFAULT_CONFIG,
  appendRecord,
  backgroundStyle,
  computeKpm,
  frameDistance,
  loadConfig,
  loadRecords,
  randomDirection,
  randomPosition,
  saveConfig,
  stepTarget,
  targetRadius,
  teleportInterval,
  type AimTrainConfig,
  type AimTrainRecord,
  type MovingTarget
} from '~/utils/aimTrain'

interface Target extends MovingTarget {
  id: number
  /** 出现（或换位）的时刻，用来算反应时间 */
  bornAt: number
}

type Phase = 'idle' | 'playing' | 'finished'

/**
 * 这个组件整个跑在客户端：页面用 <ClientOnly> 包着它，所以服务端不会渲染它，
 * setup 里的 performance / localStorage 也就不会在 SSR 阶段被执行。
 * 随机靶位和计时器都只存在于这里，不会碰上 hydration mismatch。
 */
const phase = ref<Phase>('idle')
const config = ref<AimTrainConfig>({ ...DEFAULT_CONFIG })
const arena = ref<HTMLElement | null>(null)
const targets = ref<Target[]>([])
const hits = ref(0)
const misses = ref(0)
const remainingMs = ref(0)
const elapsedMs = ref(0)
const records = ref<AimTrainRecord[]>([])
const lastRecord = ref<AimTrainRecord | null>(null)

// 场地尺寸单独放一份，rAF 循环里直接读，避免每帧 getBoundingClientRect
const size = reactive({ w: 0, h: 0 })

// 本局每个命中目标的反应时间，只在结算时读，不需要响应式
let reactions: number[] = []

let rafId = 0
let lastTs = 0
let startAt = 0
let nextTeleportAt = 0
let observer: ResizeObserver | null = null

const radius = computed(() => targetRadius(config.value.targetSize))
const arenaStyle = computed(() => backgroundStyle(config.value.background))

/** 不限时的时候倒计时没有意义，改显示已经玩了多久 */
const isTimed = computed(() => config.value.duration > 0)
const clockText = computed(() => {
  const ms = isTimed.value ? remainingMs.value : elapsedMs.value
  return `${(ms / 1000).toFixed(1)}s`
})

function measure() {
  const rect = arena.value?.getBoundingClientRect()
  if (!rect) return
  size.w = rect.width
  size.h = rect.height
}

/** 场地尺寸变化（窗口缩放、旋转）后把靶夹回可见范围 */
function clampTargets() {
  if (!targets.value.length) return
  const r = radius.value
  const maxX = Math.max(r, size.w - r)
  const maxY = Math.max(r, size.h - r)
  targets.value = targets.value.map((target) => ({
    ...target,
    x: Math.min(maxX, Math.max(r, target.x)),
    y: Math.min(maxY, Math.max(r, target.y))
  }))
}

function spawnAt(point: { x: number; y: number }, id: number, now: number): Target {
  const direction = randomDirection()
  return { id, x: point.x, y: point.y, vx: direction.vx, vy: direction.vy, bornAt: now }
}

/**
 * 摆好一局（或设置阶段的预览）的靶位。
 * 设置阶段显示的就是这份数据，点小球开始时直接沿用，位置不会跳动。
 */
function buildPreview() {
  measure()
  const now = performance.now()
  const r = radius.value

  const list: Target[] = []
  for (let i = 0; i < config.value.targetCount; i++) {
    // 逐个生成并带上已占位的位置，尽量不重叠
    list.push(spawnAt(randomPosition(size.w, size.h, r, list), i, now))
  }
  targets.value = list
}

function start() {
  measure()
  const now = performance.now()

  // 预览的靶位直接沿用；只有数量对不上（理论上不该发生）才重新摆
  if (targets.value.length !== config.value.targetCount) buildPreview()
  // 反应计时从现在开始算，预览停留的那段时间不计入
  targets.value = targets.value.map((target) => ({ ...target, bornAt: now }))

  hits.value = 0
  misses.value = 0
  reactions = []
  lastRecord.value = null
  elapsedMs.value = 0
  remainingMs.value = isTimed.value ? config.value.duration * 1000 : 0
  startAt = now
  nextTeleportAt = now + teleportInterval(config.value.speed)
  lastTs = 0
  phase.value = 'playing'

  saveConfig(config.value)
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(loop)
}

function finish() {
  cancelAnimationFrame(rafId)
  rafId = 0

  const durationMs = Math.max(0, performance.now() - startAt)
  const shots = hits.value + misses.value
  const avg = reactions.length
    ? reactions.reduce((sum, value) => sum + value, 0) / reactions.length
    : null
  const fastest = reactions.length ? Math.min(...reactions) : null

  const record: AimTrainRecord = {
    at: new Date().toISOString(),
    config: { ...config.value },
    hits: hits.value,
    misses: misses.value,
    accuracy: shots ? hits.value / shots : 0,
    avgReactionMs: avg,
    bestReactionMs: fastest,
    durationMs,
    kpm: computeKpm(hits.value, durationMs)
  }

  lastRecord.value = record
  records.value = appendRecord(record)
  remainingMs.value = 0
  phase.value = 'finished'
}

function loop(timestamp: number) {
  if (phase.value !== 'playing') return

  // 首帧和切标签页回来时 delta 会很大，夹一下免得靶瞬移出去
  const delta = lastTs ? Math.min(64, timestamp - lastTs) : 16
  lastTs = timestamp

  const elapsed = timestamp - startAt
  elapsedMs.value = elapsed

  if (isTimed.value) {
    const left = config.value.duration * 1000 - elapsed
    remainingMs.value = Math.max(0, left)
    if (left <= 0) {
      finish()
      return
    }
  }

  if (config.value.moving) advance(delta, timestamp)
  rafId = requestAnimationFrame(loop)
}

function advance(deltaMs: number, timestamp: number) {
  const mode = config.value.moveMode

  if (mode === 'teleport') {
    if (timestamp < nextTeleportAt) return
    nextTeleportAt = timestamp + teleportInterval(config.value.speed)
    const r = radius.value
    const now = performance.now()
    targets.value = targets.value.map((target) => {
      const others = targets.value.filter((other) => other.id !== target.id)
      const point = randomPosition(size.w, size.h, r, others)
      // 换了位置就等于换了个目标，反应计时重新开始
      return { ...target, x: point.x, y: point.y, bornAt: now }
    })
    return
  }

  const distance = frameDistance(config.value.speed, deltaMs)
  const r = radius.value
  targets.value = targets.value.map((target) => ({
    ...target,
    ...stepTarget(target, mode, distance, size.w, size.h, r)
  }))
}

/**
 * 点中靶：设置阶段等于开局，游戏阶段记一次命中并补位。
 */
function hit(target: Target) {
  if (phase.value === 'idle') {
    start()
    return
  }
  if (phase.value !== 'playing') return

  const now = performance.now()
  reactions.push(now - target.bornAt)
  hits.value++

  const r = radius.value
  const others = targets.value.filter((other) => other.id !== target.id)
  // 用一个新对象替换，避免直接改 v-for 里正在渲染的那一项
  targets.value = targets.value.map((item) =>
    item.id === target.id
      ? spawnAt(randomPosition(size.w, size.h, r, others), item.id, now)
      : item
  )
}

/** 点空处算脱靶；设置阶段点空处什么也不算 */
function miss() {
  if (phase.value !== 'playing') return
  misses.value++
}

function reset() {
  cancelAnimationFrame(rafId)
  rafId = 0
  hits.value = 0
  misses.value = 0
  remainingMs.value = 0
  elapsedMs.value = 0
  reactions = []
  phase.value = 'idle'
  // 回到设置界面，重新摆一份预览
  buildPreview()
}

/** 清空本地历史；内存里那份也要跟着清，否则界面还显示旧的 */
function clearHistory() {
  clearRecords()
  records.value = []
}

// 设置阶段改数量 / 大小或场地尺寸变化时，重新摆预览，保证「所见即开局」
watch(
  () => [config.value.targetCount, config.value.targetSize, size.w, size.h],
  () => {
    if (phase.value === 'idle') buildPreview()
    else if (phase.value === 'playing') clampTargets()
  }
)

onMounted(() => {
  config.value = loadConfig()
  records.value = loadRecords()
  measure()
  buildPreview()

  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    if (arena.value) observer.observe(arena.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="space-y-4">
    <div
      ref="arena"
      class="relative h-[58vh] max-h-[560px] min-h-[300px] touch-none overflow-hidden rounded-xl border border-line bg-surface-strong"
      :style="arenaStyle"
      @pointerdown="miss"
    >
      <button
        v-for="target in targets"
        :key="target.id"
        type="button"
        tabindex="-1"
        class="absolute rounded-full bg-accent ring-2 ring-canvas transition-transform duration-75 active:scale-90"
        :style="{
          left: `${target.x - radius}px`,
          top: `${target.y - radius}px`,
          width: `${radius * 2}px`,
          height: `${radius * 2}px`
        }"
        :aria-label="`小球 ${target.id + 1}`"
        @pointerdown.stop="hit(target)"
      />

      <!-- 顶部 HUD：不吃点击，穿透到场地，免得点到数字被算成命中 -->
      <div
        v-if="phase === 'playing'"
        class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4 py-3 text-sm"
      >
        <span
          class="rounded-full bg-canvas/90 px-3 py-1 font-mono font-semibold tabular-nums text-ink shadow-sm"
        >
          <span v-if="!isTimed" class="font-sans text-xs text-ink-soft">已用 </span>{{ clockText }}
        </span>
        <span class="rounded-full bg-canvas/90 px-3 py-1 text-ink-soft shadow-sm">
          命中 <span class="font-semibold text-ink">{{ hits }}</span>
          · 脱靶 <span class="font-semibold text-ink">{{ misses }}</span>
        </span>
      </div>

      <!-- 设置阶段的提示放在底部，不遮住小球，球本身就可以点 -->
      <div
        v-if="phase === 'idle'"
        class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-4"
      >
        <span
          class="rounded-full bg-canvas/90 px-3 py-1 text-xs text-ink-soft shadow-sm"
        >
          点击任意小球立即开始 · 上方就是开局的位置与大小
        </span>
      </div>
    </div>

    <template v-if="phase === 'idle'">
      <AimTrainSettings v-model="config" />
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          @click="start"
        >
          {{ isTimed ? `开始训练（${config.duration} 秒）` : '开始训练（不限时）' }}
        </button>
        <p class="text-xs text-ink-faint">
          成绩只保存在这台设备的浏览器里
        </p>
      </div>
    </template>

    <template v-else-if="phase === 'playing'">
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          @click="finish"
        >
          结束
        </button>
        <p class="text-xs text-ink-faint">
          当前配置：{{ config.targetCount }} 个球 ·
          {{ config.moving ? `移动 · ${config.moveMode}` : '静止' }}
        </p>
      </div>
    </template>

    <AimTrainResult
      v-else-if="lastRecord"
      :record="lastRecord"
      :records="records"
      @restart="start"
      @reset="reset"
      @clear="clearHistory"
    />
  </div>
</template>
