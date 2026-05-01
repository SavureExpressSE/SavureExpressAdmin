import { api } from '@/utils/request'

export interface Country { id: number; name: string; code: string }
export interface State { id: number; name: string; code: string; countryId: number; countryName: string }
export interface City { id: number; name: string; stateName: string; countryName: string; stateId?: number }
export interface Zipcode { id: number; code: string; country: string; state: string; city: string; cityId?: number }

export const locationService = {
  // Country
  getCountries: () => api.get<Country[]>('/country'),
  saveCountry: (payload: { id?: number; name: string; code: string }) => api.post<Country>('/country', payload),
  deleteCountry: (id: number) => api.delete<string>(`/country/${id}`),

  // State
  getStates: () => api.get<State[]>('/state').catch(() => [] as State[]),
  saveState: (payload: { id?: number; name: string; code: string; countryId: number }) => api.post<State>('/state', payload),
  deleteState: (id: number) => api.delete<string>(`/state/${id}`),

  // City
  getCities: () => api.get<City[]>('/city'),
  saveCity: (payload: { id?: number; name: string; stateId: number }) => api.post<City>('/city', payload),
  deleteCity: (id: number) => api.delete<string>(`/city/${id}`),

  // Zipcode
  getZipcodes: () => api.get<Zipcode[]>('/zipcode'),
  saveZipcode: (payload: { id?: number; code: string; cityId: number }) => api.post<Zipcode>('/zipcode', payload),
  deleteZipcode: (id: number) => api.delete<string>(`/zipcode/${id}`),
}
