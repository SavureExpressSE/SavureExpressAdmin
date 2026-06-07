import router from '@/router'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Token held in memory — set by auth store on login/refresh, never touches localStorage
let _token: string | null = null
let _onTokenRefreshed: ((token: string) => void) | null = null
let _onSessionExpired: (() => void) | null = null

export function setToken(t: string | null) {
  _token = t
}

export function configureAuth(
  onRefreshed: (token: string) => void,
  onExpired: () => void,
) {
  _onTokenRefreshed = onRefreshed
  _onSessionExpired = onExpired
}

// Deduplicates concurrent 401 refresh attempts into one request
let _refreshing: Promise<string | null> | null = null

async function attemptSilentRefresh(): Promise<string | null> {
  if (_refreshing) return _refreshing
  _refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) return null
      const data = await res.json()
      const newToken: string = data.token
      _token = newToken
      _onTokenRefreshed?.(newToken)
      return newToken
    } catch {
      return null
    } finally {
      _refreshing = null
    }
  })()
  return _refreshing
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  }
  if (_token) headers['Authorization'] = `Bearer ${_token}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    const newToken = await attemptSilentRefresh()
    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` }
      const retry = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      })
      if (retry.ok) return parseBody<T>(retry)
    }
    _onSessionExpired?.()
    router.replace({ name: 'Login' })
    throw new Error('Session expired')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return parseBody<T>(response)
}

async function parseBody<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) return null as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
}
