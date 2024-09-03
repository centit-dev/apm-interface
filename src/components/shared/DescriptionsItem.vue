<script lang="ts">
interface DescriptionsItemProps {
  label?: string
  name: string
  value: string
}
</script>

<script lang="ts" setup>
const { label, name, value } = defineProps<DescriptionsItemProps>()
</script>

<template>
  <div>
    <div class="title">
      <span v-if="label" class="label">{{ label }}</span>
      <span class="name">{{ name }}</span>
    </div>

    <div class="value">{{ value }}</div>
  </div>
</template>

<style scoped>
.title {
  margin-bottom: 5px;
}

.label {
  padding: 2px 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-right: 5px;
}

.value {
  word-wrap: break-word;
  word-break: break-all;
}
</style>
