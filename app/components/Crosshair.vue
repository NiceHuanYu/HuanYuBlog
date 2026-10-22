<script setup lang="ts">
import {
  crosshairColorHex,
  type CrosshairConfig,
  type CrosshairLine
} from '~/utils/crosshair'

const props = withDefaults(
  defineProps<{
    config: CrosshairConfig
    /**
     * 当前的误差扩散强度 0~1（移动越快、刚开火时越大）。
     * 具体每个方向扩散多少由线自己的误差开关与倍率决定。
     */
    error?: number
  }>(),
  { error: 0 }
)

const color = computed(() => crosshairColorHex(props.config))

/** 这条线当前应该往外扩散多少（倍率），没开误差就是 0 */
function spreadOf(line: CrosshairLine): number {
  if (!props.error) return 0
  if (!line.movementError && !line.firingError) return 0
  return props.error * line.movementMultiplier
}

interface BoxStyle {
  left: string
  top: string
  width: string
  height: string
  backgroundColor: string
  opacity: string
  boxShadow?: string
}

/** 轮廓用外扩的 box-shadow 画，不占布局尺寸 */
const outlineShadow = computed(() => {
  if (!props.config.outlines || props.config.outlineThickness <= 0) return undefined
  return `0 0 0 ${props.config.outlineThickness}px rgba(0, 0, 0, ${props.config.outlineOpacity})`
})

/**
 * 一条线展开成左右（或上下）两根。坐标系以准星中心为原点，
 * 所以右线从 offset 起向外画，左线从 -(offset + length) 起。
 */
function boxesOf(line: CrosshairLine, horizontal: boolean): BoxStyle[] {
  if (!line.show || line.thickness <= 0) return []

  const spread = spreadOf(line)
  const thickness = line.thickness
  const length = (horizontal ? line.length : line.verticalLength) * (1 + spread)
  const offset = line.offset * (1 + spread)

  const base = {
    backgroundColor: color.value,
    opacity: String(line.opacity),
    boxShadow: outlineShadow.value
  }

  if (horizontal) {
    return [
      {
        ...base,
        left: `${offset}px`,
        top: `${-thickness / 2}px`,
        width: `${length}px`,
        height: `${thickness}px`
      },
      {
        ...base,
        left: `${-(offset + length)}px`,
        top: `${-thickness / 2}px`,
        width: `${length}px`,
        height: `${thickness}px`
      }
    ]
  }

  return [
    {
      ...base,
      left: `${-thickness / 2}px`,
      top: `${offset}px`,
      width: `${thickness}px`,
      height: `${length}px`
    },
    {
      ...base,
      left: `${-thickness / 2}px`,
      top: `${-(offset + length)}px`,
      width: `${thickness}px`,
      height: `${length}px`
    }
  ]
}

const boxes = computed<BoxStyle[]>(() => [
  ...boxesOf(props.config.inner, true),
  ...boxesOf(props.config.inner, false),
  ...boxesOf(props.config.outer, true),
  ...boxesOf(props.config.outer, false)
])

/** 中心点是方块，和游戏里一致 */
const dotStyle = computed<BoxStyle | null>(() => {
  const size = props.config.dotSize
  if (!props.config.dot || size <= 0) return null
  return {
    left: `${-size / 2}px`,
    top: `${-size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color.value,
    opacity: String(props.config.dotOpacity),
    boxShadow: outlineShadow.value
  }
})
</script>

<template>
  <!-- 定位在父容器的正中心；容器本身是 0 尺寸的点，所有线都相对它绝对定位 -->
  <div class="pointer-events-none absolute left-1/2 top-1/2 z-10" aria-hidden="true">
    <span
      v-for="(box, index) in boxes"
      :key="index"
      class="absolute"
      :style="box"
    />
    <span v-if="dotStyle" class="absolute" :style="dotStyle" />
  </div>
</template>
