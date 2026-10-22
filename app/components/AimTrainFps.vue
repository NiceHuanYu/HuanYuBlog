<script setup lang="ts">
import {
  DEFAULT_FPS_CONFIG,
  DURATION_OPTIONS,
  EYE_HEIGHT,
  FPS_MOVE_MODE_OPTIONS,
  FPS_SIZE_OPTIONS,
  FPS_SPREAD_LIMITS,
  FPS_TARGET_OPTIONS,
  MAX_FPS_TARGETS,
  MIN_FPS_TARGETS,
  SPEED_OPTIONS,
  appendFpsRecord,
  clearFpsRecords,
  computeKpm,
  fpsPositionAt,
  fpsTargetLabel,
  fpsTargetRadius,
  fpsTeleportInterval,
  loadFpsConfig,
  loadFpsRecords,
  saveFpsConfig,
  spawnFpsTarget,
  type AimTrainFpsConfig,
  type AimTrainFpsRecord,
  type FpsTarget,
  type FpsTargetKind
} from '~/utils/fpsScene'
import {
  DEFAULT_CROSSHAIR,
  cloneCrosshair,
  type CrosshairConfig
} from '~/utils/crosshair'
import { formatAccuracy, formatElapsed, formatKpm, formatReaction } from '~/utils/aimTrain'

type Phase = 'idle' | 'playing' | 'finished'

// Three.js 按需加载：只有进入这个页面才拉 three 的 chunk，
// 首页与文章页不会因为它多背几百 KB。
let THREE: typeof import('three') | null = null
let renderer: import('three').WebGLRenderer | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let raycaster: import('three').Raycaster | null = null
let viewCenter: import('three').Vector2 | null = null
let resizeObserver: ResizeObserver | null = null
let disposed = false

interface TargetObject {
  group: import('three').Group
  /** 不可见的判定球：三种目标物形状不同，命中一律按外接球算 */
  hitSphere: import('three').Mesh
}

const phase = ref<Phase>('idle')
const config = ref<AimTrainFpsConfig>({ ...DEFAULT_FPS_CONFIG })
const crosshair = ref<CrosshairConfig>(cloneCrosshair(DEFAULT_CROSSHAIR))
const stage = ref<HTMLElement | null>(null)
const canvasHost = ref<HTMLElement | null>(null)

const ready = ref(false)
const locked = ref(false)
const hits = ref(0)
const misses = ref(0)
const remainingMs = ref(0)
const elapsedMs = ref(0)
const crosshairError = ref(0)
const records = ref<AimTrainFpsRecord[]>([])
const lastRecord = ref<AimTrainFpsRecord | null>(null)

// 场景里每帧变的东西都不放进响应式系统，直接改 Three 对象
const targetObjects = new Map<number, TargetObject>()
let targets: FpsTarget[] = []
let rafId = 0
let lastTs = 0
let startAt = 0
let clockMs = 0
let nextTeleportAt = 0
let reactions: number[] = []
let moveError = 0
let fireError = 0

// 视角
let yaw = 0
let pitch = 0
/** 每像素转多少弧度 */
const SENSITIVITY = 0.0022

const isTimed = computed(() => config.value.duration > 0)
const clockText = computed(() => {
  const ms = isTimed.value ? remainingMs.value : elapsedMs.value
  return `${(ms / 1000).toFixed(1)}s`
})
const targetRadius = computed(() => fpsTargetRadius(config.value.targetSize))

const activeMoveHint = computed(
  () =>
    FPS_MOVE_MODE_OPTIONS.find((mode) => mode.value === config.value.moveMode)?.hint ?? ''
)
const activeKindHint = computed(
  () => FPS_TARGET_OPTIONS.find((kind) => kind.value === config.value.targetKind)?.hint ?? ''
)

// ---------------------------------------------------------------------------
// Three 场景
// ---------------------------------------------------------------------------

function applyCameraRotation() {
  if (!camera) return
  // YXZ 顺序：先偏航后俯仰，避免出现滚转
  camera.rotation.set(pitch, yaw, 0, 'YXZ')
}

function buildTargetMesh(kind: FpsTargetKind, radius: number): TargetObject | null {
  if (!THREE) return null
  const T = THREE
  const group = new T.Group()

  if (kind === 'ball') {
    group.add(
      new T.Mesh(
        new T.SphereGeometry(radius, 26, 18),
        new T.MeshStandardMaterial({ color: 0xe2563f, roughness: 0.42, metalness: 0.08 })
      )
    )
  } else if (kind === 'watermelon') {
    group.add(
      new T.Mesh(
        new T.SphereGeometry(radius, 30, 22),
        new T.MeshStandardMaterial({ color: 0x1f7a3f, roughness: 0.62 })
      )
    )
    // 深色条纹：几道竖直的细圆环
    const stripeMat = new T.MeshStandardMaterial({ color: 0x0c3a1d, roughness: 0.7 })
    for (let i = 0; i < 6; i++) {
      const stripe = new T.Mesh(new T.TorusGeometry(radius * 0.995, radius * 0.075, 6, 20), stripeMat)
      stripe.rotation.y = (i / 6) * Math.PI
      stripe.rotation.x = Math.PI / 2
      group.add(stripe)
    }
  } else {
    // 路牌：牌面 + 一行「文字」条 + 立柱
    const boardW = radius * 2.3
    const boardH = radius * 1.25
    const board = new T.Mesh(
      new T.BoxGeometry(boardW, boardH, radius * 0.14),
      new T.MeshStandardMaterial({ color: 0x1f7a4d, roughness: 0.55 })
    )
    group.add(board)

    const textBar = new T.Mesh(
      new T.BoxGeometry(boardW * 0.66, boardH * 0.2, radius * 0.16),
      new T.MeshStandardMaterial({ color: 0xeef2f5, roughness: 0.5 })
    )
    textBar.position.set(0, boardH * 0.12, radius * 0.02)
    group.add(textBar)

    const post = new T.Mesh(
      new T.CylinderGeometry(radius * 0.11, radius * 0.11, radius * 2.2, 10),
      new T.MeshStandardMaterial({ color: 0x9aa2ad, roughness: 0.6, metalness: 0.3 })
    )
    post.position.y = -boardH / 2 - radius * 1.1
    group.add(post)
  }

  const hitSphere = new T.Mesh(
    new T.SphereGeometry(radius, 12, 10),
    new T.MeshBasicMaterial({ visible: false })
  )
  group.add(hitSphere)

  return { group, hitSphere }
}

function disposeTargetObjects() {
  for (const object of targetObjects.values()) {
    scene?.remove(object.group)
    object.group.traverse((child: import('three').Object3D) => {
      const mesh = child as import('three').Mesh
      mesh.geometry?.dispose?.()
      const material = mesh.material as import('three').Material | import('three').Material[]
      if (Array.isArray(material)) material.forEach((item) => item.dispose())
      else material?.dispose?.()
    })
  }
  targetObjects.clear()
}

function rebuildTargets() {
  if (!THREE || !scene) return
  disposeTargetObjects()
  const radius = targetRadius.value

  targets = Array.from({ length: config.value.targetCount }, (_, index) =>
    spawnFpsTarget(config.value, index, performance.now())
  )

  for (const target of targets) {
    const object = buildTargetMesh(config.value.targetKind, radius)
    if (!object) continue
    object.hitSphere.userData.targetId = target.id
    const position = fpsPositionAt(target, config.value, clockMs)
    object.group.position.set(position.x, position.y, position.z)
    scene.add(object.group)
    targetObjects.set(target.id, object)
  }
}

async function initThree() {
  if (!canvasHost.value) return
  THREE = await import('three')
  if (disposed || !THREE || !canvasHost.value) return
  const T = THREE

  scene = new T.Scene()
  scene.background = new T.Color(0x151a24)
  // 远处目标淡入雾里，纵深感更明显
  scene.fog = new T.Fog(0x151a24, 18, 68)

  camera = new T.PerspectiveCamera(
    75,
    canvasHost.value.clientWidth / Math.max(1, canvasHost.value.clientHeight),
    0.1,
    250
  )
  camera.position.set(0, EYE_HEIGHT, 0)
  applyCameraRotation()

  renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(canvasHost.value.clientWidth, canvasHost.value.clientHeight)
  canvasHost.value.appendChild(renderer.domElement)

  scene.add(new T.HemisphereLight(0xdff0ff, 0x2b3646, 1.15))
  const sun = new T.DirectionalLight(0xffffff, 1.25)
  sun.position.set(6, 11, 4)
  scene.add(sun)

  const ground = new T.Mesh(
    new T.PlaneGeometry(160, 160),
    new T.MeshStandardMaterial({ color: 0x2b3342, roughness: 0.96, metalness: 0 })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const grid = new T.GridHelper(160, 80, 0x4c5a72, 0x3a4456)
  grid.position.y = 0.012
  scene.add(grid)

  raycaster = new T.Raycaster()
  viewCenter = new T.Vector2(0, 0)

  ready.value = true
  // 设置阶段就把目标摆出来，和 2D 版一样「所见即开局」
  rebuildTargets()
  rafId = requestAnimationFrame(loop)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvasHost.value)
  }
}

function handleResize() {
  if (!renderer || !camera || !canvasHost.value) return
  const width = canvasHost.value.clientWidth
  const height = Math.max(1, canvasHost.value.clientHeight)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// ---------------------------------------------------------------------------
// 一局的生命周期
// ---------------------------------------------------------------------------

function start() {
  if (!ready.value) return
  const now = performance.now()

  hits.value = 0
  misses.value = 0
  reactions = []
  lastRecord.value = null
  moveError = 0
  fireError = 0
  crosshairError.value = 0
  clockMs = 0
  elapsedMs.value = 0
  remainingMs.value = isTimed.value ? config.value.duration * 1000 : 0
  startAt = now
  lastTs = 0
  nextTeleportAt = now + fpsTeleportInterval(config.value.speed)

  rebuildTargets()
  saveFpsConfig(config.value)
  phase.value = 'playing'
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

  const record: AimTrainFpsRecord = {
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
  records.value = appendFpsRecord(record)
  remainingMs.value = 0
  phase.value = 'finished'

  if (document.pointerLockElement) document.exitPointerLock()
  disposeTargetObjects()
  targets = []
}

function reset() {
  cancelAnimationFrame(rafId)
  rafId = 0
  disposeTargetObjects()
  targets = []
  hits.value = 0
  misses.value = 0
  remainingMs.value = 0
  elapsedMs.value = 0
  crosshairError.value = 0
  reactions = []
  phase.value = 'idle'
  if (document.pointerLockElement) document.exitPointerLock()
  // 回到设置界面：把目标重新摆出来当预览，并恢复渲染循环
  rebuildTargets()
  if (!rafId && ready.value) rafId = requestAnimationFrame(loop)
}

function clearHistory() {
  clearFpsRecords()
  records.value = []
}

/** 把某个目标挪到扇形区域里的新位置，反应计时从这里重新开始 */
function respawnTarget(id: number, now: number) {
  const target = targets.find((item) => item.id === id)
  if (!target) return
  const fresh = spawnFpsTarget(config.value, id, now)
  target.baseX = fresh.baseX
  target.baseY = fresh.baseY
  target.baseZ = fresh.baseZ
  target.phaseX = fresh.phaseX
  target.phaseY = fresh.phaseY
  target.phaseZ = fresh.phaseZ
  target.bornAt = now
  // mesh 位置在下一帧统一更新
}

function fire() {
  if (phase.value !== 'playing' || !raycaster || !camera || !viewCenter) return

  fireError = 1

  raycaster.setFromCamera(viewCenter, camera)
  const candidates = [...targetObjects.values()].map((object) => object.hitSphere)
  const intersections = raycaster.intersectObjects(candidates, false)

  const first = intersections[0]
  if (!first) {
    misses.value++
    return
  }

  const id = Number(first.object.userData.targetId)
  const target = targets.find((item) => item.id === id)
  if (!target) {
    misses.value++
    return
  }

  const now = performance.now()
  reactions.push(now - target.bornAt)
  hits.value++
  respawnTarget(id, now)
}

// ---------------------------------------------------------------------------
// 输入
// ---------------------------------------------------------------------------

function onPointerDown() {
  if (phase.value === 'idle') {
    // 必须在用户手势里请求指针锁定
    stage.value?.requestPointerLock?.()
    start()
    return
  }
  if (phase.value !== 'playing') return
  if (!locked.value) {
    stage.value?.requestPointerLock?.()
    return
  }
  fire()
}

function onMouseMove(event: MouseEvent) {
  if (!locked.value || phase.value !== 'playing') return

  yaw -= event.movementX * SENSITIVITY
  pitch -= event.movementY * SENSITIVITY
  const limit = Math.PI / 2 - 0.02
  pitch = Math.max(-limit, Math.min(limit, pitch))
  applyCameraRotation()

  // 移动误差：鼠标动得越快，扩散越强，之后按帧衰减
  const magnitude = Math.hypot(event.movementX, event.movementY)
  moveError = Math.min(1, moveError + magnitude / 70)
}

function onPointerLockChange() {
  locked.value = document.pointerLockElement === stage.value
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && locked.value) {
    document.exitPointerLock()
  }
}

// ---------------------------------------------------------------------------
// 主循环
// ---------------------------------------------------------------------------

function loop(timestamp: number) {
  if (disposed) return
  rafId = requestAnimationFrame(loop)
  if (!renderer || !scene || !camera) return

  const active = phase.value === 'playing' && locked.value

  if (active) {
    const delta = lastTs ? Math.min(64, timestamp - lastTs) : 16
    lastTs = timestamp
    clockMs = timestamp - startAt
    elapsedMs.value = clockMs

    if (isTimed.value) {
      const left = config.value.duration * 1000 - clockMs
      remainingMs.value = Math.max(0, left)
      if (left <= 0) {
        finish()
        return
      }
    }

    if (config.value.moving && config.value.moveMode === 'teleport' && timestamp >= nextTeleportAt) {
      nextTeleportAt = timestamp + fpsTeleportInterval(config.value.speed)
      const now = performance.now()
      for (const target of targets) respawnTarget(target.id, now)
    }

    for (const target of targets) {
      const object = targetObjects.get(target.id)
      if (!object) continue
      const position = fpsPositionAt(target, config.value, clockMs)
      object.group.position.set(position.x, position.y, position.z)
    }

    // 误差按帧衰减，取移动与射击里更强的那一个
    moveError *= 0.9
    fireError *= 0.86
    crosshairError.value = Math.max(moveError, fireError) < 0.01
      ? 0
      : Math.min(1, Math.max(moveError, fireError))
  } else {
    lastTs = 0
  }

  renderer.render(scene, camera)
}

onMounted(async () => {
  config.value = loadFpsConfig()
  records.value = loadFpsRecords()
  // 准星配置独立存储，和准星本身的模块放在一起会绕圈，这里直接读
  try {
    const raw = window.localStorage.getItem('aim-train-fps:crosshair:v1')
    if (raw) {
      const parsed = JSON.parse(raw) as CrosshairConfig
      if (parsed && typeof parsed === 'object') crosshair.value = { ...cloneCrosshair(DEFAULT_CROSSHAIR), ...parsed }
    }
  } catch {
    // 读不出来就用默认准星
  }

  document.addEventListener('pointerlockchange', onPointerLockChange)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('keydown', onKeyDown)

  await initThree()
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(rafId)
  rafId = 0
  resizeObserver?.disconnect()
  resizeObserver = null

  document.removeEventListener('pointerlockchange', onPointerLockChange)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('keydown', onKeyDown)
  if (document.pointerLockElement) document.exitPointerLock()

  disposeTargetObjects()
  renderer?.dispose()
  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  renderer = null
  scene = null
  camera = null
  raycaster = null
})

// 准星改动随时落库
watch(
  crosshair,
  (value) => {
    try {
      window.localStorage.setItem('aim-train-fps:crosshair:v1', JSON.stringify(value))
    } catch {
      // 忽略
    }
  },
  { deep: true }
)

// 设置阶段改目标种类或大小，直接把预览场景里的目标换掉，做到「所见即开局」
watch(
  () => [config.value.targetKind, config.value.targetSize, config.value.targetCount],
  () => {
    if (phase.value === 'idle' && ready.value) rebuildTargets()
  }
)
</script>

<template>
  <div class="space-y-4">
    <!-- 3D 画面 + 准星 + HUD。整个区域禁止选中：游戏时鼠标一直是按住拖的节奏 -->
    <div
      ref="stage"
      class="relative h-[62vh] max-h-[660px] min-h-[360px] touch-none select-none overflow-hidden rounded-xl border border-line bg-[#151a24]"
      :class="locked && 'cursor-none'"
      @pointerdown="onPointerDown"
      @contextmenu.prevent
    >
      <div ref="canvasHost" class="absolute inset-0" />

      <Crosshair
        v-if="phase === 'playing'"
        :config="crosshair"
        :error="crosshairError"
      />

      <!-- HUD -->
      <div
        v-if="phase === 'playing'"
        class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4 py-3 text-sm"
      >
        <span
          class="rounded-full bg-black/55 px-3 py-1 font-mono font-semibold tabular-nums text-white"
        >
          <span v-if="!isTimed" class="font-sans text-xs text-white/70">已用 </span>{{ clockText }}
        </span>
        <span class="rounded-full bg-black/55 px-3 py-1 text-white/85">
          命中 <span class="font-semibold text-white">{{ hits }}</span>
          · 脱靶 <span class="font-semibold text-white">{{ misses }}</span>
        </span>
      </div>

      <!-- 未锁定鼠标时提示继续，此时计时暂停 -->
      <div
        v-if="phase === 'playing' && !locked"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 px-6 text-center"
      >
        <p class="text-sm font-medium text-white">已暂停</p>
        <p class="text-xs text-white/70">点击画面继续瞄准（Esc 可随时退出鼠标锁定）</p>
      </div>

      <div
        v-if="phase === 'idle'"
        class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
      >
        <p v-if="!ready" class="text-sm text-white/70">正在加载 3D 场景…</p>
        <template v-else>
          <p class="text-sm font-medium text-white">点击画面开始，鼠标会锁定在窗口里</p>
          <p class="text-xs text-white/60">
            移动鼠标转视角，准星固定在屏幕中心，点击开火；Esc 退出锁定
          </p>
        </template>
      </div>
    </div>

    <template v-if="phase === 'idle'">
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <p class="mb-2 text-sm font-medium text-ink">游戏时长</p>
          <div class="flex flex-wrap gap-2" role="group" aria-label="游戏时长">
            <button
              v-for="option in DURATION_OPTIONS"
              :key="option.value"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
              :class="config.duration === option.value ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-soft hover:text-ink'"
              @click="config.duration = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div>
          <label for="fps-count" class="mb-2 flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
            目标数量
            <span class="text-xs font-normal text-ink-faint">同时存在</span>
          </label>
          <input
            id="fps-count"
            v-model.number="config.targetCount"
            type="range"
            :min="MIN_FPS_TARGETS"
            :max="MAX_FPS_TARGETS"
            step="1"
            class="w-full accent-accent"
          >
          <p class="mt-1 text-xs text-ink-faint">{{ config.targetCount }} 个 · 打掉一个立刻补一个</p>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-ink">目标物</p>
          <div class="flex flex-wrap gap-2" role="group" aria-label="目标物">
            <button
              v-for="kind in FPS_TARGET_OPTIONS"
              :key="kind.value"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
              :class="config.targetKind === kind.value ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-soft hover:text-ink'"
              @click="config.targetKind = kind.value"
            >
              {{ kind.label }}
            </button>
          </div>
          <p class="mt-1 text-xs text-ink-faint">{{ activeKindHint }}</p>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-ink">目标大小</p>
          <div class="flex flex-wrap gap-2" role="group" aria-label="目标大小">
            <button
              v-for="size in FPS_SIZE_OPTIONS"
              :key="size.value"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
              :class="config.targetSize === size.value ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-soft hover:text-ink'"
              @click="config.targetSize = size.value"
            >
              {{ size.label }}
            </button>
          </div>
          <p class="mt-1 text-xs text-ink-faint">
            {{ FPS_SIZE_OPTIONS.find((item) => item.value === config.targetSize)?.hint }}；屏幕上多大取决于距离
          </p>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-ink">移动</p>
          <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input v-model="config.moving" type="checkbox" class="size-4 accent-accent">
            让目标动起来
          </label>
        </div>

        <div :class="!config.moving && 'opacity-50'">
          <p class="mb-2 text-sm font-medium text-ink">移动方式</p>
          <div class="flex flex-wrap gap-2" role="group" aria-label="移动方式">
            <button
              v-for="mode in FPS_MOVE_MODE_OPTIONS"
              :key="mode.value"
              type="button"
              :disabled="!config.moving"
              class="rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed"
              :class="config.moveMode === mode.value ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-soft hover:text-ink'"
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
              :class="config.speed === speed.value ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-soft hover:text-ink'"
              @click="config.speed = speed.value"
            >
              {{ speed.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="mb-2 flex items-baseline justify-between text-sm font-medium text-ink">
            刷新水平角
            <span class="text-xs font-normal tabular-nums text-ink-faint">±{{ config.horizontalSpread }}°</span>
          </label>
          <input
            v-model.number="config.horizontalSpread"
            type="range"
            :min="FPS_SPREAD_LIMITS.horizontal.min"
            :max="FPS_SPREAD_LIMITS.horizontal.max"
            step="1"
            class="w-full accent-accent"
          >
        </div>

        <div>
          <label class="mb-2 flex items-baseline justify-between text-sm font-medium text-ink">
            刷新垂直角
            <span class="text-xs font-normal tabular-nums text-ink-faint">±{{ config.verticalSpread }}°</span>
          </label>
          <input
            v-model.number="config.verticalSpread"
            type="range"
            :min="FPS_SPREAD_LIMITS.vertical.min"
            :max="FPS_SPREAD_LIMITS.vertical.max"
            step="1"
            class="w-full accent-accent"
          >
          <p class="mt-1 text-xs text-ink-faint">不为 0 时目标就可能悬在半空</p>
        </div>

        <div class="sm:col-span-2">
          <p class="mb-2 text-sm font-medium text-ink">刷新距离</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="flex items-baseline justify-between text-xs text-ink-soft">
                最近
                <span class="tabular-nums text-ink">{{ config.minDistance }} m</span>
              </span>
              <input
                v-model.number="config.minDistance"
                type="range"
                :min="FPS_SPREAD_LIMITS.distance.min"
                :max="FPS_SPREAD_LIMITS.distance.max"
                step="1"
                class="w-full accent-accent"
              >
            </label>
            <label class="block">
              <span class="flex items-baseline justify-between text-xs text-ink-soft">
                最远
                <span class="tabular-nums text-ink">{{ config.maxDistance }} m</span>
              </span>
              <input
                v-model.number="config.maxDistance"
                type="range"
                :min="FPS_SPREAD_LIMITS.distance.min"
                :max="FPS_SPREAD_LIMITS.distance.max"
                step="1"
                class="w-full accent-accent"
              >
            </label>
          </div>
        </div>
      </div>

      <details class="rounded-xl border border-line bg-surface p-4">
        <summary class="cursor-pointer text-sm font-medium text-ink">
          准星设置（可粘贴无畏契约分享码）
        </summary>
        <div class="mt-4">
          <CrosshairEditor v-model="crosshair" />
        </div>
      </details>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          @click="onPointerDown"
        >
          {{ isTimed ? `开始训练（${config.duration} 秒）` : '开始训练（不限时）' }}
        </button>
        <p class="text-xs text-ink-faint">
          开始后鼠标会锁定，按 Esc 退出；成绩只保存在这台设备的浏览器里
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
          {{ fpsTargetLabel(config.targetKind) }} · {{ config.targetCount }} 个 ·
          {{ config.moving ? config.moveMode : '静止' }} · ±{{ config.horizontalSpread }}°/±{{ config.verticalSpread }}° ·
          {{ config.minDistance }}–{{ config.maxDistance }}m
        </p>
      </div>
    </template>

    <template v-else-if="lastRecord">
      <SectionPanel title="本次成绩">
        <template #action>
          <span class="text-right text-xs text-ink-faint">
            {{ fpsTargetLabel(lastRecord.config.targetKind) }} · {{ lastRecord.config.targetCount }} 个
          </span>
        </template>
        <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="rounded-lg border border-accent bg-surface-strong px-3 py-2.5">
            <dt class="text-xs text-ink-faint">KPM（命中/分钟）</dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums text-ink">{{ formatKpm(lastRecord.kpm) }}</dd>
          </div>
          <div class="rounded-lg border border-line bg-surface-strong px-3 py-2.5">
            <dt class="text-xs text-ink-faint">命中</dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums text-ink">{{ lastRecord.hits }}</dd>
          </div>
          <div class="rounded-lg border border-line bg-surface-strong px-3 py-2.5">
            <dt class="text-xs text-ink-faint">脱靶</dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums text-ink">{{ lastRecord.misses }}</dd>
          </div>
          <div class="rounded-lg border border-line bg-surface-strong px-3 py-2.5">
            <dt class="text-xs text-ink-faint">命中率</dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums text-ink">{{ formatAccuracy(lastRecord.accuracy) }}</dd>
          </div>
          <div class="rounded-lg border border-line bg-surface-strong px-3 py-2.5">
            <dt class="text-xs text-ink-faint">平均反应</dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums text-ink">{{ formatReaction(lastRecord.avgReactionMs) }}</dd>
          </div>
          <div class="rounded-lg border border-line bg-surface-strong px-3 py-2.5">
            <dt class="text-xs text-ink-faint">最快反应</dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums text-ink">{{ formatReaction(lastRecord.bestReactionMs) }}</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-ink-faint">实际游玩 {{ formatElapsed(lastRecord.durationMs) }}。</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            @click="start"
          >
            再来一局
          </button>
          <button
            type="button"
            class="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            @click="reset"
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
            @click="clearHistory"
          >
            清空
          </button>
        </template>
        <p v-if="!records.length" class="text-sm text-ink-soft">还没有记录。</p>
        <ul v-else class="space-y-2">
          <li
            v-for="item in records"
            :key="item.at"
            class="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-surface-strong px-3 py-2"
            :class="item.at === lastRecord.at && 'border-accent'"
          >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm text-ink">
                {{ fpsTargetLabel(item.config.targetKind) }} · {{ item.config.targetCount }} 个 ·
                {{ item.config.moving ? item.config.moveMode : '静止' }} ·
                {{ item.config.minDistance }}–{{ item.config.maxDistance }}m
              </span>
              <span class="block text-xs text-ink-faint">
                {{ item.at.slice(0, 16).replace('T', ' ') }} · 玩了 {{ formatElapsed(item.durationMs) }}
              </span>
            </span>
            <span class="shrink-0 text-right">
              <span class="block text-sm font-semibold tabular-nums text-ink">{{ formatKpm(item.kpm) }}</span>
              <span class="block text-xs text-ink-faint">KPM · {{ formatAccuracy(item.accuracy) }}</span>
            </span>
          </li>
        </ul>
      </SectionPanel>
    </template>
  </div>
</template>
