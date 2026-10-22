/**
 * 无畏契约（VALORANT）准星：配置模型 + 分享码解析/生成。
 *
 * 分享码格式（社区逆向所得，见下方注释；官方未公开）：
 *   - 分号分隔的 `键;值` 对，第一个 token 恒为 `0`（格式版本头），解析时跳过；
 *   - 按段划分：`P` = 主准星（我们只编辑这个）、`A` = 开镜、`S` = 狙击镜、
 *     `NAME` = 配置名（后面跟一个引号字符串）。**必须先分段再取键**——通用段里
 *     也有一个 `c` 键，含义是「用主准星覆盖全部」，与 `P` 段里的 `c`（颜色）同名不同义。
 *   - 键缺失即用游戏默认值，所以 `h`（轮廓）缺失等于「开」，只有 `h;0` 才是关。
 *
 * 本训练器只渲染主准星；`A` / `S` 段能解析但不使用，导出时也不会重新生成它们。
 *
 * 字段速查：
 *   P 段：c 颜色(0-7 预设，8=自定义) / u 自定义色 RRGGBBAA / h 轮廓开关 /
 *         t 轮廓粗细 / o 轮廓透明度 / d 中心点开关 / z 中心点大小 / a 中心点透明度
 *   线（0=内线，1=外线）：b 开关 / t 粗细 / l 水平长度 / v 垂直长度 / g 长度不联动 /
 *         o 偏移 / a 透明度 / m 移动误差开关 / s 移动误差倍率 / f 射击误差开关 / e 射击误差倍率
 */

export interface CrosshairLine {
  /** b：这条线是否显示 */
  show: boolean
  /** t：线宽 */
  thickness: number
  /** l：水平方向的长度 */
  length: number
  /** v：垂直方向的长度（linkedLength 为 true 时与 length 相同） */
  verticalLength: number
  /** g：水平与垂直长度是否分开设置（true = 联动） */
  linkedLength: boolean
  /** o：距中心的偏移 */
  offset: number
  /** a：不透明度 0~1 */
  opacity: number
  /** m：是否启用移动误差扩散 */
  movementError: boolean
  /** s：移动误差倍率 */
  movementMultiplier: number
  /** f：是否启用射击误差扩散 */
  firingError: boolean
  /** e：射击误差倍率 */
  firingMultiplier: number
}

export interface CrosshairConfig {
  /** c：0-7 为预设色，8 为自定义（配合 customColor） */
  color: number
  /** u：自定义颜色，`#RRGGBB` */
  customColor: string
  /** h：轮廓开关（分享码里键缺失表示开启） */
  outlines: boolean
  /** t：轮廓粗细 */
  outlineThickness: number
  /** o：轮廓透明度 */
  outlineOpacity: number
  /** d：中心点开关 */
  dot: boolean
  /** z：中心点大小 */
  dotSize: number
  /** a：中心点透明度 */
  dotOpacity: number
  inner: CrosshairLine
  outer: CrosshairLine
}

export const CROSSHAIR_COLORS: { index: number; label: string; hex: string }[] = [
  { index: 0, label: '白色', hex: '#FFFFFF' },
  { index: 1, label: '绿色', hex: '#00FF00' },
  { index: 2, label: '黄绿', hex: '#7FFF00' },
  { index: 3, label: '绿黄', hex: '#DFFF00' },
  { index: 4, label: '黄色', hex: '#FFFF00' },
  { index: 5, label: '青色', hex: '#00FFFF' },
  { index: 6, label: '粉色', hex: '#FF00FF' },
  { index: 7, label: '红色', hex: '#FF0000' }
]

/**
 * 各滑块的取值范围。线粗/长度/偏移的上限来自社区实例中观察到的最大值，
 * 官方滑块的准确上限没有公开来源，这里取观察值；透明度与误差倍率是连续值。
 */
export const CROSSHAIR_LIMITS = {
  lineThickness: { min: 0, max: 10, step: 1 },
  lineLength: { min: 0, max: 20, step: 1 },
  lineOffset: { min: 0, max: 20, step: 1 },
  outerOffset: { min: 0, max: 40, step: 1 },
  outlineThickness: { min: 0, max: 4, step: 1 },
  dotSize: { min: 0, max: 6, step: 1 },
  opacity: { min: 0, max: 1, step: 0.01 },
  errorMultiplier: { min: 0, max: 3, step: 0.01 }
}

/**
 * 默认准星：无色差、看得清的小十字（绿色、无中心点、有轮廓）。
 * 对应的分享码形如 `0;P;c;1;o;1;0t;2;0l;4;0o;3;0a;1;1b;0`。
 */
export const DEFAULT_CROSSHAIR: CrosshairConfig = {
  color: 1,
  customColor: '#00FF00',
  outlines: true,
  outlineThickness: 1,
  outlineOpacity: 1,
  dot: false,
  dotSize: 2,
  dotOpacity: 1,
  inner: {
    show: true,
    thickness: 2,
    length: 4,
    verticalLength: 4,
    linkedLength: true,
    offset: 3,
    opacity: 1,
    movementError: false,
    movementMultiplier: 1,
    firingError: false,
    firingMultiplier: 1
  },
  outer: {
    show: false,
    thickness: 2,
    length: 2,
    verticalLength: 2,
    linkedLength: true,
    offset: 10,
    opacity: 0.35,
    movementError: false,
    movementMultiplier: 1,
    firingError: false,
    firingMultiplier: 1
  }
}

/**
 * 「不指定就等于什么」的那套游戏默认值。
 *
 * 分享码只写与默认不同的项，所以**解析时缺失的键必须回落到这里**，而不是回落到上面那套
 * 推荐配色——否则别人分享的码会被解析歪（实测踩过：`1t;3;1l;3` 不带 `1b`，外线本该是开的，
 * 却因为落到了推荐配色而被当成关闭）。
 *
 * 与 DEFAULT_CROSSHAIR 的分工：这个只用于解析，那个只用于「恢复默认」按钮。
 */
export const GAME_DEFAULT_CROSSHAIR: CrosshairConfig = {
  color: 0,
  customColor: '#FFFFFF',
  outlines: true,
  outlineThickness: 1,
  outlineOpacity: 0.5,
  dot: false,
  dotSize: 2,
  dotOpacity: 1,
  inner: {
    show: true,
    thickness: 1,
    length: 6,
    verticalLength: 6,
    linkedLength: true,
    offset: 3,
    opacity: 1,
    movementError: false,
    movementMultiplier: 1,
    firingError: false,
    firingMultiplier: 1
  },
  outer: {
    show: true,
    thickness: 1,
    length: 2,
    verticalLength: 2,
    linkedLength: true,
    offset: 10,
    opacity: 0.35,
    movementError: false,
    movementMultiplier: 1,
    firingError: false,
    firingMultiplier: 1
  }
}

/** 准星颜色的 CSS 值：预设色查表，自定义色用用户给的 hex */
export function crosshairColorHex(config: CrosshairConfig): string {
  if (config.color === 8) return normalizeHex(config.customColor)
  return CROSSHAIR_COLORS.find((item) => item.index === config.color)?.hex ?? '#00FF00'
}

/** 把任意输入收拾成 `#RRGGBB`；解析不出来就退回白色 */
export function normalizeHex(input: string): string {
  const raw = input.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`
  if (/^[0-9a-fA-F]{8}$/.test(raw)) return `#${raw.slice(0, 6).toUpperCase()}`
  return '#FFFFFF'
}

/** 数字格式化：去掉浮点噪声，0.5 就是 "0.5" 而不是 "0.5000000001" */
function fmt(value: number): string {
  return String(Math.round(value * 1000) / 1000)
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

const SECTION_MARKERS = new Set(['P', 'A', 'S', 'NAME'])

interface RawSection {
  marker: string
  /** 该段里 `键;值` 平铺的 token */
  tokens: string[]
}

/**
 * 按段标记把 token 切开。`NAME` 后面跟的是一个单独的字符串值，一并吃掉，
 * 免得它被当成下一个键。
 */
function splitSections(tokens: string[]): RawSection[] {
  const sections: RawSection[] = []
  let current: RawSection = { marker: '', tokens: [] }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (SECTION_MARKERS.has(token)) {
      sections.push(current)
      current = { marker: token, tokens: [] }
      if (token === 'NAME') {
        i++
        current.tokens.push(tokens[i] ?? '')
      }
      continue
    }
    current.tokens.push(token)
  }

  sections.push(current)
  return sections
}

/** 把平铺的 token 按 `键;值` 读成对象；落单的键会被忽略 */
function readPairs(tokens: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    out[tokens[i]] = tokens[i + 1]
  }
  return out
}

function toNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/** 布尔字段：未出现取 fallback，出现时非 "0" 即为真 */
function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value !== '0'
}

function parseLine(pairs: Record<string, string>, prefix: string, fallback: CrosshairLine): CrosshairLine {
  const get = (key: string) => pairs[`${prefix}${key}`]

  const linkedLength = toBoolean(get('g'), fallback.linkedLength)
  const length = clampNumber(
    toNumber(get('l'), fallback.length),
    CROSSHAIR_LIMITS.lineLength.min,
    CROSSHAIR_LIMITS.lineLength.max
  )
  const verticalLength = linkedLength
    ? length
    : clampNumber(
        toNumber(get('v'), fallback.verticalLength),
        CROSSHAIR_LIMITS.lineLength.min,
        CROSSHAIR_LIMITS.lineLength.max
      )

  const offsetLimit =
    prefix === '0' ? CROSSHAIR_LIMITS.lineOffset : CROSSHAIR_LIMITS.outerOffset

  return {
    show: toBoolean(get('b'), fallback.show),
    thickness: clampNumber(
      toNumber(get('t'), fallback.thickness),
      CROSSHAIR_LIMITS.lineThickness.min,
      CROSSHAIR_LIMITS.lineThickness.max
    ),
    length,
    verticalLength,
    linkedLength,
    offset: clampNumber(
      toNumber(get('o'), fallback.offset),
      offsetLimit.min,
      offsetLimit.max
    ),
    opacity: clampNumber(
      toNumber(get('a'), fallback.opacity),
      CROSSHAIR_LIMITS.opacity.min,
      CROSSHAIR_LIMITS.opacity.max
    ),
    movementError: toBoolean(get('m'), fallback.movementError),
    movementMultiplier: clampNumber(
      toNumber(get('s'), fallback.movementMultiplier),
      CROSSHAIR_LIMITS.errorMultiplier.min,
      CROSSHAIR_LIMITS.errorMultiplier.max
    ),
    firingError: toBoolean(get('f'), fallback.firingError),
    firingMultiplier: clampNumber(
      toNumber(get('e'), fallback.firingMultiplier),
      CROSSHAIR_LIMITS.errorMultiplier.min,
      CROSSHAIR_LIMITS.errorMultiplier.max
    )
  }
}

/**
 * 解析分享码。只读 `P` 段；解析不出 `P` 段时返回 null，
 * 由调用方决定是报错还是保留原值。
 */
export function parseCrosshairCode(code: string): CrosshairConfig | null {
  const tokens = code
    .trim()
    .split(';')
    .map((token) => token.trim())
    .filter((token) => token !== '')

  if (tokens.length < 2) return null

  // 首个 token 是版本头 `0`，后面才是内容
  const body = tokens[0] === '0' ? tokens.slice(1) : tokens
  const primary = splitSections(body).find((section) => section.marker === 'P')
  if (!primary || primary.tokens.length < 2) return null

  const pairs = readPairs(primary.tokens)
  // 缺失的键一律回落到游戏默认，而不是推荐配色
  const fallback = GAME_DEFAULT_CROSSHAIR
  const color = clampNumber(toNumber(pairs.c, fallback.color), 0, 8)

  return {
    color: Math.round(color),
    customColor: pairs.u ? normalizeHex(pairs.u) : fallback.customColor,
    // h 缺失表示轮廓开启，只有 h;0 是关闭
    outlines: toBoolean(pairs.h, fallback.outlines),
    outlineThickness: clampNumber(
      toNumber(pairs.t, fallback.outlineThickness),
      CROSSHAIR_LIMITS.outlineThickness.min,
      CROSSHAIR_LIMITS.outlineThickness.max
    ),
    outlineOpacity: clampNumber(
      toNumber(pairs.o, fallback.outlineOpacity),
      CROSSHAIR_LIMITS.opacity.min,
      CROSSHAIR_LIMITS.opacity.max
    ),
    dot: toBoolean(pairs.d, fallback.dot),
    dotSize: clampNumber(
      toNumber(pairs.z, fallback.dotSize),
      CROSSHAIR_LIMITS.dotSize.min,
      CROSSHAIR_LIMITS.dotSize.max
    ),
    dotOpacity: clampNumber(
      toNumber(pairs.a, fallback.dotOpacity),
      CROSSHAIR_LIMITS.opacity.min,
      CROSSHAIR_LIMITS.opacity.max
    ),
    inner: parseLine(pairs, '0', fallback.inner),
    outer: parseLine(pairs, '1', fallback.outer)
  }
}

function pushLine(parts: string[], prefix: string, line: CrosshairLine): void {
  parts.push(`${prefix}b`, line.show ? '1' : '0')
  parts.push(`${prefix}t`, fmt(line.thickness))
  parts.push(`${prefix}l`, fmt(line.length))
  if (!line.linkedLength) {
    parts.push(`${prefix}g`, '1')
    parts.push(`${prefix}v`, fmt(line.verticalLength))
  }
  parts.push(`${prefix}o`, fmt(line.offset))
  parts.push(`${prefix}a`, fmt(line.opacity))
  parts.push(`${prefix}m`, line.movementError ? '1' : '0')
  if (line.movementError) parts.push(`${prefix}s`, fmt(line.movementMultiplier))
  parts.push(`${prefix}f`, line.firingError ? '1' : '0')
  if (line.firingError) parts.push(`${prefix}e`, fmt(line.firingMultiplier))
}

/**
 * 生成分享码。轮廓开启时**不写 `h`**（缺省即开启，与游戏导出的代码一致），
 * 关闭时写 `h;0`。
 */
export function encodeCrosshairCode(config: CrosshairConfig): string {
  const parts: string[] = ['0', 'P', 'c', String(config.color)]

  if (config.color === 8) {
    const hex = normalizeHex(config.customColor).slice(1)
    parts.push('u', `${hex}FF`)
  }

  if (!config.outlines) {
    parts.push('h', '0')
  } else {
    parts.push('t', fmt(config.outlineThickness))
    parts.push('o', fmt(config.outlineOpacity))
  }

  parts.push('d', config.dot ? '1' : '0')
  if (config.dot) {
    parts.push('z', fmt(config.dotSize))
    parts.push('a', fmt(config.dotOpacity))
  }

  pushLine(parts, '0', config.inner)
  pushLine(parts, '1', config.outer)

  return parts.join(';')
}

/** 深拷贝一份配置，避免编辑时改到原始对象 */
export function cloneCrosshair(config: CrosshairConfig): CrosshairConfig {
  return {
    ...config,
    inner: { ...config.inner },
    outer: { ...config.outer }
  }
}
