import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { useLogin, useAuth } from '../../../hooks/useAuth'
import tomoyaLogo from '../../../assets/tomoya_logo.jpg'

const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

type LoginForm = z.infer<typeof loginSchema>

export const Login = () => {
  const navigate = useNavigate()
  const login = useLogin()
  const { isAuthenticated, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  // All hooks must be called before any conditional returns
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Conditional return AFTER all hooks
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: () => {
        // State will be updated by setAuth in useLogin
        // useEffect above will handle redirect when isAuthenticated becomes true
        // Use a small delay to ensure state is updated
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 100)
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50 py-8 px-2 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo Section with Animation */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div
              className="bg-white shadow-2xl rounded-2xl border-2 border-amber-200/50 p-2 transform hover:scale-105 transition-all duration-300"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 160,
                width: 160,
              }}
            >
              <img
                src={tomoyaLogo}
                alt="Tomoya Logo"
                className="h-36 w-36 object-cover rounded-xl"
                style={{
                  boxShadow:
                    '0 4px 16px 0 rgba(212, 163, 55, 0.25), 0 2px 6px 0 rgba(250, 204, 21, 0.15)'
                }}
              />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
            Selamat Datang di Tomoya
          </h2>
          <p className="mt-2 text-base text-gray-600 font-medium">
            Silakan masuk untuk melanjutkan ke dashboard
          </p>
        </div>

        {/* Login Card with Glassmorphism */}
        <Card className="shadow-2xl border border-amber-100/50 rounded-2xl backdrop-blur-sm bg-white/95 animate-slide-up">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl text-center font-bold text-gray-900">
              Login
            </CardTitle>
            <CardDescription className="text-center text-gray-600 font-medium">
              Masukkan email & password akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email / Username
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 group-focus-within:text-amber-600 transition-colors" />
                  <Input
                    id="email"
                    type="text"
                    {...register('email')}
                    className={`pl-10 transition-all focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                      errors.email 
                        ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                        : 'border-gray-300 hover:border-amber-300'
                    }`}
                    autoComplete="email"
                    placeholder="nama@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 animate-fade-in">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 group-focus-within:text-amber-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`pl-10 pr-10 transition-all focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                      errors.password 
                        ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                        : 'border-gray-300 hover:border-amber-300'
                    }`}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 focus:outline-none transition-colors p-1 rounded-md hover:bg-amber-50"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 animate-fade-in">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold tracking-wide rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 py-6 text-base"
                disabled={login.isPending}
                size="lg"
              >
                {login.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
