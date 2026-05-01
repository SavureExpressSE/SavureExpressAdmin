import { api } from '@/utils/request'

export interface OrderItem {
  id: number; menuItemId: number; menuItemName: string
  menuItemPrice: number; quantity: number; notes: string | null; subtotal: number
}
export interface Order {
  id: number; restaurantId: number; restaurantName: string
  customerId: number | null; customerName: string | null
  staffId: number | null; staffName: string | null
  tableId: number | null; reservationId: number | null
  orderType: string; orderStatus: string
  totalAmount: number; items: OrderItem[]; createdAt: string
}

export const orderService = {
  getByRestaurant: (restaurantId: number) =>
    api.get<Order[]>(`/orders/restaurant/${restaurantId}`),
  getByRestaurantAndStatus: (restaurantId: number, status: string) =>
    api.get<Order[]>(`/orders/restaurant/${restaurantId}/status/${status}`),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/orders/${id}/status?status=${status}`),
  cancelOrder: (id: number) => api.delete<string>(`/orders/${id}/cancel`),
}
