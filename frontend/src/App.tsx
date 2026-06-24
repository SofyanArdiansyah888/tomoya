import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DaftarArusKas } from './pages/ArusKas/DaftarArusKas'
import { DaftarMasterKas } from './pages/MasterKas/DaftarMasterKas'
import { Login } from './pages/Auth/Login/Login'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { NotFound } from './pages/Errors/NotFound'
import { Unauthorized } from './pages/Errors/Unauthorized'
import { Kasir } from './pages/Kasir/Kasir'
import { KategoriPage } from './pages/Kategori/KategoriPage'
import { ManajemenPesanan } from './pages/ManajemenPesanan/ManajemenPesanan'
import { MaterialPage } from './pages/Material/MaterialPage'
import { DaftarPemasukan } from './pages/Pemasukan/DaftarPemasukan'
import { PembelianPage } from './pages/Pembelian/PembelianPage'
import { DaftarPengeluaran } from './pages/Pengeluaran/DaftarPengeluaran'
import { PergerakanStok } from './pages/PergerakanStok/PergerakanStok'
import { ProdukPage } from './pages/Produk/ProdukPage'
import { ResepPage } from './pages/Resep/ResepPage'
import { StokGudang } from './pages/StokGudang/StokGudang'
import { StokToko } from './pages/StokToko/StokToko'
import { SupplierPage } from './pages/Supplier/SupplierPage'
import { UserPage } from './pages/User/UserPage'
import { ShiftKasirPage } from './pages/ShiftKasir/ShiftKasirPage'
import { HppMaterialPage } from './pages/Hpp/HppMaterialPage'
import { HppResepPage } from './pages/Hpp/HppResepPage'
import { HppPenjualanPage } from './pages/Hpp/HppPenjualanPage'
import { ProtectedRoute } from './router/ProtectedRoute'
import { MixPreparation } from './pages/MixPreparation/MixPreparation'
import { StatusPesananPage } from './pages/StatusPesanan/StatusPesananPage'

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/pesanan-user" element={<StatusPesananPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Product Management */}
          <Route path="produk" element={<ProdukPage />} />

          {/* Category Management */}
          <Route path="kategori" element={<KategoriPage />} />

          {/* Stock Management */}
          <Route path="stok-gudang" element={<StokGudang />} />
          <Route path="stok-toko" element={<Navigate to="/stok-toko/minuman" replace />} />
          <Route path="stok-toko/pastry" element={<StokToko division="pastry" />} />
          <Route path="stok-toko/minuman" element={<StokToko division="minuman" />} />
          <Route path="pergerakan-stok" element={<PergerakanStok />} />
          <Route path="mix-preparation" element={<Navigate to="/mix-preparation/minuman" replace />} />
          <Route path="mix-preparation/pastry" element={<MixPreparation division="pastry" />} />
          <Route path="mix-preparation/minuman" element={<MixPreparation division="minuman" />} />

          {/* Cashier & Orders */}
          <Route path="kasir" element={<Kasir />} />
          <Route path="pesanan" element={<ManajemenPesanan />} />
          <Route path="shift-kasir" element={<ShiftKasirPage />} />

          {/* Supplier Management */}
          <Route path="supplier" element={<SupplierPage />} />

          {/* Purchase Management */}
          <Route path="pembelian" element={<PembelianPage />} />

          {/* Cash Flow Management */}
          <Route path="arus-kas" element={<DaftarArusKas />} />
          <Route path="master-kas" element={<DaftarMasterKas />} />

          {/* Material Management */}
          <Route path="material" element={<MaterialPage />} />

          {/* Recipe Management */}
          <Route path="resep" element={<ResepPage />} />

          {/* User Management */}
          <Route path="user" element={<UserPage />} />

          {/* Expense Management */}
          <Route path="pengeluaran" element={<DaftarPengeluaran />} />
          <Route path="pemasukan" element={<DaftarPemasukan />} />

          {/* HPP Management */}
          <Route path="hpp/material" element={<HppMaterialPage />} />
          <Route path="hpp/resep" element={<HppResepPage />} />
          <Route path="hpp/penjualan" element={<HppPenjualanPage />} />
        </Route>

        {/* Error Pages */}
        <Route path="/401" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App