<script lang="ts">
// 精度: 纳秒
interface Props {
  totalDuration: number
  duration?: number
  startedAt?: number
  beginningTime?: number
  showTick?: boolean
  ticksCount?: number
}
</script>

<script setup lang="ts">
import { round } from 'lodash'
import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  showTick: false,
  ticksCount: 4
})

const tickText = (value: number) => {
  if (value === 0) {
    return '0'
  }

  if (value < 1_000) {
    return `${value}ns`
  }

  if (value < 1_000_000) {
    return `${round(value / 1_000, 2)}μs`
  }

  if (value < 1_000_000_000) {
    return `${round(value / 1_000_000, 2)}ms`
  }

  return `${round(value / 1_000_000_000, 2)}s`
}

const ticks = computed(() => {
  if (!props.showTick) {
    return
  }

  const arr = [0]

  const step = round(props.totalDuration / (props.ticksCount + 1))

  for (let i = 0; i < props.ticksCount; i++) {
    arr.push(step * (i + 1))
  }

  arr.push(props.totalDuration)

  return arr
})

const percentage = computed(() => {
  if (!props.duration) {
    return 0
  }

  return (props.duration / props.totalDuration) * 100
})

const offset = computed(() => {
  if (!props.startedAt || !props.beginningTime || !props.totalDuration) {
    return 0
  }

  return ((props.startedAt - props.beginningTime) / (props.totalDuration / 1_000_000)) * 100
})

const durationText = computed(() => {
  if (!props.duration) {
    return ''
  }

  return `${(props.duration / 1_000_000).toFixed(2)}ms`
})
</script>

<template>
  <div class="ruler" v-if="props.showTick">
    <div class="ticks" v-if="ticks">
      <div
        v-for="(tick, i) in ticks"
        :key="i"
        class="tick-container"
        :style="{
          left: i * (100 / (props.ticksCount + 1)) + '%'
        }"
        :class="{ last: i === ticks.length - 1 }"
      >
        <span class="tick">{{ tickText(tick) }}</span>
        <span class="mark"></span>
      </div>
    </div>
  </div>

  <div
    v-else
    class="ruler"
    :style="{
      '--rulerOffset': `${offset}%`
    }"
  >
    <a-progress :percent="percentage" :show-info="false" status="normal" />
    <div class="value">{{ durationText }}</div>
  </div>
</template>

<style scoped>
.ruler {
  position: relative;
}

.value {
  position: absolute;
  top: -12px;
  left: var(--rulerOffset);
}

:deep(.ant-progress) {
  position: absolute;
}

:deep(.ant-progress-bg) {
  left: var(--rulerOffset);
}
</style>

<style scoped lang="scss">
.ticks {
  height: 2px;
  background: black;
  position: relative;
  top: 10px;
}

.tick-container {
  position: absolute;
  top: -6px;

  &.last {
    .tick {
      right: 0;
      transform: none;
    }

    .mark {
      transform: translateX(-100%);
    }
  }

  .tick {
    position: absolute;
    transform: translateX(-50%);
    font-size: 10px;
    top: -15px;
  }

  .mark {
    position: absolute;
    display: block;
    width: 1px;
    height: 6px;
    background-color: black;
    border-top-left-radius: 1px;
    border-top-right-radius: 1px;
  }
}
</style>
