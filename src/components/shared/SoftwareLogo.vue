<script lang="ts">
interface Props {
  name: string
  href?: string
}
</script>
<script setup lang="ts">
import type { Software } from '@/api'
import { useSoftwaresState } from '@/stores/softwares'
import { ref, watch } from 'vue'

const { getSoftware } = useSoftwaresState()

const props = defineProps<Props>()

const software = ref<Software>()

watch(
  () => props.name,
  (name) => {
    software.value = getSoftware(name)
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div v-if="software" class="software-logo">
    <a v-if="props.href" :href="props.href">
      <img :src="software.logo" :alt="software.displayName" />
    </a>

    <img v-else :src="software.logo" :alt="software.displayName" />
  </div>

  <div v-else>
    <span>{{ props.name }}</span>
  </div>
</template>

<style scoped>
.software-logo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
