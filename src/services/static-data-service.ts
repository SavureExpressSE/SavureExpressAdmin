import { api } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface StaticDataValue {
  id?: number
  sequence: number
  value: string
}

export interface StaticData {
  id?: number
  name: string
  description?: string
  staticDataValues: StaticDataValue[]
}

export const staticDataService = {
  getAll: () =>
    api.get<ApiResponse<StaticData[]>>('/static-data'),

  getById: (id: number) =>
    api.get<ApiResponse<StaticData>>(`/static-data/${id}`),

  save: (payload: StaticData) =>
    api.post<ApiResponse<StaticData>>('/static-data', payload),

  delete: (id: number) =>
    api.delete<ApiResponse<string>>(`/static-data/${id}`),
}
