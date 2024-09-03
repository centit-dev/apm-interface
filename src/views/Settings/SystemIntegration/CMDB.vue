<script setup lang="ts">
import { ref } from 'vue'

const serverUrl = ref('https://cmdb.somehost.com/cmdb_openapi')
</script>

<template>
  <a-card style="margin-top: 10px" title="CMDB API访问地址">
    <div class="field">
      <div class="label">服务器访问URL</div>

      <div class="content">
        <a-input v-model:value="serverUrl" style="width: 600px" />

        <a-button style="margin-left: 10px">测试</a-button>
        <a-button style="margin-left: 4px" type="primary">保存</a-button>
      </div>
    </div>
  </a-card>
</template>

<style scoped>
.field {
  display: flex;
  margin-bottom: 12px;
}

.label {
  width: 120px;
  line-height: 34px;
}

.content {
  flex-grow: 1;
}
</style>
