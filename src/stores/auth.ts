import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type LoginPayload } from '@/services/auth-service'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const email = ref<string | null>(localStorage.getItem('userEmail'))
  const role = ref<string | null>(localStorage.getItem('userRole'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isOwner = computed(() => role.value === 'OWNER')

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login(payload)
      token.value = res.token
      email.value = res.email
      role.value = res.role
      localStorage.setItem('token', res.token)
      localStorage.setItem('userEmail', res.email)
      localStorage.setItem('userRole', res.role)
    } catch (e: any) {
      error.value = e.message ?? 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    email.value = null
    role.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
  }

  return { token, email, role, loading, error, isAuthenticated, isAdmin, isOwner, login, logout }
})
