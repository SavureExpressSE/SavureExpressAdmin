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
}

export interface UserFilter extends FilterBase {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  restaurantId?: number
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
  deleteUser: (id: number) => api.delete<ApiResponse<string>>(`/users/${id}`),
}
