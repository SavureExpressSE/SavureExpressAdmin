import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type LoginPayload } from '@/services/auth-service'
import { setToken, configureAuth } from '@/utils/request'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // Token lives in memory only — never persisted to localStorage (XSS-safe)
  const token = ref<string | null>(null)
  const email = ref<string | null>(localStorage.getItem('userEmail'))
  const role = ref<string | null>(localStorage.getItem('userRole'))
  const restaurantId = ref<number | null>(Number(localStorage.getItem('userRestaurantId')) || null)
  const restaurantName = ref<string | null>(localStorage.getItem('userRestaurantName'))
  const currency = ref<string | null>(localStorage.getItem('userCurrency'))
  const locale = ref<string | null>(localStorage.getItem('userLocale'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  // Tracks whether the initial session restore attempt has completed
  const sessionRestored = ref(false)

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
      _applySession(res.token, res.email, res.role, res.currency, res.locale, res.restaurantId, res.restaurantName)
    } catch (e: any) {
      error.value = e.message ?? 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Silently restores session from the HttpOnly refresh cookie — idempotent, safe to call multiple times
  let _restorePromise: Promise<boolean> | null = null
  function tryRestoreSession(): Promise<boolean> {
    if (_restorePromise) return _restorePromise
    _restorePromise = (async () => {
      try {
        const res = await authService.refresh()
        _applySession(res.token, res.email, res.role, res.currency, res.locale, res.restaurantId, res.restaurantName)
        return true
      } catch {
        return false
      } finally {
        sessionRestored.value = true
      }
    })()
    return _restorePromise
  }

  async function logout() {
    try {
      await authService.logout()
    } catch { /* ignore network errors on logout */ }
    _clear()
    router.replace({ name: 'Login' })
  }

  function _applySession(t: string, e: string, r: string, c?: string, l?: string, rid?: number, rname?: string) {
    token.value = t
    email.value = e
    role.value = r
    restaurantId.value = rid ?? null
    restaurantName.value = rname ?? null
    currency.value = c ?? null
    locale.value = l ?? null
    setToken(t)
    localStorage.setItem('userEmail', e)
    localStorage.setItem('userRole', r)
    if (rid) localStorage.setItem('userRestaurantId', String(rid))
    else localStorage.removeItem('userRestaurantId')
    if (rname) localStorage.setItem('userRestaurantName', rname)
    else localStorage.removeItem('userRestaurantName')
    if (currency.value) localStorage.setItem('userCurrency', currency.value)
    else localStorage.removeItem('userCurrency')
    if (locale.value) localStorage.setItem('userLocale', locale.value)
    else localStorage.removeItem('userLocale')
  }

  function _clear() {
    token.value = null
    email.value = null
    role.value = null
    restaurantId.value = null
    restaurantName.value = null
    currency.value = null
    locale.value = null
    setToken(null)
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userRestaurantId')
    localStorage.removeItem('userRestaurantName')
    localStorage.removeItem('userCurrency')
    localStorage.removeItem('userLocale')
  }

  return { token, email, role, restaurantId, restaurantName, currency, locale, loading, error, isAuthenticated, isAdmin, isOwner, sessionRestored, init, login, logout, tryRestoreSession }
})
