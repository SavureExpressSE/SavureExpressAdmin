import { api } from '@/utils/request'
import type { ApiResponse, SpringPage, FilterBase } from '@/types/api'

export interface Restaurant {
  id: number
  name: string
  code: string
  email: string
  mobile: string
  outletType?: string
  isActive?: boolean
  address?: {
    street?: string
    city?: string
    state?: string
    zipcode?: string
    country?: string
  }
}

export interface RestaurantPayload {
  id?: number
  name: string
  code: string
  email: string
  mobile: string
  address?: Restaurant['address']
}

export interface RestaurantFilter extends FilterBase {
  name?: string
  code?: string
  email?: string
  mobile?: string
  outletType?: string
  isActive?: boolean
}

export const restaurantService = {
  getAll: () => api.get<Restaurant[]>('/restaurant'),
  getById: (id: number) => api.get<Restaurant>(`/restaurant/${id}`),
  save: (payload: RestaurantPayload) => api.post<Restaurant>('/restaurant', payload),
  delete: (id: number) => api.delete<string>(`/restaurant/${id}`),
  filter: (f: RestaurantFilter) =>
    api.post<ApiResponse<SpringPage<Restaurant>>>('/restaurant/filter', f),
}
