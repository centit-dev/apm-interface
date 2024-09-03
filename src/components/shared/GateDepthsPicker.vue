<script lang="ts">
export interface GateDepthsPickerModelValue {
  inletDepth?: number
  outletDepth?: number
}

export interface Props {
  maxDepth?: number
}
</script>

<script lang="ts" setup>
import { reactive, ref, toRaw } from 'vue'
import { theme, Form } from 'ant-design-vue'
import { LoginOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons-vue'

const props = withDefaults(defineProps<Props>(), {
  maxDepth: 4
})

const depths = new Array(props.maxDepth).fill(0).map((_, index) => index + 1)

const modelValue = defineModel<GateDepthsPickerModelValue>()

const container = ref<HTMLDivElement>()

const originalValue = {
  ...modelValue.value
}

const value = reactive({
  ...modelValue.value
})

const { useToken } = theme
const { token } = useToken()

const show = ref(false)
const position = ref({ top: 0, left: 0 })

const formItemContext = Form.useInjectFormItemContext()

function toggleDropdown() {
  show.value = !show.value

  if (container.value) {
    const { top, left } = container.value.getBoundingClientRect()

    position.value = {
      top: top + 36,
      left
    }
  }
}

function save() {
  show.value = false

  modelValue.value = toRaw(value)

  formItemContext.onFieldChange()
}

function cancel() {
  value.inletDepth = originalValue.inletDepth
  value.outletDepth = originalValue.outletDepth

  show.value = false
}
</script>

<template>
  <div class="container" ref="container" @click="toggleDropdown">
    <div class="inlet">
      <LoginOutlined class="icon" />

      {{ value?.inletDepth }}
    </div>

    <div class="outlet">
      <LogoutOutlined class="icon" />

      {{ value?.outletDepth }}
    </div>

    <DownOutlined style="margin-left: auto; cursor: pointer" />

    <Teleport to="body">
      <div
        v-if="show"
        class="dropdown"
        :style="{
          top: position.top + 'px',
          left: position.left + 'px'
        }"
      >
        <table class="options">
          <tr>
            <td>入口深度</td>
            <td>出口深度</td>
          </tr>

          <tr v-for="(depth, index) in depths" :key="index">
            <td>
              <div
                class="value"
                :class="{ selected: value?.inletDepth === depth }"
                @click="
                  () => {
                    value.inletDepth = depth
                  }
                "
              >
                <span>{{ depth }}</span>
              </div>
            </td>

            <td>
              <div
                class="value"
                :class="{ selected: value?.outletDepth === depth }"
                @click="
                  () => {
                    value.outletDepth = depth
                  }
                "
              >
                <span>{{ depth }}</span>
              </div>
            </td>
          </tr>
        </table>

        <div class="actions">
          <a-button
            type="primary"
            :disabled="!value.inletDepth || !value.outletDepth"
            @click="save"
          >
            确定
          </a-button>

          <a-button @click="cancel">取消</a-button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.container {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 0 11px;
  display: flex;
  gap: 10px;
  height: 32px;
  width: 130px;

  &:hover {
    border-color: v-bind(token.colorPrimaryBorderHover);
  }
}

.inlet,
.outlet {
  width: 30px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.icon {
  color: v-bind(token.colorInfoText);
}

.dropdown {
  position: absolute;
  background-color: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.options {
  width: 100%;
}

.options td {
  text-align: center;
  height: 40px;
  color: rgba(0, 0, 0, 0.88);
  width: 100px;
}

.value {
  cursor: pointer;
  border-radius: 4px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.value.selected {
  background-color: #e6f4ff;

  &:hover {
    background-color: #e6f4ff;
  }
}
</style>
