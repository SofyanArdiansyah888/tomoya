import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth'
import { useAuthStore } from '../store/authStore'
import { LoginRequest, RegisterRequest } from '../types/auth'
import { toast } from 'sonner'

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, logout: logoutStore } = useAuthStore()
  
  return {
    user,
    isAuthenticated,
    setAuth,
    logout: logoutStore,
  }
}

export const useLogin = () => {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data: any) => {
      const token = data.access_token || data?.token
      authService.setAuthToken(token)
      authService.setUser(data.user)
      setAuth(data.user, token)
      toast.success('Login berhasil!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login gagal')
    },
  })
}

export const useRegister = () => {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data:any) => {
      const token = data.access_token || data.token
      authService.setAuthToken(token)
      authService.setUser(data.user)
      setAuth(data.user, token)
      toast.success('Registrasi berhasil!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registrasi gagal')
    },
  })
}

export const useLogout = () => {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      authService.removeAuthToken()
      authService.removeUser()
      logout()
      queryClient.clear()
      toast.success('Logout berhasil!')
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      authService.removeAuthToken()
      authService.removeUser()
      logout()
      queryClient.clear()
    },
  })
}

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
