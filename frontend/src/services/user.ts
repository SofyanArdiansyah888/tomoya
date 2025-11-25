import { api } from './api'
import { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../types/user'
import { PaginatedResponse } from '../types/api'

export const userService = {
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User> | { data: User[] }> {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.role) params.append('role', filters.role)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    
    const response = await api.get(`/pengguna?${params.toString()}`)
    
    // Backend returns ApiResource::collection which is an array
    // or might return paginated response with data property
    if (Array.isArray(response.data)) {
      return { data: response.data }
    }
    
    // If response has data property, return as is (paginated)
    if (response.data?.data) {
      return response.data
    }
    
    // Fallback: wrap in data property
    return { data: response.data || [] }
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get(`/pengguna/${id}`)
    return response.data.data
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/pengguna', userData)
    return response.data.data
  },

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/pengguna/${id}`, userData)
    return response.data.data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/pengguna/${id}`)
  }
}

