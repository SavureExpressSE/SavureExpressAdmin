import { api } from '@/utils/request'

export interface LoginPayload { email: string; password: string }
export interface AuthResponse { token: string; email: string; role: string }

export const authService = {
  login: (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload),
}
