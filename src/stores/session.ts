import { createGlobalState, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { SessionData } from '@/interfaces/session-data'

export const useSessionState = createGlobalState(() => {
  const state = useStorage<SessionData>('session', null, localStorage, {
    serializer: {
      read: (v) => (v ? JSON.parse(v) : null),
      write: (v) => JSON.stringify(v)
    },
    listenToStorageChanges: true
  })

  // getters
  const isLoggedIn = computed(() => !!state.value?.user)

  // actions
  function login(data: SessionData) {
    state.value = data
  }

  function logout() {
    state.value = undefined
  }

  return { state, isLoggedIn, login, logout }
})
