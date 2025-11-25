import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth'

const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

export const useSessionTimeout = () => {
  const navigate = useNavigate()
  const { logout, loginTimestamp, isAuthenticated } = useAuthStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !loginTimestamp) {
      // Clear any existing interval if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      warningShownRef.current = false
      return
    }

    const checkSessionTimeout = () => {
      const now = Date.now()
      const elapsed = now - loginTimestamp
      const remaining = SESSION_TIMEOUT_MS - elapsed

      // If session has expired
      if (elapsed >= SESSION_TIMEOUT_MS) {
        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        // Logout user
        logout()
        authService.removeAuthToken()
        authService.removeUser()

        // Show notification and redirect
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.', {
          duration: 5000,
        })
        navigate('/login', { replace: true })
        warningShownRef.current = false
        return
      }

      // Show warning 5 minutes before timeout (only once)
      const fiveMinutes = 5 * 60 * 1000
      if (remaining <= fiveMinutes && remaining > 0 && !warningShownRef.current) {
        const minutesLeft = Math.ceil(remaining / (60 * 1000))
        toast.warning(`Sesi Anda akan berakhir dalam ${minutesLeft} menit.`, {
          duration: 10000,
        })
        warningShownRef.current = true
      }

      // Reset warning flag if session is renewed (more than 5 minutes remaining)
      if (remaining > fiveMinutes) {
        warningShownRef.current = false
      }
    }

    // Check immediately (handles page refresh case)
    checkSessionTimeout()

    // Check every minute
    intervalRef.current = setInterval(checkSessionTimeout, 60 * 1000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated, loginTimestamp, logout, navigate])
}

