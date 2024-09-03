<script lang="ts">
interface Props {
  platform: string
  cluster: string
  type: ServiceMapNodeTypeEnum
  timeRange: TimeRange
}
</script>

<script setup lang="ts">
import {
  DefaultApi,
  QueryForType,
  ServiceMapNodeTypeEnum,
  SpanStatus,
  TimeRangeType,
  TraceApi,
  type InstanceResponse,
  type TimeRange
} from '@/api'
import { configuration } from '@/utils/http'
import { computed, h, ref } from 'vue'
import { useRequest } from 'vue-request'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import TomcatStatusTrend from '../Trends/TomcatStatusTrend.vue'
import HeatmapTrend from '../Trends/HeatmapTrend.vue'
import router from '@/router'
import { toFieldConditions } from '@/components/shared/QueryFilters'

const props = defineProps<Props>()

const showInstances = ref<boolean>(false)
const instance = ref<string>('')
const defaultApi = new DefaultApi(configuration)
const traceApi = new TraceApi(configuration)

const { data, refresh } = useRequest(
  () => {
    const { timeType, fromTime, toTime, recentSeconds } = props.timeRange

    if (props.type === ServiceMapNodeTypeEnum.Software) {
      return defaultApi.listSoftwareInstances(
        props.platform,
        props.cluster,
        timeType,
        fromTime,
        toTime,
        recentSeconds
      )
    }

    return defaultApi.listAppInstances(
      props.platform,
      props.cluster,
      timeType,
      fromTime,
      toTime,
      recentSeconds
    )
  },
  {
    refreshDeps: [() => props.platform, () => props.cluster, () => props.timeRange],
    refreshDepsAction() {
      refresh()
    },
    onSuccess() {
      const value = data.value?.data.data[0]

      if (value) {
        selectedRowKeys.value = [value.name]
      }
    }
  }
)

const instances = computed(() => {
  if (!data.value) {
    return []
  }

  return data.value.data.data
})

const columns = ref([
  {
    title: '初因应用实例',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '相关监控',
    dataIndex: 'resources',
    key: 'resources',
    width: 150
  }
])

const granularity = computed(() => {
  if (!props.timeRange) {
    return
  }

  if (props.timeRange.timeType === TimeRangeType.RECENT && props.timeRange.recentSeconds) {
    return Math.round(props.timeRange.recentSeconds / 10)
  }

  if (
    props.timeRange.timeType === TimeRangeType.DESIGNATED &&
    props.timeRange.fromTime &&
    props.timeRange.toTime
  ) {
    return Math.round((props.timeRange.toTime - props.timeRange.fromTime) / 1000 / 10)
  }
})

const rowKey = (record: InstanceResponse) => record.name
const selectedRowKeys = ref<string[]>([])

const rowSelection = {
  fixed: true,
  type: 'radio',
  selectedRowKeys: selectedRowKeys,
  onChange: (rowKeys: string[], selectedRows: InstanceResponse[]) => {
    instance.value = selectedRows[0].name
    selectedRowKeys.value = rowKeys
  }
}

const clusterFieldConditions = computed(() => {
  return [
    {
      name: {
        name: `ResourceAttributes['service.platform']`,
        displayName: '服务平面'
      },
      operator: {
        name: '=',
        displayName: '='
      },
      value: props.platform
    },
    {
      name: {
        name: `ResourceAttributes['k8s.deployment.name']`,
        displayName: 'Kubernetes服务名称'
      },
      operator: {
        name: '=',
        displayName: '='
      },
      value: props.cluster
    }
  ]
})

const instanceFieldConditions = computed(() => {
  if (!instance.value) {
    return
  }

  return [
    ...clusterFieldConditions.value,
    {
      name: {
        name: `ResourceAttributes['k8s.pod.name']`,
        displayName: 'KubernetesPod名称'
      },
      operator: {
        name: '=',
        displayName: '='
      },
      value: instance.value
    }
  ]
})

const { data: clusterSnapshotData, refresh: refreshClusterSnapshot } = useRequest(
  () => {
    return traceApi.createSpanSnapshot({
      fieldConditions: toFieldConditions(clusterFieldConditions.value),
      timeCondition: props.timeRange,
      // TODO: 支持不传statusConditions给默认结果
      statusConditions: [
        {
          status: SpanStatus.SUCCEED
        },
        {
          status: SpanStatus.BIZ_FAULT
        },
        {
          status: SpanStatus.SYS_FAULT
        }
      ],
      for: QueryForType.TRACE
    })
  },
  {
    refreshDeps: [() => clusterFieldConditions.value, () => props.timeRange],
    refreshDepsAction() {
      refreshClusterSnapshot()
    }
  }
)

const clusterSnapshotId = computed(() => {
  return clusterSnapshotData.value?.data.data
})

const { data: instanceSnapshotData, refresh: refreshInstaceSnapshot } = useRequest(
  () => {
    return traceApi.createSpanSnapshot({
      fieldConditions: toFieldConditions(instanceFieldConditions.value!),
      timeCondition: props.timeRange,
      // TODO: 支持不传statusConditions给默认结果
      statusConditions: [
        {
          status: SpanStatus.SUCCEED
        },
        {
          status: SpanStatus.BIZ_FAULT
        },
        {
          status: SpanStatus.SYS_FAULT
        }
      ],
      for: QueryForType.TRACE
    })
  },
  {
    ready: () => !!instanceFieldConditions.value,
    refreshDeps: [() => instanceFieldConditions.value, () => props.timeRange],
    refreshDepsAction() {
      refreshInstaceSnapshot()
    }
  }
)

const instaceSnapshotId = computed(() => {
  return instanceSnapshotData.value?.data.data
})

function openLink(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <div style="margin-left: 10px">
    <h3>{{ props.cluster }}</h3>

    <a-button
      type="primary"
      v-if="showInstances"
      :icon="h(RightOutlined)"
      @click="
        () => {
          showInstances = false
        }
      "
    >
      隐藏实例
    </a-button>

    <a-button
      type="primary"
      v-if="!showInstances"
      :icon="h(LeftOutlined)"
      @click="
        () => {
          showInstances = true

          instance = instances[0]?.name
        }
      "
    >
      查看实例
    </a-button>
  </div>

  <a-card
    v-if="showInstances"
    size="small"
    style="height: calc(100% - 6px); position: absolute; right: 100%; top: 30px"
  >
    <div class="instance-container">
      <div>
        <h4>实例列表</h4>

        <a-table
          v-if="instances"
          :show-header="false"
          :row-key="rowKey"
          :row-selection="rowSelection"
          :columns="columns"
          :data-source="instances"
          :scroll="{ x: '400px' }"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'resources'">
              <div class="resources">
                <div v-for="(resource, index) in record.resources" :key="index" class="resource">
                  <a :href="resource.monitorURL" target="_blank">
                    <img :src="resource.logo" :alt="resource.name" />
                  </a>
                </div>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <div style="padding-top: 11px">
        <div v-if="instaceSnapshotId">
          <HeatmapTrend
            :snapshotId="instaceSnapshotId"
            :type="'cluster'"
            :show-legend="false"
            :type-legend-postion="'bottom'"
            :granularity="granularity"
            @go-to-detail="
              (data) => {
                const routeData = router.resolve({
                  name: 'TracesList',
                  query: {
                    snapshotId: instaceSnapshotId,
                    conditions: JSON.stringify({
                      ...data,
                      fieldConditions: instanceFieldConditions
                    })
                  }
                })

                openLink(routeData.href)
              }
            "
            @show-diagnosis="
              (data) => {
                const name = 'DurationDiagnosis'

                const routeData = router.resolve({
                  name,
                  query: {
                    snapshotId: instaceSnapshotId,
                    conditions: JSON.stringify({
                      ...data,
                      statusConditions: [],
                      fieldConditions: instanceFieldConditions
                    })
                  }
                })

                openLink(routeData.href)
              }
            "
          />
        </div>

        <div>
          <TomcatStatusTrend
            :platform="props.platform"
            :cluster="props.cluster"
            :instance-name="instance"
            :time-range="props.timeRange"
          />
        </div>
      </div>
    </div>
  </a-card>

  <div>
    <div v-if="clusterSnapshotId">
      <HeatmapTrend
        v-if="props.type !== ServiceMapNodeTypeEnum.Software"
        :snapshotId="clusterSnapshotId"
        :type="'cluster'"
        :show-legend="false"
        :type-legend-postion="'bottom'"
        :granularity="granularity"
        @go-to-detail="
          (data) => {
            const routeData = router.resolve({
              name: 'TracesList',
              query: {
                snapshotId: clusterSnapshotId,
                conditions: JSON.stringify({
                  ...data,
                  fieldConditions: clusterFieldConditions
                })
              }
            })

            openLink(routeData.href)
          }
        "
        @show-diagnosis="
          (data) => {
            const name = 'DurationDiagnosis'

            const routeData = router.resolve({
              name,
              query: {
                snapshotId: clusterSnapshotId,
                conditions: JSON.stringify({
                  ...data,
                  statusConditions: [],
                  fieldConditions: clusterFieldConditions
                })
              }
            })

            openLink(routeData.href)
          }
        "
      />
    </div>

    <div>
      <TomcatStatusTrend
        :platform="props.platform"
        :cluster="props.cluster"
        :time-range="props.timeRange"
      />
    </div>
  </div>
</template>

<style scoped>
.instance-container {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 10px;
}

@media screen and (max-width: 1200px) {
  .instance-container {
    width: 550px;
    grid-template-columns: 1fr 250px;
  }
}

.resources {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.resource img {
  height: 28px;
}
</style>
