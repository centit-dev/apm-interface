<script setup lang="ts">
import RumHttpHeader from './DataProcessing/RumHttpHeader.vue'
import SpanFieldExtension from './DataProcessing/SpanFieldExtension.vue'
import SpanTranslation from './DataProcessing/SpanTranslation.vue'
import SpanCommonalitiesBlacklist from './DataProcessing/SpanCommonalitiesBlacklist.vue'
import SoftwareTypeIdentificationRules from './DataProcessing/SoftwareTypeIdentificationRules.vue'
import CustomFieldSettings from './DataProcessing/CustomFieldSettings.vue'
</script>

<template>
  <RumHttpHeader />

  <SpanFieldExtension />

  <SpanTranslation />

  <SpanCommonalitiesBlacklist />

  <SoftwareTypeIdentificationRules />

  <CustomFieldSettings />
</template>
