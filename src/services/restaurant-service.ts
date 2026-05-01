import { api } from '@/utils/request'

export interface Restaurant {
  id: number
  name: string
  code: string
  email: string
  mobile: string
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

export const restaurantService = {
  getAll: () => api.get<Restaurant[]>('/restaurant'),
  getById: (id: number) => api.get<Restaurant>(`/restaurant/${id}`),
  save: (payload: RestaurantPayload) => api.post<Restaurant>('/restaurant', payload),
  delete: (id: number) => api.delete<string>(`/restaurant/${id}`),
}
