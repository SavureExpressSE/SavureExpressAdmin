export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface SpringPage<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export interface FilterBase {
  page: number
  size: number
  sortBy: string
  sortDir: 'asc' | 'desc'
}
