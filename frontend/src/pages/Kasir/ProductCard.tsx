import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, Heart, Coffee, Utensils, Zap } from 'lucide-react'
import { formatPrice } from '../../lib/formatPrice'

interface ProductCardProps {
  product: any
  productStock: number
  isOutOfStock: boolean
  isFavorite: boolean
  onAddToCart: (productId: number) => void
  onToggleFavorite: (productId: number) => void
}

export const ProductCard = ({
  product,
  productStock,
  isOutOfStock,
  isFavorite,
  onAddToCart,
  onToggleFavorite
}: ProductCardProps) => {
  return (
    <Card 
      className={`p-3 h-full flex flex-col transition-all duration-200 group ${
        isOutOfStock 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-md hover:scale-105 cursor-pointer'
      }`}
    >
      {/* Image Section */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {product.gambar_produk && product.gambar_produk.length > 0 ? (
          <img
            src={product.gambar_produk[0].path_gambar}
            alt={product.nama}
            className={`w-full h-full object-cover rounded-lg transition-transform duration-200 ${
              isOutOfStock ? '' : 'group-hover:scale-110'
            }`}
          />
        ) : (
          <div className="text-gray-400 text-2xl transition-colors">
            {product.kategori?.nama?.toLowerCase().includes('minuman') ? (
              <Coffee />
            ) : (
              <Utensils />
            )}
          </div>
        )}
        
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(product.id)
          }}
          className="absolute top-1 left-1 p-1 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-400 hover:text-red-500'
            }`} 
          />
        </button>
        
        {/* Out of stock badge */}
        {isOutOfStock && (
          <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs z-10">
            Habis
          </Badge>
        )}
        
        {/* Low stock badge */}
        {product.stockable && productStock > 0 && productStock <= 5 && !isOutOfStock && (
          <Badge className="absolute top-1 right-1 bg-orange-500 text-white text-xs z-10">
            <Zap className="h-3 w-3 mr-1" />
            Stok Menipis
          </Badge>
        )}
      </div>
      
      {/* Content Section - flex-1 untuk mengisi ruang tersisa */}
      <div className="flex flex-col flex-1 space-y-1.5 min-h-0">
        <h3 className={`font-semibold text-sm truncate uppercase transition-colors flex-shrink-0 ${
          isOutOfStock 
            ? 'text-gray-500' 
            : 'text-gray-900 group-hover:text-blue-600'
        }`}>
          {product.nama}
        </h3>
        
   
        
        <div className="flex gap-2 items-center justify-between mt-auto flex-shrink-0">
          <span className="text-sm font-bold text-green-600">
            {formatPrice(product.harga)}
          </span>
          {product.stockable && (
            <Badge 
              variant={productStock > 0 ? "outline" : "destructive"} 
              className="text-xs"
            >
              Stok: {productStock}
            </Badge>
          )}
        </div>
        
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={isOutOfStock}
          className="w-full text-xs py-1.5 h-8 mt-1 flex-shrink-0"
          size="sm"
          variant={isOutOfStock ? "outline" : "default"}
        >
          <Plus className="h-3 w-3 mr-1" />
          {isOutOfStock ? 'Out of Stock' : 'Tambah'}
        </Button>
      </div>
    </Card>
  )
}

