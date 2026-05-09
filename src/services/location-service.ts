import { api } from '@/utils/request'

export interface Country { id: number; name: string; code: string }
export interface State { id: number; name: string; code: string; countryId: number; countryName: string }
export interface City { id: number; name: string; stateId?: number; stateName: string; countryId?: number; countryName: string }
export interface Zipcode { id: number; code: string; cityId?: number; city: string; stateId?: number; state: string; countryId?: number; country: string }

export interface PageResult<T> {
  content: T[]
  totalPages: number
  totalElements: number
}

interface FilterBase { page?: number; size?: number; sortBy?: string; sortDir?: string }

export const locationService = {
  // Country
  getCountries: () => api.get<Country[]>('/country'),
  saveCountry: (payload: { id?: number; name: string; code: string }) => api.post<Country>('/country', payload),
  deleteCountry: (id: number) => api.delete<string>(`/country/${id}`),
  filterCountries: (params: FilterBase & { name?: string; code?: string }) =>
    api.post<{ data: PageResult<Country> }>('/country/filter', params),
  checkDuplicateCountryName: (name: string, excludeId?: number) =>
    api.get<boolean>(`/country/duplicate-name?countryName=${encodeURIComponent(name)}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),
  checkDuplicateCountryCode: (code: string, excludeId?: number) =>
    api.get<boolean>(`/country/duplicate-code?countryCode=${encodeURIComponent(code)}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),

  // State
  getStates: () => api.get<State[]>('/state').catch(() => [] as State[]),
  saveState: (payload: { id?: number; name: string; code: string; countryId: number }) => api.post<State>('/state', payload),
  deleteState: (id: number) => api.delete<string>(`/state/${id}`),
  filterStates: (params: FilterBase & { name?: string; code?: string; countryId?: number }) =>
    api.post<{ data: PageResult<State> }>('/state/filter', params),
  checkDuplicateStateName: (name: string, countryId: number, excludeId?: number) =>
    api.get<boolean>(`/state/check-duplicate-name?stateName=${encodeURIComponent(name)}&countryId=${countryId}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),
  checkDuplicateStateCode: (code: string, countryId: number, excludeId?: number) =>
    api.get<boolean>(`/state/check-duplicate-code?stateCode=${encodeURIComponent(code)}&countryId=${countryId}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),

  // City
  getCities: () => api.get<City[]>('/city'),
  saveCity: (payload: { id?: number; name: string; stateId: number }) => api.post<City>('/city', payload),
  deleteCity: (id: number) => api.delete<string>(`/city/${id}`),
  filterCities: (params: FilterBase & { name?: string; stateId?: number; countryId?: number }) =>
    api.post<{ data: PageResult<City> }>('/city/filter', params),
  checkDuplicateCityName: (name: string, stateId: number, excludeId?: number) =>
    api.get<boolean>(`/city/check-duplicate-name?cityName=${encodeURIComponent(name)}&stateId=${stateId}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),

  // Zipcode
  getZipcodes: () => api.get<Zipcode[]>('/zipcode'),
  saveZipcode: (payload: { id?: number; code: string; cityId: number }) => api.post<Zipcode>('/zipcode', payload),
  deleteZipcode: (id: number) => api.delete<string>(`/zipcode/${id}`),
  filterZipcodes: (params: FilterBase & { code?: string; cityId?: number; stateId?: number; countryId?: number }) =>
    api.post<{ data: PageResult<Zipcode> }>('/zipcode/filter', params),
  checkDuplicateZipcodeCode: (code: string, countryId: number, excludeId?: number) =>
    api.get<boolean>(`/zipcode/check-duplicate-code?zipcode=${encodeURIComponent(code)}&countryId=${countryId}${excludeId != null ? `&excludeId=${excludeId}` : ''}`),
}
