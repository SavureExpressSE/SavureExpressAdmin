import { api, API_BASE_URL } from '@/utils/request'

export interface LoginPayload { email: string; password: string }
export interface AuthResponse { token: string; email: string; role: string; restaurantId?: number; restaurantName?: string; currency?: string; locale?: string }

export const authService = {
  login: (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload),

  // Uses raw fetch — bypasses the interceptor to avoid an infinite refresh loop
  refresh: async (): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Session expired')
    return res.json() as Promise<AuthResponse>
  },

  logout: () => api.post<void>('/auth/logout', {}),
}
