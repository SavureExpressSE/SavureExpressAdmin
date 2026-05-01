import { api } from '@/utils/request'

export interface MenuCategory { id: number; name: string; description: string | null }
export interface MenuItem {
  id: number; restaurantId: number; restaurantName: string
  menuCategoryId: number; menuCategoryName: string
  name: string; description: string | null; price: number; availability: boolean
}
export interface MenuItemPayload {
  id?: number; restaurantId: number; menuCategoryId: number
  name: string; description?: string; price: number; availability: boolean
}
export interface MenuCategoryPayload { id?: number; name: string; description?: string }

interface ApiResponse<T> { success: boolean; message: string; data: T }

export const menuService = {
  // Categories
  getAllCategories: () => api.get<ApiResponse<MenuCategory[]>>('/menu-category'),
  getCategoriesByRestaurant: (restaurantId: number) =>
    api.get<ApiResponse<MenuCategory[]>>(`/menu-category/restaurant/${restaurantId}`),
  saveCategory: (payload: MenuCategoryPayload) =>
    api.post<MenuCategory>('/menu-category', payload),
  deleteCategory: (id: number) => api.delete<ApiResponse<void>>(`/menu-category/${id}`),

  // Items
  getAllItems: () => api.get<ApiResponse<MenuItem[]>>('/menu-item'),
  getItemsByRestaurant: (restaurantId: number) =>
    api.get<ApiResponse<MenuItem[]>>(`/menu-item/restaurant/${restaurantId}`),
  saveItem: (payload: MenuItemPayload) =>
    api.post<ApiResponse<MenuItem>>('/menu-item', payload),
  deleteItem: (id: number) => api.delete<ApiResponse<string>>(`/menu-item/${id}`),
}
