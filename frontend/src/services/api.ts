import axios from 'axios'
import { getApiBaseUrl } from '../utils/apiUrl'

const API_BASE_URL = getApiBaseUrl()

if (import.meta.env.DEV) {
  console.log('🔧 API_BASE_URL:', API_BASE_URL)
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      // Clear auth store if available
      try {
        const { useAuthStore } = require('../store/authStore')
        useAuthStore.getState().logout()
      } catch (e) {
        // Store might not be available yet
      }
      
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
