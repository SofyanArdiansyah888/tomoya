import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loginTimestamp: number | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loginTimestamp: null,

      setAuth: (user: User, token: string) => {
        const timestamp = Date.now()
        // Set state first - persist middleware will handle localStorage
        set({ user, token, isAuthenticated: true, loginTimestamp: timestamp })
        // Also manually set for immediate access (redundant but ensures consistency)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('login_timestamp', timestamp.toString())
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        localStorage.removeItem('login_timestamp')
        set({ user: null, token: null, isAuthenticated: false, loginTimestamp: null })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          set({ user: updatedUser })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loginTimestamp: state.loginTimestamp,
      }),
      // Sync with localStorage on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure isAuthenticated is set correctly based on token and user
          const token = localStorage.getItem('auth_token')
          const userStr = localStorage.getItem('user')
          const timestampStr = localStorage.getItem('login_timestamp')
          const hasToken = !!token
          const hasUser = !!userStr
          const timestamp = timestampStr ? parseInt(timestampStr, 10) : null
          
          if (hasToken && hasUser && state.user && state.token) {
            state.isAuthenticated = true
            state.loginTimestamp = timestamp
          } else {
            state.isAuthenticated = false
            state.user = null
            state.token = null
            state.loginTimestamp = null
          }
        }
      },
    }
  )
)
