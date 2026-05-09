import { api } from '@/utils/request'
import type { ApiResponse, SpringPage, FilterBase } from '@/types/api'

export interface MenuCategory { id: number; name: string; description: string | null }
export interface MenuItem {
  id: number
  menuCategoryId: number
  menuCategoryName: string
  name: string
  description: string | null
  price: number
}
export interface MenuItemPayload {
  id?: number
  menuCategoryId: number
  name: string
  description?: string
  price: number
}
export interface MenuCategoryPayload { id?: number; name: string; description?: string }

export interface MenuItemFilter extends FilterBase {
  menuCategoryId?: number
  name?: string
  minPrice?: number
  maxPrice?: number
}

export interface MenuCategoryFilter extends FilterBase {
  name?: string
  description?: string
}

export interface RestaurantMenuItem {
  id: number
  restaurantId: number
  restaurantName: string
  menuItemId: number
  menuItemName: string
  description: string | null
  menuCategoryId: number
  menuCategoryName: string
  basePrice: number
  price: number
  isAvailable: boolean
}

export interface RestaurantMenuItemPayload {
  id?: number
  restaurantId: number
  menuItemId: number
  price: number
  isAvailable: boolean
}

export const menuService = {
  // Categories
  getAllCategories: () => api.get<ApiResponse<MenuCategory[]>>('/menu-category'),
  saveCategory: (payload: MenuCategoryPayload) =>
    api.post<MenuCategory>('/menu-category', payload),
  deleteCategory: (id: number) => api.delete<ApiResponse<void>>(`/menu-category/${id}`),
  filterCategories: (f: MenuCategoryFilter) =>
    api.post<ApiResponse<SpringPage<MenuCategory>>>('/menu-category/filter', f),

  checkDuplicateCategoryName: (name: string, excludeId?: number) =>
    api.get<ApiResponse<boolean>>(`/menu-category/check-duplicate-category?category=${encodeURIComponent(name)}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),

  // Items (universal)
  getAllItems: () => api.get<ApiResponse<MenuItem[]>>('/menu-item'),
  saveItem: (payload: MenuItemPayload) =>
    api.post<ApiResponse<MenuItem>>('/menu-item', payload),
  deleteItem: (id: number) => api.delete<ApiResponse<string>>(`/menu-item/${id}`),
  filterItems: (f: MenuItemFilter) =>
    api.post<ApiResponse<SpringPage<MenuItem>>>('/menu-item/filter', f),
  checkDuplicate: (name: string, excludeId?: number) =>
    api.get<ApiResponse<boolean>>(`/menu-item/check-duplicate?name=${encodeURIComponent(name)}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),

  // Restaurant-specific menu
  getRestaurantMenu: (restaurantId: number) =>
    api.get<ApiResponse<RestaurantMenuItem[]>>(`/restaurant-menu/restaurant/${restaurantId}`),
  saveRestaurantMenuItem: (payload: RestaurantMenuItemPayload) =>
    api.post<ApiResponse<RestaurantMenuItem>>('/restaurant-menu', payload),
  deleteRestaurantMenuItem: (id: number) =>
    api.delete<ApiResponse<string>>(`/restaurant-menu/${id}`),
}
