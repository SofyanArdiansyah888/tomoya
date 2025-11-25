import { api } from './api'
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/login', credentials)
    return response.data
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/register', userData)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/user')
    return response.data.data
  },

  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  },

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  removeAuthToken(): void {
    localStorage.removeItem('auth_token')
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  },

  getUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  removeUser(): void {
    localStorage.removeItem('user')
    localStorage.removeItem('login_timestamp')
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }
}
