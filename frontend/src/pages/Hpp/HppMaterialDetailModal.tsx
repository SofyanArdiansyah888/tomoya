import { Modal } from '../../components/ui/modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { HppMaterial } from '../../types/hpp'
import { formatPrice, formatPriceWithDecimals } from '../../lib/formatPrice'
import { Calendar, Package, Building, FlaskConical, ShoppingCart } from 'lucide-react'

interface HppMaterialDetailModalProps {
  material: HppMaterial
  isOpen: boolean
  onClose: () => void
}

export const HppMaterialDetailModal = ({
  material,
  isOpen,
  onClose,
}: HppMaterialDetailModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail HPP Material"
      size="lg"
    >
      <div className="space-y-6">
        {/* Material Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Informasi Material</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Material</label>
                <p className="text-sm font-semibold text-gray-900">{material.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unit</label>
                <Badge variant="secondary">{material.unit}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge variant={material.is_active ? "default" : "secondary"}>
                  {material.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
              {material.category && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Kategori</label>
                  <p className="text-sm text-gray-900">{material.category.name}</p>
                </div>
              )}
              {material.supplier && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <p className="text-sm text-gray-900">{material.supplier.name}</p>
                </div>
              )}
            </div>
            {material.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                <p className="text-sm text-gray-900">{material.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* HPP Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Harga Pokok Penjualan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sumber HPP */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-500">Sumber HPP</label>
              {material.hpp_source === 'mix_preparation' ? (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  <FlaskConical className="w-3 h-3 mr-1" /> Mix Preparation
                </Badge>
              ) : material.hpp_source === 'purchase' ? (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <ShoppingCart className="w-3 h-3 mr-1" /> Pembelian Terbaru
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  <ShoppingCart className="w-3 h-3 mr-1" /> Fallback Harga Beli
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Harga Beli Default</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(material.purchase_price)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">HPP (Terbaru / Fallback)</label>
                <p className="text-lg font-semibold text-green-600">
                  {formatPriceWithDecimals((material.hpp ?? material.purchase_price), false, 2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Harga Satuan HPP</label>
                <p className="text-lg font-semibold text-blue-600">
                  {(() => {
                    const base = (material.hpp ?? material.purchase_price)
                    const unitPrice = material.hpp_unit_price ?? (
                      material.nilai_konversi && material.nilai_konversi > 0
                        ? (base / material.nilai_konversi)
                        : base
                    )
                    return formatPriceWithDecimals(unitPrice, false, 2)
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Purchase Info */}
        {material.latest_purchase && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Pembelian Terbaru</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {material.latest_purchase.pembelian && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">No. Pembelian</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {material.latest_purchase.pembelian.no_pembelian}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tanggal Pembelian</label>
                      <p className="text-sm text-gray-900">
                        {new Date(material.latest_purchase.pembelian.tanggal_pembelian).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Harga Satuan</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatPrice(material.latest_purchase.harga_satuan)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-sm text-gray-900">
                    {material.latest_purchase.quantity} {material.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subtotal</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(material.latest_purchase.subtotal)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal</label>
                  <p className="text-sm text-gray-900">
                    {new Date(material.latest_purchase.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!material.latest_purchase && (
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                Belum ada riwayat pembelian untuk material ini.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  )
}

