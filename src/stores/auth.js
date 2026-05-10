import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('at_token'))
  const user  = ref(JSON.parse(localStorage.getItem('at_user') || 'null'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    loading.value = true
    try {
      const data = await authService.login(email, password)
      token.value = data.access_token
      user.value  = data.user
      localStorage.setItem('at_token', data.access_token)
      localStorage.setItem('at_user', JSON.stringify(data.user))
      return data
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('at_token')
    localStorage.removeItem('at_user')
  }

  return { token, user, loading, isAuthenticated, login, logout }
})
