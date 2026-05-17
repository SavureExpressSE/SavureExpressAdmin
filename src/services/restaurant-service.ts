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
    id?: number
    street?: string
    lane?: string
    zipCodeId?: number
    zipCode?: string
    city?: string
    cityId?: number
    state?: string
    stateId?: number
    country?: string
    countryId?: number
  }
}

export interface RestaurantPayload {
  id?: number
  name: string
  code: string
  email: string
  mobile: string
  outletType?: string
  isActive?: boolean
  address?: {
    street: string
    lane: string
    zipcodeId?: number
    cityId?: number
  }
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
  checkCode: (code: string, excludeId?: number) => {
    const q = new URLSearchParams({ code })
    if (excludeId) q.append('excludeId', String(excludeId))
    return api.get<ApiResponse<boolean>>(`/restaurant/check-code?${q.toString()}`)
  },
}
