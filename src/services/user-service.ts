import { api } from '@/utils/request'
import type { ApiResponse, SpringPage, FilterBase } from '@/types/api'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  mobile?: string
  role: string
  restaurantId: number | null
  restaurantName: string | null
  active: boolean
}

export interface UserFilter extends FilterBase {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  restaurantId?: number
  active?: boolean
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  email?: string
  mobile?: string
  password?: string
  role?: string
  restaurantId?: number
}

export const userService = {
  getAll: () => api.get<ApiResponse<User[]>>('/users'),
  getById: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),
  filter: (f: UserFilter) =>
    api.post<ApiResponse<SpringPage<User>>>('/users/filter', f),
  updateUser: (id: number, payload: UpdateUserPayload) => api.put<ApiResponse<User>>(`/users/${id}`, payload),
  toggleActive: (id: number) => api.patch<ApiResponse<User>>(`/users/${id}/toggle-active`),
  deleteUser: (id: number) => api.delete<ApiResponse<string>>(`/users/${id}`),
}
