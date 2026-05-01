import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderService, type Order } from '@/services/order-service'

const DEFAULT_RESTAURANT_ID = 1

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchByRestaurant(restaurantId = DEFAULT_RESTAURANT_ID) {
    loading.value = true
    error.value = null
    try {
      orders.value = await orderService.getByRestaurant(restaurantId)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: number, status: string) {
    const updated = await orderService.updateStatus(id, status)
    const idx = orders.value.findIndex(o => o.id === id)
    if (idx !== -1) orders.value[idx] = updated
    return updated
  }

  async function cancelOrder(id: number) {
    await orderService.cancelOrder(id)
    orders.value = orders.value.filter(o => o.id !== id)
  }

  return { orders, loading, error, fetchByRestaurant, updateStatus, cancelOrder }
})
