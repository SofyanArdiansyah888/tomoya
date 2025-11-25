import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { useRegister, useAuth } from '../../../hooks/useAuth'
import { Coffee, Lock, Mail, User, Phone, MapPin } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"],
})

type RegisterForm = z.infer<typeof registerSchema>

export const Register = () => {
  const navigate = useNavigate()
  const register = useRegister()
  const { isAuthenticated } = useAuth()

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterForm) => {
    register.mutate(data, {
      onSuccess: () => {
        navigate('/')
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-100 p-4 rounded-full">
              <Coffee className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Buat akun baru untuk mengakses sistem
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Registrasi</CardTitle>
            <CardDescription className="text-center">
              Isi form di bawah untuk membuat akun baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    {...registerField('name')}
                    className="pl-10"
                    placeholder="Nama lengkap Anda"
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...registerField('email')}
                    className="pl-10"
                    placeholder="nama@email.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    {...registerField('password')}
                    className="pl-10"
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                  Konfirmasi Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password_confirmation"
                    type="password"
                    {...registerField('password_confirmation')}
                    className="pl-10"
                    placeholder="Ulangi password Anda"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="text-sm text-red-600 mt-1">{errors.password_confirmation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    {...registerField('phone')}
                    className="pl-10"
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="address"
                    {...registerField('address')}
                    className="pl-10"
                    placeholder="Alamat lengkap Anda"
                    autoComplete="street-address"
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={register.isPending}
                size="lg"
              >
                {register.isPending ? 'Memproses...' : 'Daftar'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="font-medium text-amber-600 hover:text-amber-500"
                >
                  Masuk sekarang
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
