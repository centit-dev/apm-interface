<script setup lang="ts">
import CMDB from './SystemIntegration/CMDB.vue'
import CollectorConfig from './SystemIntegration/CollectorConfig.vue'
import Kafka from './SystemIntegration/Kafka.vue'
import Prometheus from './SystemIntegration/Prometheus.vue'
</script>

<template>
  <CMDB />

  <CollectorConfig />

  <Prometheus />

  <Kafka />
</template>
