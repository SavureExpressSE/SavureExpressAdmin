import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuService, type MenuItem, type MenuCategory, type MenuItemPayload, type MenuCategoryPayload } from '@/services/menu-service'

const DEFAULT_RESTAURANT_ID = 1

export const useMenuStore = defineStore('menu', () => {
  const items = ref<MenuItem[]>([])
  const categories = ref<MenuCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(restaurantId = DEFAULT_RESTAURANT_ID) {
    loading.value = true
    error.value = null
    try {
      const [itemsRes, catsRes] = await Promise.all([
        menuService.getItemsByRestaurant(restaurantId),
        menuService.getCategoriesByRestaurant(restaurantId),
      ])
      items.value = itemsRes.data ?? []
      categories.value = catsRes.data ?? []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function saveItem(payload: MenuItemPayload) {
    const res = await menuService.saveItem(payload)
    await fetchAll(payload.restaurantId)
    return res
  }

  async function deleteItem(id: number, restaurantId = DEFAULT_RESTAURANT_ID) {
    await menuService.deleteItem(id)
    await fetchAll(restaurantId)
  }

  async function saveCategory(payload: MenuCategoryPayload) {
    const res = await menuService.saveCategory(payload)
    await fetchAll()
    return res
  }

  async function deleteCategory(id: number) {
    await menuService.deleteCategory(id)
    await fetchAll()
  }

  return { items, categories, loading, error, fetchAll, saveItem, deleteItem, saveCategory, deleteCategory }
})
