export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'kasir' | 'gudang'
  phone?: string
  address?: string
  menu?: string
  submenu?: string
  created_at?: string
  updated_at?: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: 'admin' | 'kasir' | 'gudang'
  phone?: string
  address?: string
  menu?: string
  submenu?: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  role?: 'admin' | 'kasir' | 'gudang'
  phone?: string
  address?: string
  menu?: string
  submenu?: string
}

export interface UserFilters {
  search?: string
  role?: 'admin' | 'kasir' | 'gudang'
  page?: number
  per_page?: number
}

