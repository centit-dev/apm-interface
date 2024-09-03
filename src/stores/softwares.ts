import { DefaultApi, type Software } from '@/api'
import { configuration } from '@/utils/http'
import { createGlobalState, useStorage } from '@vueuse/core'
import { watchEffect } from 'vue'
import { useRequest } from 'vue-request'

const key = 'softwares'

export const eagerLoadSoftwares = () => {
  const defaultApi = new DefaultApi(configuration)

  const { data } = useRequest(() => defaultApi.listSoftwares(), {
    cacheKey: key
  })

  watchEffect(() => {
    if (!data.value?.data) {
      return
    }

    const result: Record<string, Software> = {}

    data.value.data.data.forEach((software) => {
      result[software.name] = software
    })

    localStorage.setItem(key, JSON.stringify(result))
  })
}

export const useSoftwaresState = createGlobalState(() => {
  const state = useStorage<Record<string, Software>>(key, null, localStorage, {
    serializer: {
      read: (v) => (v ? JSON.parse(v) : null),
      write: (v) => JSON.stringify(v)
    },
    listenToStorageChanges: true
  })

  // getters
  function getSoftware(id: string) {
    return state.value?.[id]
  }

  function getLogoUrl(id: string) {
    const software = getSoftware(id)

    if (!software) {
      return ''
    }

    return software.logo
  }

  return { state, getSoftware, getLogoUrl }
})
