import { api } from '@/utils/request'
import type { ApiResponse, SpringPage, FilterBase } from '@/types/api'

export interface DiningTable {
  id: number
  restaurantId: number
  restaurantName: string
  qrCode: string | null
  status: string
}

export interface DiningTableFilter extends FilterBase {
  restaurantId?: number
  status?: string
  qrCode?: string
}

export const tableService = {
  getByRestaurant: (restaurantId: number) =>
    api.get<ApiResponse<DiningTable[]>>(`/tables/restaurant/${restaurantId}`),
  create: (restaurantId: number, qrCode?: string) =>
    api.post<ApiResponse<DiningTable>>('/tables', { restaurantId, qrCode }),
  updateStatus: (id: number, status: string) =>
    api.patch<ApiResponse<DiningTable>>(`/tables/${id}/status`, { status }),
  delete: (id: number) => api.delete<ApiResponse<string>>(`/tables/${id}`),
  filter: (f: DiningTableFilter) =>
    api.post<ApiResponse<SpringPage<DiningTable>>>('/tables/filter', f),
}
