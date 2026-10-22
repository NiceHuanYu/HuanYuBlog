<script setup lang="ts">
import {
  CROSSHAIR_COLORS,
  CROSSHAIR_LIMITS,
  cloneCrosshair,
  DEFAULT_CROSSHAIR,
  encodeCrosshairCode,
  normalizeHex,
  parseCrosshairCode,
  type CrosshairConfig,
  type CrosshairLine
} from '~/utils/crosshair'

const config = defineModel<CrosshairConfig>({ required: true })

const codeInput = ref('')
const importMessage = ref('')
const importOk = ref(false)
const copied = ref(false)

const exported = computed(() => encodeCrosshairCode(config.value))

type Which = 'inner' | 'outer'
type NumberKey =
  | 'thickness'
  | 'length'
  | 'verticalLength'
  | 'offset'
  | 'opacity'
  | 'movementMultiplier'
  | 'firingMultiplier'

interface FieldSpec {
  key: NumberKey
  label: string
  min: number
  max: number
  step: number
}

function limitsFor(which: Which, key: NumberKey) {
  if (key === 'thickness') return CROSSHAIR_LIMITS.lineThickness
  if (key === 'length' || key === 'verticalLength') return CROSSHAIR_LIMITS.lineLength
  // 外线的偏移上限比内线大（社区实例里外线出现过 40）
  if (key === 'offset') {
    return which === 'inner' ? CROSSHAIR_LIMITS.lineOffset : CROSSHAIR_LIMITS.outerOffset
  }
  if (key === 'opacity') return CROSSHAIR_LIMITS.opacity
  return CROSSHAIR_LIMITS.errorMultiplier
}

function fieldsFor(which: Which): FieldSpec[] {
  const line = config.value[which]
  const specs: FieldSpec[] = [
    { key: 'thickness', label: '线宽', ...limitsFor(which, 'thickness') },
    {
      key: 'length',
      label: line.linkedLength ? '长度' : '水平长度',
      ...limitsFor(which, 'length')
    }
  ]
  if (!line.linkedLength) {
    specs.push({ key: 'verticalLength', label: '垂直长度', ...limitsFor(which, 'verticalLength') })
  }
  specs.push({ key: 'offset', label: '距中心偏移', ...limitsFor(which, 'offset') })
  specs.push({ key: 'opacity', label: '不透明度', ...limitsFor(which, 'opacity') })
  return specs
}

const lineSections = computed(() => [
  { key: 'inner' as Which, title: '内线', fields: fieldsFor('inner') },
  { key: 'outer' as Which, title: '外线', fields: fieldsFor('outer') }
])

function setTop<K extends keyof CrosshairConfig>(key: K, value: CrosshairConfig[K]) {
  config.value = { ...config.value, [key]: value }
}

function setLine(which: Which, patch: Partial<CrosshairLine>) {
  config.value = { ...config.value, [which]: { ...config.value[which], ...patch } }
}

function setLineNumber(which: Which, key: NumberKey, value: number) {
  setLine(which, { [key]: value } as Partial<CrosshairLine>)
}

function valueOf(which: Which, key: NumberKey): number {
  return config.value[which][key]
}

/** 关闭「长度联动」时把垂直长度对齐到当前水平长度，免得一改就跳到很怪的值 */
function toggleLinkedLength(which: Which, linked: boolean) {
  const line = config.value[which]
  setLine(which, linked ? { linkedLength: true, verticalLength: line.length } : { linkedLength: false })
}

function importCode() {
  const parsed = parseCrosshairCode(codeInput.value)
  if (!parsed) {
    importMessage.value = '没解析出来。请粘贴完整的分享码，一般形如 0;P;c;1;o;1;0t;2;0l;4;0o;3;0a;1;1b;0'
    importOk.value = false
    return
  }
  config.value = parsed
  importMessage.value = '已套用。只读取了主准星（P 段），开镜与狙击镜的配置不参与'
  importOk.value = true
  codeInput.value = ''
}

function resetToDefault() {
  config.value = cloneCrosshair(DEFAULT_CROSSHAIR)
  importMessage.value = ''
}

/** 局域网 IP 下不是安全上下文，navigator.clipboard 可能不存在，要有兜底 */
function fallbackCopy(text: string) {
  const area = document.createElement('textarea')
  area.value = text
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  document.body.removeChild(area)
}

async function copyCode() {
  const text = exported.value
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      fallbackCopy(text)
    }
  } catch {
    fallbackCopy(text)
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<template>
  <div class="space-y-6">
    <!-- 预览 + 分享码 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div
        class="relative h-36 overflow-hidden rounded-lg border border-line bg-surface-strong"
      >
        <Crosshair :config="config" />
        <span class="absolute bottom-2 left-3 text-xs text-ink-faint">预览</span>
      </div>

      <div class="space-y-3">
        <div>
          <label for="crosshair-code" class="mb-1 block text-sm font-medium text-ink">
            分享码
          </label>
          <textarea
            id="crosshair-code"
            v-model="codeInput"
            rows="2"
            spellcheck="false"
            placeholder="粘贴无畏契约的准星分享码，例如 0;P;c;5;o;1;0t;2;0l;6;0o;3;0a;1;1b;0"
            class="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 font-mono text-xs text-ink placeholder:text-ink-faint"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            @click="importCode"
          >
            导入
          </button>
          <button
            type="button"
            class="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            @click="resetToDefault"
          >
            恢复默认
          </button>
        </div>

        <p
          v-if="importMessage"
          class="text-xs"
          :class="importOk ? 'text-ink-soft' : 'text-accent-ink'"
        >
          {{ importMessage }}
        </p>

        <div>
          <p class="mb-1 text-sm font-medium text-ink">当前准星代码</p>
          <div class="flex items-start gap-2">
            <code
              class="min-w-0 flex-1 break-all rounded-lg bg-surface-strong px-2.5 py-1.5 font-mono text-xs text-ink-soft"
            >{{ exported }}</code>
            <button
              type="button"
              class="shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
              @click="copyCode"
            >
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 颜色 -->
    <div>
      <p class="mb-2 text-sm font-medium text-ink">颜色</p>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="item in CROSSHAIR_COLORS"
          :key="item.index"
          type="button"
          class="size-7 rounded-md border-2 transition-transform hover:scale-110"
          :class="config.color === item.index ? 'border-accent' : 'border-line'"
          :style="{ backgroundColor: item.hex }"
          :title="item.label"
          :aria-label="item.label"
          :aria-pressed="config.color === item.index"
          @click="setTop('color', item.index)"
        />
        <label class="ml-1 inline-flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="radio"
            name="crosshair-color"
            :checked="config.color === 8"
            class="size-3.5 accent-accent"
            @change="setTop('color', 8)"
          >
          自定义
        </label>
        <input
          v-if="config.color === 8"
          type="color"
          :value="normalizeHex(config.customColor)"
          class="h-7 w-12 cursor-pointer rounded border border-line bg-surface"
          @input="setTop('customColor', normalizeHex(($event.target as HTMLInputElement).value))"
        >
      </div>
    </div>

    <!-- 轮廓与中心点 -->
    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            class="size-4 accent-accent"
            :checked="config.outlines"
            @change="setTop('outlines', ($event.target as HTMLInputElement).checked)"
          >
          轮廓
        </label>
        <div v-if="config.outlines" class="mt-3 space-y-3">
          <div>
            <label class="flex items-baseline justify-between text-xs text-ink-soft">
              轮廓粗细
              <span class="tabular-nums text-ink">{{ config.outlineThickness }}</span>
            </label>
            <input
              type="range"
              class="w-full accent-accent"
              :min="CROSSHAIR_LIMITS.outlineThickness.min"
              :max="CROSSHAIR_LIMITS.outlineThickness.max"
              :step="CROSSHAIR_LIMITS.outlineThickness.step"
              :value="config.outlineThickness"
              @input="setTop('outlineThickness', Number(($event.target as HTMLInputElement).value))"
            >
          </div>
          <div>
            <label class="flex items-baseline justify-between text-xs text-ink-soft">
              轮廓不透明度
              <span class="tabular-nums text-ink">{{ config.outlineOpacity }}</span>
            </label>
            <input
              type="range"
              class="w-full accent-accent"
              :min="CROSSHAIR_LIMITS.opacity.min"
              :max="CROSSHAIR_LIMITS.opacity.max"
              :step="CROSSHAIR_LIMITS.opacity.step"
              :value="config.outlineOpacity"
              @input="setTop('outlineOpacity', Number(($event.target as HTMLInputElement).value))"
            >
          </div>
        </div>
      </div>

      <div>
        <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            class="size-4 accent-accent"
            :checked="config.dot"
            @change="setTop('dot', ($event.target as HTMLInputElement).checked)"
          >
          中心点
        </label>
        <div v-if="config.dot" class="mt-3 space-y-3">
          <div>
            <label class="flex items-baseline justify-between text-xs text-ink-soft">
              点大小
              <span class="tabular-nums text-ink">{{ config.dotSize }}</span>
            </label>
            <input
              type="range"
              class="w-full accent-accent"
              :min="CROSSHAIR_LIMITS.dotSize.min"
              :max="CROSSHAIR_LIMITS.dotSize.max"
              :step="CROSSHAIR_LIMITS.dotSize.step"
              :value="config.dotSize"
              @input="setTop('dotSize', Number(($event.target as HTMLInputElement).value))"
            >
          </div>
          <div>
            <label class="flex items-baseline justify-between text-xs text-ink-soft">
              点不透明度
              <span class="tabular-nums text-ink">{{ config.dotOpacity }}</span>
            </label>
            <input
              type="range"
              class="w-full accent-accent"
              :min="CROSSHAIR_LIMITS.opacity.min"
              :max="CROSSHAIR_LIMITS.opacity.max"
              :step="CROSSHAIR_LIMITS.opacity.step"
              :value="config.dotOpacity"
              @input="setTop('dotOpacity', Number(($event.target as HTMLInputElement).value))"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 内线 / 外线 -->
    <div class="grid gap-6 sm:grid-cols-2">
      <div v-for="section in lineSections" :key="section.key" class="space-y-3">
        <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            class="size-4 accent-accent"
            :checked="config[section.key].show"
            @change="setLine(section.key, { show: ($event.target as HTMLInputElement).checked })"
          >
          {{ section.title }}
        </label>

        <template v-if="config[section.key].show">
          <div v-for="field in section.fields" :key="field.key">
            <label class="flex items-baseline justify-between text-xs text-ink-soft">
              {{ field.label }}
              <span class="tabular-nums text-ink">{{ valueOf(section.key, field.key) }}</span>
            </label>
            <input
              type="range"
              class="w-full accent-accent"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :value="valueOf(section.key, field.key)"
              @input="setLineNumber(section.key, field.key, Number(($event.target as HTMLInputElement).value))"
            >
          </div>

          <label class="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              class="size-3.5 accent-accent"
              :checked="config[section.key].linkedLength"
              @change="toggleLinkedLength(section.key, ($event.target as HTMLInputElement).checked)"
            >
            水平与垂直长度联动
          </label>

          <div class="space-y-2 rounded-lg border border-line bg-surface-strong px-3 py-2">
            <label class="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
              <input
                type="checkbox"
                class="size-3.5 accent-accent"
                :checked="config[section.key].movementError"
                @change="setLine(section.key, { movementError: ($event.target as HTMLInputElement).checked })"
              >
              移动误差
            </label>
            <label
              v-if="config[section.key].movementError"
              class="flex items-baseline justify-between text-xs text-ink-faint"
            >
              倍率
              <span class="tabular-nums text-ink-soft">{{ config[section.key].movementMultiplier }}</span>
            </label>
            <input
              v-if="config[section.key].movementError"
              type="range"
              class="w-full accent-accent"
              :min="CROSSHAIR_LIMITS.errorMultiplier.min"
              :max="CROSSHAIR_LIMITS.errorMultiplier.max"
              :step="CROSSHAIR_LIMITS.errorMultiplier.step"
              :value="config[section.key].movementMultiplier"
              @input="setLineNumber(section.key, 'movementMultiplier', Number(($event.target as HTMLInputElement).value))"
            >

            <label class="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
              <input
                type="checkbox"
                class="size-3.5 accent-accent"
                :checked="config[section.key].firingError"
                @change="setLine(section.key, { firingError: ($event.target as HTMLInputElement).checked })"
              >
              射击误差
            </label>
            <label
              v-if="config[section.key].firingError"
              class="flex items-baseline justify-between text-xs text-ink-faint"
            >
              倍率
              <span class="tabular-nums text-ink-soft">{{ config[section.key].firingMultiplier }}</span>
            </label>
            <input
              v-if="config[section.key].firingError"
              type="range"
              class="w-full accent-accent"
              :min="CROSSHAIR_LIMITS.errorMultiplier.min"
              :max="CROSSHAIR_LIMITS.errorMultiplier.max"
              :step="CROSSHAIR_LIMITS.errorMultiplier.step"
              :value="config[section.key].firingMultiplier"
              @input="setLineNumber(section.key, 'firingMultiplier', Number(($event.target as HTMLInputElement).value))"
            >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
