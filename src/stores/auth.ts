import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type LoginPayload } from '@/services/auth-service'
import { setToken, configureAuth } from '@/utils/request'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // Token lives in memory only — never persisted to localStorage (XSS-safe)
  const token = ref<string | null>(null)
  // Email and role are not sensitive — keep them across page refreshes
  const email = ref<string | null>(localStorage.getItem('userEmail'))
  const role = ref<string | null>(localStorage.getItem('userRole'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isOwner = computed(() => role.value === 'OWNER')

  // Call once on app startup to wire request.ts callbacks
  function init() {
    configureAuth(
      (newToken) => { token.value = newToken },
      () => { _clear() },
    )
    setToken(token.value)
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login(payload)
      _applySession(res.token, res.email, res.role)
    } catch (e: any) {
      error.value = e.message ?? 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Silently restores session from the HttpOnly refresh cookie on page load
  async function tryRestoreSession(): Promise<boolean> {
    try {
      const res = await authService.refresh()
      _applySession(res.token, res.email, res.role)
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch { /* ignore network errors on logout */ }
    _clear()
    router.replace({ name: 'Login' })
  }

  function _applySession(t: string, e: string, r: string) {
    token.value = t
    email.value = e
    role.value = r
    setToken(t)
    localStorage.setItem('userEmail', e)
    localStorage.setItem('userRole', r)
  }

  function _clear() {
    token.value = null
    email.value = null
    role.value = null
    setToken(null)
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
  }

  return { token, email, role, loading, error, isAuthenticated, isAdmin, isOwner, init, login, logout, tryRestoreSession }
})
