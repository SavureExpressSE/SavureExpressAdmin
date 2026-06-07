import { api } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface KioskTerminal {
  id: number
  restaurantId: number
  restaurantName: string
  terminalCode: string
  label: string
  isActive: boolean
  lastSeenAt: string | null
  /** Present only immediately after create or rotate-key — shown once, never stored */
  rawApiKey?: string
}

export interface KioskTerminalPayload {
  id?: number
  restaurantId: number
  terminalCode: string
  label: string
  isActive?: boolean
}

export const terminalService = {
  getByRestaurant: (restaurantId: number) =>
    api.get<ApiResponse<KioskTerminal[]>>(`/kiosk-terminal/restaurant/${restaurantId}`),

  create: (payload: KioskTerminalPayload) =>
    api.post<ApiResponse<KioskTerminal>>('/kiosk-terminal', payload),

  update: (payload: KioskTerminalPayload) =>
    api.put<ApiResponse<KioskTerminal>>('/kiosk-terminal', payload),

  toggleActive: (id: number) =>
    api.patch<ApiResponse<KioskTerminal>>(`/kiosk-terminal/${id}/toggle`),

  rotateKey: (id: number) =>
    api.post<ApiResponse<KioskTerminal>>(`/kiosk-terminal/${id}/rotate-key`, {}),

  delete: (id: number) =>
    api.delete<ApiResponse<string>>(`/kiosk-terminal/${id}`),
}
