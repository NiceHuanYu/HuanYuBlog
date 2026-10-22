/**
 * FPS 版瞄靶训练的数据层：配置、目标生成与移动的数学、本地存储。
 *
 * 与 2D 版（app/utils/aimTrain.ts）的关系：
 * - 复用与量纲无关的部分：时长选项、速度档、KPM / 反应时间 / 日期的格式化；
 * - 存储键、配置结构与记录结构都独立，两版成绩互不干扰。
 *
 * 坐标系（Three.js 惯例）：相机固定在 (0, EYE_HEIGHT, 0)，初始朝 -Z，地面是 y = 0。
 * 目标位置用球坐标生成——水平角、垂直角、距离各自随机，所以垂直角不为 0 的目标
 * 自然就悬在半空，不需要单独的「高度」参数。这一版的目标是「固定在世界上」的：
 * 刷新在相机前方的扇形区域里，打掉才换位置，转头去找它们即可。
 */

import {
  DURATION_OPTIONS,
  INFINITE_DURATION,
  SPEED_OPTIONS,
  computeKpm,
  type AimSpeed
} from './aimTrain'

export type FpsTargetKind = 'ball' | 'watermelon' | 'sign'
export type FpsTargetSize = 'small' | 'medium' | 'large'
export type FpsMoveMode = 'float' | 'drift' | 'patrol' | 'teleport'

/** 相机高度（米），也就是「眼睛」离地面的高度 */
export const EYE_HEIGHT = 1.6

/** 目标允许的最低高度，避免垂直角调大后目标钻到地面以下 */
const MIN_TARGET_Y = 0.25

export interface AimTrainFpsConfig {
  /** 单局时长（秒）；INFINITE_DURATION 表示不限时 */
  duration: number
  /** 场上同时存在的目标数 */
  targetCount: number
  /** 目标的世界尺寸档 */
  targetSize: FpsTargetSize
  /** 目标物种类 */
  targetKind: FpsTargetKind
  /** 是否移动（总开关） */
  moving: boolean
  /** 移动方式 */
  moveMode: FpsMoveMode
  /** 移动速度档 */
  speed: AimSpeed
  /** 刷新时的水平角范围（度）：目标在视线左右 ±该值 内出现 */
  horizontalSpread: number
  /** 刷新时的垂直角范围（度）：垂直角不为 0 时目标就是悬空的 */
  verticalSpread: number
  /** 目标距相机的最小距离（米） */
  minDistance: number
  /** 目标距相机的最大距离（米） */
  maxDistance: number
}

/** 目标的位置来自球坐标，base* 是它的基准位，移动都是围绕基准的解析式波动 */
export interface FpsTarget {
  id: number
  baseX: number
  baseY: number
  baseZ: number
  phaseX: number
  phaseY: number
  phaseZ: number
  /** 出现（或换位）的时刻，用来算反应时间 */
  bornAt: number
}

export interface AimTrainFpsRecord {
  /** 结束时刻，ISO 字符串 */
  at: string
  config: AimTrainFpsConfig
  hits: number
  misses: number
  /** 命中率 0~1 */
  accuracy: number
  /** 平均反应时间（毫秒），没有命中时为 null */
  avgReactionMs: number | null
  /** 最快反应时间（毫秒） */
  bestReactionMs: number | null
  /** 实际游玩时长（毫秒） */
  durationMs: number
  /** 每分钟命中数 */
  kpm: number
}

export const FPS_SIZE_OPTIONS: {
  value: FpsTargetSize
  label: string
  hint: string
  /** 世界半径（米） */
  radius: number
}[] = [
  { value: 'small', label: '小', hint: '半径 0.18m', radius: 0.18 },
  { value: 'medium', label: '中', hint: '半径 0.28m', radius: 0.28 },
  { value: 'large', label: '大', hint: '半径 0.42m', radius: 0.42 }
]

export const FPS_TARGET_OPTIONS: {
  value: FpsTargetKind
  label: string
  hint: string
}[] = [
  { value: 'ball', label: '小球', hint: '默认款，纯色球体' },
  { value: 'watermelon', label: '西瓜', hint: '带深色条纹的绿皮球' },
  { value: 'sign', label: '路牌', hint: '指示牌加立柱，判定按牌面外接球算' }
]

export const FPS_MOVE_MODE_OPTIONS: {
  value: FpsMoveMode
  label: string
  hint: string
}[] = [
  { value: 'float', label: '悬空浮动', hint: '原地上下缓慢起伏' },
  { value: 'drift', label: '随机漫步', hint: '在刷新区域里缓慢游走' },
  { value: 'patrol', label: '横向巡航', hint: '沿水平方向来回移动' },
  { value: 'teleport', label: '定时瞬移', hint: '每隔一会儿跳到区域内新位置' }
]

/** 速度倍率，与 2D 版同一套档位命名 */
export const FPS_SPEED_FACTOR: Record<AimSpeed, number> = {
  slow: 0.6,
  normal: 1,
  fast: 1.65
}

/** 瞬移模式的基准间隔（毫秒） */
export const FPS_TELEPORT_BASE_MS = 1300

export const FPS_SPREAD_LIMITS = {
  horizontal: { min: 2, max: 60, step: 1 },
  vertical: { min: 0, max: 45, step: 1 },
  distance: { min: 1, max: 40, step: 1 }
}

export const MIN_FPS_TARGETS = 1
export const MAX_FPS_TARGETS = 12

export const DEFAULT_FPS_CONFIG: AimTrainFpsConfig = {
  duration: 30,
  targetCount: 4,
  targetSize: 'medium',
  targetKind: 'ball',
  moving: false,
  moveMode: 'float',
  speed: 'normal',
  horizontalSpread: 22,
  verticalSpread: 7,
  minDistance: 4,
  maxDistance: 14
}

export const FPS_RECORDS_KEY = 'aim-train-fps:records:v1'
export const FPS_CONFIG_KEY = 'aim-train-fps:config:v1'
export const MAX_FPS_RECORDS = 20

export { DURATION_OPTIONS, INFINITE_DURATION, SPEED_OPTIONS, computeKpm }

export function fpsTargetRadius(size: FpsTargetSize): number {
  return FPS_SIZE_OPTIONS.find((option) => option.value === size)?.radius ?? 0.28
}

/** 目标物在参数面板里的名字 */
export function fpsTargetLabel(kind: FpsTargetKind): string {
  return FPS_TARGET_OPTIONS.find((option) => option.value === kind)?.label ?? kind
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function randomInRange(min: number, max: number): number {
  if (max <= min) return min
  return min + Math.random() * (max - min)
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * 在相机前方的扇形区域里随机产生一个目标。
 *
 * 距离用「按平方取值」而不是线性取值——线性随机会让目标明显堆在近处，
 * 平方分布下远近目标在屏幕上的数量看起来才均匀。
 */
export function spawnFpsTarget(
  config: AimTrainFpsConfig,
  id: number,
  now: number
): FpsTarget {
  const radius = fpsTargetRadius(config.targetSize)

  const yaw = degToRad(randomInRange(-config.horizontalSpread, config.horizontalSpread))
  const pitch = degToRad(randomInRange(-config.verticalSpread, config.verticalSpread))

  const near = Math.min(config.minDistance, config.maxDistance)
  const far = Math.max(config.minDistance, config.maxDistance)
  const distance = Math.sqrt(randomInRange(near * near, far * far))

  const cosPitch = Math.cos(pitch)
  const dirX = Math.sin(yaw) * cosPitch
  const dirY = Math.sin(pitch)
  const dirZ = -Math.cos(yaw) * cosPitch

  const baseX = dirX * distance
  // 垂直角为负且距离远时可能落到地下，这里抬回地面之上
  const baseY = Math.max(MIN_TARGET_Y + radius, EYE_HEIGHT + dirY * distance)
  const baseZ = dirZ * distance

  return {
    id,
    baseX,
    baseY,
    baseZ,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    phaseZ: Math.random() * Math.PI * 2,
    bornAt: now
  }
}

export interface FpsPoint {
  x: number
  y: number
  z: number
}

/**
 * 目标在某一时刻的位置。
 *
 * 用解析式（正弦波动）而不是逐帧累加，好处是：不会因为掉帧或标签页切回来
 * 而漂到奇怪的地方，也不需要处理边界碰撞——波动幅度本身就是有界的。
 */
export function fpsPositionAt(
  target: FpsTarget,
  config: AimTrainFpsConfig,
  elapsedMs: number
): FpsPoint {
  if (!config.moving) {
    return { x: target.baseX, y: target.baseY, z: target.baseZ }
  }

  const t = elapsedMs / 1000
  const factor = FPS_SPEED_FACTOR[config.speed]

  switch (config.moveMode) {
    case 'float':
      return {
        x: target.baseX,
        y: target.baseY + Math.sin(target.phaseY + t * 1.1 * factor) * 0.35,
        z: target.baseZ
      }

    case 'drift':
      return {
        x: target.baseX + Math.sin(target.phaseX + t * 0.6 * factor) * 1.3,
        y: Math.max(
          MIN_TARGET_Y,
          target.baseY + Math.sin(target.phaseY + t * 0.85 * factor) * 0.7
        ),
        z: target.baseZ + Math.cos(target.phaseZ + t * 0.7 * factor) * 1.3
      }

    case 'patrol':
      return {
        x: target.baseX + Math.sin(target.phaseX + t * 0.8 * factor) * 2.2,
        y: target.baseY,
        z: target.baseZ
      }

    // teleport 的位置由组件定时改写 base*，这里不额外偏移
    case 'teleport':
    default:
      return { x: target.baseX, y: target.baseY, z: target.baseZ }
  }
}

/** 瞬移模式两次跳跃之间的间隔 */
export function fpsTeleportInterval(speed: AimSpeed): number {
  return FPS_TELEPORT_BASE_MS / FPS_SPEED_FACTOR[speed]
}

/** 两套参数是否等价，用于按玩法分组比较成绩 */
export function sameFpsConfig(a: AimTrainFpsConfig, b: AimTrainFpsConfig): boolean {
  return (
    a.duration === b.duration &&
    a.targetCount === b.targetCount &&
    a.targetSize === b.targetSize &&
    a.targetKind === b.targetKind &&
    a.moving === b.moving &&
    a.moveMode === b.moveMode &&
    a.speed === b.speed &&
    a.horizontalSpread === b.horizontalSpread &&
    a.verticalSpread === b.verticalSpread &&
    a.minDistance === b.minDistance &&
    a.maxDistance === b.maxDistance
  )
}

/** 同一套参数下 KPM 最高的那一局 */
export function bestFpsRecordFor(
  records: AimTrainFpsRecord[],
  config: AimTrainFpsConfig
): AimTrainFpsRecord | null {
  let best: AimTrainFpsRecord | null = null
  for (const record of records) {
    if (!sameFpsConfig(record.config, config)) continue
    if (!best || record.kpm > best.kpm) best = record
  }
  return best
}

// ---------------------------------------------------------------------------
// 本地存储
// ---------------------------------------------------------------------------

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isTargetKind(value: unknown): value is FpsTargetKind {
  return value === 'ball' || value === 'watermelon' || value === 'sign'
}

function isTargetSize(value: unknown): value is FpsTargetSize {
  return value === 'small' || value === 'medium' || value === 'large'
}

function isMoveMode(value: unknown): value is FpsMoveMode {
  return (
    value === 'float' || value === 'drift' || value === 'patrol' || value === 'teleport'
  )
}

function isSpeed(value: unknown): value is AimSpeed {
  return value === 'slow' || value === 'normal' || value === 'fast'
}

/** 把存储里读回来的东西收拾成合法配置，任何一项不合法就退回默认值 */
function sanitizeFpsConfig(raw: unknown): AimTrainFpsConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_FPS_CONFIG }
  const input = raw as Record<string, unknown>

  const duration = Number(input.duration)
  const targetCount = Math.round(Number(input.targetCount))
  const horizontal = Number(input.horizontalSpread)
  const vertical = Number(input.verticalSpread)
  const minDistance = Number(input.minDistance)
  const maxDistance = Number(input.maxDistance)

  return {
    duration: DURATION_OPTIONS.some((option) => option.value === duration)
      ? duration
      : DEFAULT_FPS_CONFIG.duration,
    targetCount: Number.isFinite(targetCount)
      ? clamp(targetCount, MIN_FPS_TARGETS, MAX_FPS_TARGETS)
      : DEFAULT_FPS_CONFIG.targetCount,
    targetSize: isTargetSize(input.targetSize)
      ? input.targetSize
      : DEFAULT_FPS_CONFIG.targetSize,
    targetKind: isTargetKind(input.targetKind)
      ? input.targetKind
      : DEFAULT_FPS_CONFIG.targetKind,
    moving: typeof input.moving === 'boolean' ? input.moving : DEFAULT_FPS_CONFIG.moving,
    moveMode: isMoveMode(input.moveMode) ? input.moveMode : DEFAULT_FPS_CONFIG.moveMode,
    speed: isSpeed(input.speed) ? input.speed : DEFAULT_FPS_CONFIG.speed,
    horizontalSpread: Number.isFinite(horizontal)
      ? clamp(horizontal, FPS_SPREAD_LIMITS.horizontal.min, FPS_SPREAD_LIMITS.horizontal.max)
      : DEFAULT_FPS_CONFIG.horizontalSpread,
    verticalSpread: Number.isFinite(vertical)
      ? clamp(vertical, FPS_SPREAD_LIMITS.vertical.min, FPS_SPREAD_LIMITS.vertical.max)
      : DEFAULT_FPS_CONFIG.verticalSpread,
    minDistance: Number.isFinite(minDistance)
      ? clamp(minDistance, FPS_SPREAD_LIMITS.distance.min, FPS_SPREAD_LIMITS.distance.max)
      : DEFAULT_FPS_CONFIG.minDistance,
    maxDistance: Number.isFinite(maxDistance)
      ? clamp(maxDistance, FPS_SPREAD_LIMITS.distance.min, FPS_SPREAD_LIMITS.distance.max)
      : DEFAULT_FPS_CONFIG.maxDistance
  }
}

export function loadFpsConfig(): AimTrainFpsConfig {
  const store = storage()
  if (!store) return { ...DEFAULT_FPS_CONFIG }
  try {
    const raw = store.getItem(FPS_CONFIG_KEY)
    if (!raw) return { ...DEFAULT_FPS_CONFIG }
    return sanitizeFpsConfig(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_FPS_CONFIG }
  }
}

export function saveFpsConfig(config: AimTrainFpsConfig): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(FPS_CONFIG_KEY, JSON.stringify(config))
  } catch {
    // 存不进去不影响继续玩
  }
}

function sanitizeFpsRecord(raw: unknown): AimTrainFpsRecord | null {
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
    config: sanitizeFpsConfig(input.config),
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

export function loadFpsRecords(): AimTrainFpsRecord[] {
  const store = storage()
  if (!store) return []
  try {
    const raw = store.getItem(FPS_RECORDS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(sanitizeFpsRecord)
      .filter((record): record is AimTrainFpsRecord => record !== null)
  } catch {
    return []
  }
}

export function appendFpsRecord(record: AimTrainFpsRecord): AimTrainFpsRecord[] {
  const store = storage()
  const records = [record, ...loadFpsRecords()].slice(0, MAX_FPS_RECORDS)
  if (store) {
    try {
      store.setItem(FPS_RECORDS_KEY, JSON.stringify(records))
    } catch {
      // 忽略
    }
  }
  return records
}

export function clearFpsRecords(): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(FPS_RECORDS_KEY)
  } catch {
    // 忽略
  }
}
