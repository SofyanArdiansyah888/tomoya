import { Coffee, Mail, Phone, MapPin } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Coffee className="h-8 w-8 text-amber-400" />
              <span className="text-xl font-bold">Tomoya Coffee</span>
            </div>
            <p className="text-gray-300 mb-4">
              Menyediakan kopi berkualitas tinggi dengan cita rasa yang autentik. 
              Nikmati pengalaman kopi terbaik di setiap tegukan.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-gray-300">
                  Jl. Raya Coffee No. 123, Jakarta
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-gray-300">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-gray-300">info@tomoyacoffee.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Menu Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/produk" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Produk
                </a>
              </li>
              <li>
                <a href="/tentang" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="/kontak" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Layanan Pelanggan</h3>
            <ul className="space-y-2">
              <li>
                <a href="/bantuan" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Bantuan
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-amber-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/kebijakan" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="/syarat" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Syarat & Ketentuan
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Tomoya Coffee. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}
