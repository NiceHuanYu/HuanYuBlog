/**
 * Aim Train 的数据层：参数类型、默认值、本地存储读写与统计计算。
 *
 * 所有 localStorage 访问都只在客户端发生（页面在 onMounted 之后才调用），
 * 而且读写都包了 try/catch —— 隐私模式或禁用存储时 localStorage 会直接抛错，
 * 那种情况下游戏要照常能玩，只是不记分、不读历史。
 */

export type AimMoveMode = 'bounce' | 'drift' | 'teleport'
export type AimSpeed = 'slow' | 'normal' | 'fast'
export type AimTargetSize = 'small' | 'medium' | 'large'
export type AimBackground = 'plain' | 'grid' | 'dots' | 'glow'

/** 时长为 0 表示不限时，只能手动结束 */
export const INFINITE_DURATION = 0

export interface AimTrainConfig {
  /** 单局时长（秒）；INFINITE_DURATION 表示不限时 */
  duration: number
  /** 场上同时存在的靶数：打掉一个立刻补一个 */
  targetCount: number
  /** 靶的大小档 */
  targetSize: AimTargetSize
  /** 是否移动（总开关，关掉时忽略移动方式与速度） */
  moving: boolean
  /** 移动方式 */
  moveMode: AimMoveMode
  /** 移动速度档 */
  speed: AimSpeed
  /** 场地背景 */
  background: AimBackground
}

export interface AimTrainRecord {
  /** 结束时刻，ISO 字符串 */
  at: string
  config: AimTrainConfig
  hits: number
  misses: number
  /** 命中率 0~1；一次都没出手时为 0 */
  accuracy: number
  /** 平均反应时间（毫秒）；没有命中时为 null */
  avgReactionMs: number | null
  /** 最快反应时间（毫秒） */
  bestReactionMs: number | null
  /** 实际游玩时长（毫秒），提前结束时小于设定的时长 */
  durationMs: number
  /** 每分钟命中数 */
  kpm: number
}

/** 场上靶的位置与朝向；vx / vy 是**单位方向向量**，位移 = 方向 × 本帧像素距离 */
export interface MovingTarget {
  x: number
  y: number
  vx: number
  vy: number
}

export interface Point {
  x: number
  y: number
}

export const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: '15 秒' },
  { value: 30, label: '30 秒' },
  { value: 60, label: '60 秒' },
  { value: INFINITE_DURATION, label: '无限' }
]

export const MIN_TARGETS = 1
export const MAX_TARGETS = 10

/** 三档大小直接对应半径，不做按数量自动缩放——想让球小一点自己调 */
export const SIZE_OPTIONS: {
  value: AimTargetSize
  label: string
  radius: number
}[] = [
  { value: 'small', label: '小', radius: 16 },
  { value: 'medium', label: '中', radius: 26 },
  { value: 'large', label: '大', radius: 38 }
]

export const SPEED_OPTIONS: { value: AimSpeed; label: string }[] = [
  { value: 'slow', label: '慢' },
  { value: 'normal', label: '中' },
  { value: 'fast', label: '快' }
]

export const MOVE_MODE_OPTIONS: {
  value: AimMoveMode
  label: string
  hint: string
}[] = [
  { value: 'bounce', label: '匀速反弹', hint: '直线飞行，碰到边界反弹' },
  { value: 'drift', label: '随机漫步', hint: '沿路不断轻微改变方向' },
  { value: 'teleport', label: '定时瞬移', hint: '每隔一会儿跳到场上的新位置' }
]

/**
 * 场地背景。用内联样式而不是 Tailwind 类，是因为要引用 :root / .dark 里的
 * CSS 变量（var(--line)、var(--accent-soft)），这样明暗主题自动跟着变。
 */
export const BACKGROUND_OPTIONS: {
  value: AimBackground
  label: string
  style: Record<string, string>
}[] = [
  { value: 'plain', label: '素色', style: {} },
  {
    value: 'grid',
    label: '网格',
    style: {
      backgroundImage:
        'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)',
      backgroundSize: '26px 26px'
    }
  },
  {
    value: 'dots',
    label: '点阵',
    style: {
      backgroundImage: 'radial-gradient(var(--line) 1.2px, transparent 1.2px)',
      backgroundSize: '18px 18px'
    }
  },
  {
    value: 'glow',
    label: '光晕',
    style: {
      backgroundImage:
        'radial-gradient(circle at 50% 42%, var(--accent-soft), transparent 68%)'
    }
  }
]

export const DEFAULT_CONFIG: AimTrainConfig = {
  duration: 30,
  targetCount: 3,
  targetSize: 'medium',
  moving: false,
  moveMode: 'bounce',
  speed: 'normal',
  background: 'plain'
}

/** 基准速度（像素/秒），实际速度还要乘以速度档系数 */
const BASE_SPEED = 130

export const SPEED_FACTOR: Record<AimSpeed, number> = {
  slow: 0.55,
  normal: 1,
  fast: 1.6
}

/** 瞬移模式两次跳跃之间的基准间隔（毫秒），speed 越快间隔越短 */
export const TELEPORT_BASE_INTERVAL_MS = 1150

export const RECORDS_KEY = 'aim-train:records:v2'
export const CONFIG_KEY = 'aim-train:config:v1'

/** 历史记录最多保留多少局，超出时丢弃最旧的 */
export const MAX_RECORDS = 20

/** 靶的半径由大小档决定 */
export function targetRadius(size: AimTargetSize): number {
  return SIZE_OPTIONS.find((option) => option.value === size)?.radius ?? 26
}

/** 背景对应的内联样式；找不到时返回空对象（即素色） */
export function backgroundStyle(background: AimBackground): Record<string, string> {
  return BACKGROUND_OPTIONS.find((option) => option.value === background)?.style ?? {}
}

/** 本帧靶应该移动多少像素 */
export function frameDistance(speed: AimSpeed, deltaMs: number): number {
  return (BASE_SPEED * SPEED_FACTOR[speed] * deltaMs) / 1000
}

/** 瞬移模式的跳跃间隔 */
export function teleportInterval(speed: AimSpeed): number {
  return TELEPORT_BASE_INTERVAL_MS / SPEED_FACTOR[speed]
}

/** 单位随机方向，用作初速度 */
export function randomDirection(): { vx: number; vy: number } {
  const angle = Math.random() * Math.PI * 2
  return { vx: Math.cos(angle), vy: Math.sin(angle) }
}

/**
 * 在场地内随机一个不与已有靶重叠的位置。
 * 随机 24 次仍找不到空位时退而求其次，返回最后一次的位置。
 */
export function randomPosition(
  width: number,
  height: number,
  radius: number,
  taken: Point[] = []
): Point {
  const minGap = radius * 2 + 8
  const spanX = Math.max(0, width - radius * 2)
  const spanY = Math.max(0, height - radius * 2)
  let fallback: Point = { x: radius, y: radius }

  for (let i = 0; i < 24; i++) {
    const point: Point = {
      x: radius + Math.random() * spanX,
      y: radius + Math.random() * spanY
    }
    fallback = point
    const clash = taken.some(
      (other) => Math.hypot(other.x - point.x, other.y - point.y) < minGap
    )
    if (!clash) return point
  }

  return fallback
}

/**
 * 按本帧位移推进一个移动中的靶。
 *
 * - `bounce`：直线飞行，撞到边界反弹；
 * - `drift`：前进前先把方向随机偏转一点，形成漫步；
 * - `teleport`：不做逐帧移动，位置由调用方按间隔直接改写，这里原样返回。
 */
export function stepTarget(
  target: MovingTarget,
  mode: AimMoveMode,
  distance: number,
  width: number,
  height: number,
  radius: number
): MovingTarget {
  if (mode === 'teleport') return target

  let { x, y, vx, vy } = target

  if (mode === 'drift') {
    const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 0.4
    vx = Math.cos(angle)
    vy = Math.sin(angle)
  }

  x += vx * distance
  y += vy * distance

  // 碰壁反弹，同时把位置夹回场地内，避免靶被挤到边缘外
  const maxX = Math.max(radius, width - radius)
  const maxY = Math.max(radius, height - radius)

  if (x < radius) {
    x = radius
    vx = Math.abs(vx)
  } else if (x > maxX) {
    x = maxX
    vx = -Math.abs(vx)
  }

  if (y < radius) {
    y = radius
    vy = Math.abs(vy)
  } else if (y > maxY) {
    y = maxY
    vy = -Math.abs(vy)
  }

  return { x, y, vx, vy }
}

/**
 * KPM：每分钟命中数。这是这一版唯一的核心指标——
 * 得分那种加权数字没有实际意义，命中效率才说明问题。
 */
export function computeKpm(hits: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return hits / (durationMs / 60000)
}

/** 两套参数是否等价，用于把历史记录按玩法分组比较 */
export function sameConfig(a: AimTrainConfig, b: AimTrainConfig): boolean {
  return (
    a.duration === b.duration &&
    a.targetCount === b.targetCount &&
    a.targetSize === b.targetSize &&
    a.moving === b.moving &&
    a.moveMode === b.moveMode &&
    a.speed === b.speed &&
    a.background === b.background
  )
}

/** 同一套参数下 KPM 最高的那一局 */
export function bestRecordFor(
  records: AimTrainRecord[],
  config: AimTrainConfig
): AimTrainRecord | null {
  let best: AimTrainRecord | null = null
  for (const record of records) {
    if (!sameConfig(record.config, config)) continue
    if (!best || record.kpm > best.kpm) best = record
  }
  return best
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isMoveMode(value: unknown): value is AimMoveMode {
  return value === 'bounce' || value === 'drift' || value === 'teleport'
}

function isSpeed(value: unknown): value is AimSpeed {
  return value === 'slow' || value === 'normal' || value === 'fast'
}

function isTargetSize(value: unknown): value is AimTargetSize {
  return value === 'small' || value === 'medium' || value === 'large'
}

function isBackground(value: unknown): value is AimBackground {
  return (
    value === 'plain' || value === 'grid' || value === 'dots' || value === 'glow'
  )
}

function clampTargets(value: unknown): number {
  const count = Math.round(Number(value))
  if (!Number.isFinite(count)) return DEFAULT_CONFIG.targetCount
  return Math.min(MAX_TARGETS, Math.max(MIN_TARGETS, count))
}

/**
 * 把从 localStorage 读回来的东西收拾成合法配置。
 * 存储里的内容可能被手改过或来自旧版本，任何一项不合法都退回默认值。
 */
function sanitizeConfig(raw: unknown): AimTrainConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CONFIG }
  const input = raw as Record<string, unknown>
  const duration = Number(input.duration)

  return {
    duration: DURATION_OPTIONS.some((option) => option.value === duration)
      ? duration
      : DEFAULT_CONFIG.duration,
    targetCount: clampTargets(input.targetCount),
    targetSize: isTargetSize(input.targetSize)
      ? input.targetSize
      : DEFAULT_CONFIG.targetSize,
    moving: typeof input.moving === 'boolean' ? input.moving : DEFAULT_CONFIG.moving,
    moveMode: isMoveMode(input.moveMode) ? input.moveMode : DEFAULT_CONFIG.moveMode,
    speed: isSpeed(input.speed) ? input.speed : DEFAULT_CONFIG.speed,
    background: isBackground(input.background)
      ? input.background
      : DEFAULT_CONFIG.background
  }
}

export function loadConfig(): AimTrainConfig {
  const store = storage()
  if (!store) return { ...DEFAULT_CONFIG }
  try {
    const raw = store.getItem(CONFIG_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    return sanitizeConfig(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveConfig(config: AimTrainConfig): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    // 存不进去（配额满、隐私模式）不影响继续玩
  }
}

function sanitizeRecord(raw: unknown): AimTrainRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const input = raw as Record<string, unknown>
  const at = typeof input.at === 'string' ? input.at : null
  if (!at) return null

  const hits = Number(input.hits) || 0
  const misses = Number(input.misses) || 0
  const shots = hits + misses
  const durationMs = Number(input.durationMs) || 0

  const avg = input.avgReactionMs === null ? null : Number(input.avgReactionMs)
  const best = input.bestReactionMs === null ? null : Number(input.bestReactionMs)

  return {
    at,
    config: sanitizeConfig(input.config),
    hits,
    misses,
    accuracy: shots > 0 ? hits / shots : 0,
    avgReactionMs: avg !== null && Number.isFinite(avg) ? avg : null,
    bestReactionMs: best !== null && Number.isFinite(best) ? best : null,
    durationMs,
    // KPM 一律重算，不信任存储里的值
    kpm: computeKpm(hits, durationMs)
  }
}

export function loadRecords(): AimTrainRecord[] {
  const store = storage()
  if (!store) return []
  try {
    const raw = store.getItem(RECORDS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(sanitizeRecord)
      .filter((record): record is AimTrainRecord => record !== null)
  } catch {
    return []
  }
}

function writeRecords(store: Storage, records: AimTrainRecord[]): void {
  try {
    store.setItem(RECORDS_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)))
  } catch {
    // 同上，写不进去就算了
  }
}

/** 追加一局记录并返回新的列表（最旧的在最后） */
export function appendRecord(record: AimTrainRecord): AimTrainRecord[] {
  const store = storage()
  const records = [record, ...loadRecords()].slice(0, MAX_RECORDS)
  if (store) writeRecords(store, records)
  return records
}

export function clearRecords(): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(RECORDS_KEY)
  } catch {
    // 忽略
  }
}

/** 反应时间统一用毫秒，如 284ms */
export function formatReaction(ms: number | null): string {
  return ms === null ? '—' : `${Math.round(ms)}ms`
}

/** KPM 保留一位小数 */
export function formatKpm(kpm: number): string {
  return kpm.toFixed(1)
}

export function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`
}

/** 时长文案，0 显示为「无限」 */
export function formatDuration(duration: number): string {
  return duration === INFINITE_DURATION ? '无限' : `${duration}s`
}

/** 实际游玩了多久，用于历史列表 */
export function formatElapsed(durationMs: number): string {
  return `${(durationMs / 1000).toFixed(1)}s`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
