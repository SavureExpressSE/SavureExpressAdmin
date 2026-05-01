import { api } from '@/utils/request'

export interface Staff {
  id: number; firstName: string; lastName: string
  email: string; role: string; restaurantId: number | null
}
export interface RegisterPayload {
  firstName: string; lastName: string; email: string
  password: string; role: string; restaurantId?: number
}

export const staffService = {
  getAll: () => api.get<Staff[]>('/auth/users'),
  register: (payload: RegisterPayload) => api.post<Staff>('/auth/register', payload),
}
