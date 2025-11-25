# Tomoya Coffee Shop - Frontend

Frontend aplikasi e-commerce untuk toko kopi Tomoya Coffee Shop yang dibangun dengan React, TypeScript, dan TailwindCSS.

## 🚀 Teknologi yang Digunakan

- **React 18** - Library UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp env.example .env
   ```
   
   Edit file `.env` dan sesuaikan URL API:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

   Aplikasi akan berjalan di `http://localhost:3000`

## 🏗️ Struktur Proyek

```
src/
├── components/          # Komponen UI
│   ├── ui/             # Komponen dasar (Button, Input, Card, dll)
│   ├── layout/         # Komponen layout (Header, Footer, Layout)
│   ├── beranda/        # Komponen halaman beranda
│   ├── produk/         # Komponen halaman produk
│   ├── keranjang/      # Komponen halaman keranjang
│   ├── checkout/       # Komponen halaman checkout
│   ├── pesanan/        # Komponen halaman pesanan
│   └── profile/        # Komponen halaman profil
├── hooks/              # Custom hooks
├── pages/              # Halaman aplikasi
├── services/           # API services
├── store/              # Zustand stores
├── types/              # TypeScript types
├── router/             # Router configuration
└── styles/             # Global styles
```

## 🎯 Fitur Utama

### 🏠 Halaman Beranda
- Hero section dengan CTA
- Produk unggulan
- Tentang perusahaan
- Testimoni pelanggan

### 🛍️ Katalog Produk
- Daftar produk dengan pagination
- Filter berdasarkan kategori
- Pencarian produk
- Detail produk dengan gambar

### 🛒 Keranjang Belanja
- Tambah/hapus produk
- Update quantity
- Ringkasan belanja
- Persistensi data

### 💳 Checkout
- Form informasi pengiriman
- Ringkasan pesanan
- Konfirmasi pembayaran

### 👤 Manajemen Akun
- Login/Register
- Profil pengguna
- Riwayat pesanan
- Update informasi

## 🔧 Scripts

```bash
# Development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🌐 API Integration

Aplikasi terintegrasi dengan backend Laravel melalui REST API:

- **Authentication**: `/api/login`, `/api/register`, `/api/logout`
- **Products**: `/api/products`, `/api/categories`
- **Cart**: `/api/cart/*`
- **Orders**: `/api/orders/*`

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Tema yang dapat disesuaikan
- **Loading States** - Skeleton loading dan spinner
- **Error Handling** - Error boundaries dan toast notifications
- **Accessibility** - ARIA labels dan keyboard navigation

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Security Features

- **JWT Authentication** - Token-based auth
- **Protected Routes** - Route guards
- **Input Validation** - Zod schema validation
- **XSS Protection** - Sanitized inputs

## 🚀 Deployment

### Build untuk Production

```bash
npm run build
```

### Environment Variables

Pastikan environment variables sudah diset dengan benar:

```env
VITE_API_URL=https://your-api-domain.com/api
```

## 📝 Development Guidelines

1. **Code Style**: Gunakan ESLint dan Prettier
2. **Type Safety**: Selalu gunakan TypeScript types
3. **Component Structure**: Pisahkan logic dan presentation
4. **Error Handling**: Handle semua error states
5. **Performance**: Optimize dengan React.memo dan useMemo

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.
