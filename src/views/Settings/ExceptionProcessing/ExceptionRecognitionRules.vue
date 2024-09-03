<script setup lang="ts">
import { appExceptionRules, systemExceptionRules } from '@/apis/server'
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import { type TableColumnsType } from 'ant-design-vue'
import { ref } from 'vue'
import { useRequest } from 'vue-request'

const { data: systemExceptionRulesData, loading: loadingSystemExceptionRulesData } = useRequest(
  () => {
    return systemExceptionRules()
  }
)

const { data: appExceptionRulesData, loading: loadingAppExceptionRules } = useRequest(() => {
  return appExceptionRules()
})

const columns = ref<TableColumnsType>([
  {
    title: '识别规则',
    dataIndex: 'rules',
    key: 'rules'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions',
    width: 120
  }
])

const timeout = ref(3000)
const identifySystemExceptions = ref(true)
const identifyAbnormalServiceInterruption = ref(false)
const identifyResponseTimeoutPropagation = ref(true)

function edit() {
  console.log('open dialog')
}
</script>

<template>
  <a-card style="margin-top: 10px" title="异常识别规则">
    <div class="field">
      <div class="label">响应超时标准:</div>

      <div class="content">
        <a-input v-model:value="timeout" addon-before=">=" addon-after="ms" style="width: 200px" />

        <a-button style="margin-left: 10px" type="primary">保存</a-button>
      </div>
    </div>

    <div class="field">
      <div class="label">系统异常识别规则:</div>

      <div class="content">
        <a-table
          :columns="columns"
          :data-source="systemExceptionRulesData"
          :pagination="false"
          :loading="loadingSystemExceptionRulesData"
        >
          <template #footer>
            <a-button>添加</a-button>
          </template>

          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'rules'" class="rules">
              <div class="rule" v-for="(rule, index) in record.rules" :key="index">
                <span class="rule-key">{{ rule.key }}</span>
                <span>{{ rule.value }}</span>
              </div>
            </div>

            <div v-if="column.key === 'actions'" class="actions">
              <EditOutlined @click="edit" />

              <a-popconfirm
                v-if="record.status === '失效'"
                title="确定要开启吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="
                  () => {
                    console.log('start')
                  }
                "
              >
                <PlayCircleOutlined />
              </a-popconfirm>

              <a-popconfirm
                v-if="record.status === '生效'"
                title="确定要禁用吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="
                  () => {
                    console.log('stop')
                  }
                "
              >
                <StopOutlined />
              </a-popconfirm>

              <a-popconfirm
                title="确定要删除吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="
                  () => {
                    console.log('delete')
                  }
                "
              >
                <DeleteOutlined />
              </a-popconfirm>
            </div>
          </template>
        </a-table>
      </div>
    </div>

    <div class="field">
      <div class="label">业务异常识别规则:</div>

      <div class="content">
        <a-table
          :columns="columns"
          :data-source="appExceptionRulesData"
          :pagination="false"
          :loading="loadingAppExceptionRules"
        >
          <template #footer>
            <a-button>添加</a-button>
          </template>

          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'rules'" class="rules">
              <div class="rule" v-for="(rule, index) in record.rules" :key="index">
                <span class="rule-key">{{ rule.key }}</span>
                <span>{{ rule.value }}</span>
              </div>
            </div>

            <div v-if="column.key === 'actions'" class="actions">
              <EditOutlined @click="edit" />

              <a-popconfirm
                v-if="record.status === '失效'"
                title="确定要开启吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="
                  () => {
                    console.log('start')
                  }
                "
              >
                <PlayCircleOutlined />
              </a-popconfirm>

              <a-popconfirm
                v-if="record.status === '生效'"
                title="确定要禁用吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="
                  () => {
                    console.log('stop')
                  }
                "
              >
                <StopOutlined />
              </a-popconfirm>

              <a-popconfirm
                title="确定要删除吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="
                  () => {
                    console.log('delete')
                  }
                "
              >
                <DeleteOutlined />
              </a-popconfirm>
            </div>
          </template>
        </a-table>
      </div>
    </div>

    <div class="field">
      <div class="label">识别系统异常遮断:</div>

      <div class="content">
        <a-switch
          v-model:checked="identifySystemExceptions"
          checked-children="启用"
          un-checked-children="禁用"
        />
      </div>
    </div>

    <div class="field">
      <div class="label">识别业务异常遮断:</div>

      <div class="content">
        <a-switch
          v-model:checked="identifyAbnormalServiceInterruption"
          checked-children="启用"
          un-checked-children="禁用"
        />
      </div>
    </div>

    <div class="field">
      <div class="label">识别响应超时传播:</div>

      <div class="content">
        <a-switch
          v-model:checked="identifyResponseTimeoutPropagation"
          checked-children="启用"
          un-checked-children="禁用"
        />
      </div>
    </div>
  </a-card>
</template>

<style scoped>
.field {
  display: flex;
  margin-bottom: 16px;
}

.label {
  width: 140px;
  line-height: 34px;
}

.content {
  flex-grow: 1;
}

.actions .anticon {
  cursor: pointer;
  font-size: 20px;
  margin-right: 5px;
}

.rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule {
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rule span {
  padding: 4px;
}

.rule-key {
  border-right: 1px solid #ccc;
}
</style>
