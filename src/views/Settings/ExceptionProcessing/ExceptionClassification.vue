<script setup lang="ts">
import { useRequest } from 'vue-request'
import { exceptionClassification } from '@/apis/server'
import { computed, reactive, ref } from 'vue'
import { theme } from 'ant-design-vue'
import EditingForm from './ExceptionClassification/EditingForm.vue'

const openEditModal = ref(false)
const editing = ref<any>()

interface FormState {
  name: string
  fullName: string
  identifyRootOnly: boolean
}

const { useToken } = theme
const { token } = useToken()

const selectedCategory = ref<string>()
const selectedException = ref<FormState>()

const { data, loading } = useRequest(
  () => {
    return exceptionClassification()
  },
  {
    onSuccess(data) {
      if (data.length > 0) {
        selectCategory(data[0])
      }
    }
  }
)

const execptions = computed(() => {
  return data.value?.find((item) => item.name === selectedCategory.value)?.exceptions
})

const formState = reactive<FormState>({
  name: '',
  fullName: '',
  identifyRootOnly: false
})

function selectCategory(category: any) {
  selectedCategory.value = category.name

  if (category.exceptions[0]) {
    selectException(category.exceptions[0])
  }
}

function selectException(execption: FormState) {
  selectedException.value = execption

  formState.name = execption.name
  formState.fullName = execption.fullName
  formState.identifyRootOnly = execption.identifyRootOnly
}

function save() {
  console.log(formState)
}
</script>

<template>
  <a-card style="margin-top: 10px" :loading="loading">
    <template #title>
      异常报错分类
      <span style="font-size: 14px; opacity: 0.7; margin-left: 10px">
        未配置分类的异常，全部默认为“其它”类，并当做应用异常来处理，不支持到中间件、数据库的关联。
      </span>
    </template>

    <div class="container">
      <div>
        <div class="sub-title">异常分类</div>

        <a-list size="small" bordered :data-source="data">
          <template #renderItem="{ item }">
            <a-list-item
              :class="{
                'ant-list-item-active': selectedCategory === item.name
              }"
              @click="() => selectCategory(item)"
            >
              {{ item.name }}
            </a-list-item>
          </template>

          <template #footer>
            <a-space>
              <a-button
                @click="
                  () => {
                    openEditModal = true
                  }
                "
                >添加</a-button
              >
              <a-button>删除</a-button>
              <a-button
                @click="
                  () => {
                    openEditModal = true
                    editing = {
                      name: selectedCategory
                    }
                  }
                "
                >改名</a-button
              >
            </a-space>
          </template>
        </a-list>
      </div>

      <div>
        <div class="sub-title">异常列表</div>

        <a-list v-if="selectedCategory" size="small" bordered :data-source="execptions">
          <template #renderItem="{ item }">
            <a-list-item
              :class="{
                'ant-list-item-active': selectedException?.name === item.name
              }"
              @click="() => selectException(item)"
            >
              {{ item.name }}
            </a-list-item>
          </template>

          <template #footer>
            <a-space>
              <a-button
                @click="
                  () => {
                    formState.name = ''
                    formState.fullName = ''
                    formState.identifyRootOnly = false
                  }
                "
                >添加</a-button
              >
              <a-button>删除</a-button>
            </a-space>
          </template>
        </a-list>
      </div>

      <div>
        <div class="sub-title">异常定义</div>

        <a-form :model="formState" @finish="save" layout="vertical">
          <a-form-item name="name" label="短名">
            <a-input v-model:value="formState.name" />
          </a-form-item>

          <a-form-item name="fullName" label="全名">
            <a-textarea v-model:value="formState.fullName" :rows="5" />
          </a-form-item>

          <a-form-item name="identifyRootOnly">
            <a-checkbox v-model:checked="formState.identifyRootOnly">仅识别根异常</a-checkbox>
          </a-form-item>

          <a-button type="primary" html-type="submit" :loading="loading"> 保存 </a-button>
        </a-form>
      </div>
    </div>

    <a-modal v-model:open="openEditModal" title="异常分类" @ok="save" destroyOnClose>
      <EditingForm v-model="editing" />
    </a-modal>
  </a-card>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 10px;
}

.sub-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

:deep(.ant-list-item) {
  cursor: pointer;
}

.ant-list-item-active {
  background-color: v-bind('token.colorInfoBgHover');
}
</style>
