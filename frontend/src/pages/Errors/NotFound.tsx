import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Home, Search, ArrowLeft } from 'lucide-react'

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <Card className="shadow-lg border border-amber-100">
          <CardContent className="p-12">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 mb-6">
                <Search className="h-12 w-12 text-amber-600" />
              </div>
              <h1 className="text-9xl font-bold text-amber-600 mb-4">404</h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Halaman Tidak Ditemukan
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Maaf, halaman yang Anda cari tidak dapat ditemukan. 
                Halaman mungkin telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Kembali ke Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

