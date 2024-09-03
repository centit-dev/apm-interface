<script setup lang="ts">
import { reactive } from 'vue'
import { useSessionState } from '../stores/session'
import { useRouter } from 'vue-router'
import { loginApi } from '@/apis/server'
import { useRequest } from 'vue-request'
import type { SessionData } from '@/interfaces/session-data'

const router = useRouter()

interface FormState {
  username: string
  password: string
}

const formState = reactive<FormState>({
  username: '',
  password: ''
})

const { login, isLoggedIn } = useSessionState()

if (isLoggedIn.value) {
  router.replace('/')
}

const { run, loading } = useRequest(loginApi, {
  manual: true,
  onSuccess: (data: SessionData) => {
    login(data)

    router.replace('/')
  }
})

const onFinish = (values: any) => {
  console.log(values)

  run('admin', '123456')
}
</script>

<template>
  <div class="login-page">
    <a-form
      :model="formState"
      name="basic"
      autocomplete="off"
      class="login-form"
      @finish="onFinish"
    >
      <a-form-item
        label="用户名"
        :label-col="{ span: 4 }"
        name="username"
        :rules="[{ required: true, message: '请填写用户名' }]"
      >
        <a-input v-model:value="formState.username" />
      </a-form-item>

      <a-form-item
        label="密码"
        :label-col="{ span: 4 }"
        name="password"
        :rules="[{ required: true, message: '请填写密码' }]"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>

      <a-form-item>
        <a-button class="login-button" type="primary" html-type="submit" :loading="loading">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 400px;

  label {
    width: 70px;
  }
}

.login-button {
  float: right;
}
</style>
