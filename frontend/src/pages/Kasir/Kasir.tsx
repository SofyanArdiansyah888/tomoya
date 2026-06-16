import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Heart,
  Package,
  Search,
  ShoppingCart,
  Utensils,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useCreateOrder } from '../../hooks/useOrders'
import { formatPrice } from '../../lib/formatPrice'
import { produkLokasiService } from '../../services/inventory'
import { productService } from '../../services/products'
import { shiftService } from '../../services/shift'
import { recipeService } from '../../services/recipe'
import { CartSidebar } from './CartSidebar'
import { ProductCard } from './ProductCard'
import { printChecker } from '../../utils/printChecker'
import { printLabel } from '../../utils/printLabel'
import { printReceipt } from '../../utils/printReceipt'

// Default shop location ID is 2
const DEFAULT_SHOP_LOCATION_ID = 2

export const Kasir = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showCart, setShowCart] = useState(true) // Show cart by default
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris' | 'other'>('cash')
  const [paymentStatus, setPaymentStatus] = useState<'bayar' | 'belum_bayar'>('bayar')
  const [clientName, setClientName] = useState('')
  const [qrisImage, setQrisImage] = useState<File | null>(null)
  const [amountPaid, setAmountPaid] = useState<number | ''>('')

  // Show favorites filter
  const [showFavorites, setShowFavorites] = useState(false)

  // Fetch current shift for the shop location
  const { data: currentShift, isLoading: isLoadingShift, refetch: refetchShift } = useQuery({
    queryKey: ['shift-kasir', 'current', DEFAULT_SHOP_LOCATION_ID],
    queryFn: () => shiftService.getCurrentShift(DEFAULT_SHOP_LOCATION_ID),
    refetchInterval: 10000, // Refetch every 10 seconds for better real-time check
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    retry: false, // Don't retry on error
    staleTime: 0, // Always consider data stale to ensure fresh check
  })

  // Refetch shift when window becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchShift()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refetchShift])

  // Local cart state (no API calls needed for cashier)
  const [localCart, setLocalCart] = useState<Array<{
    line_id: string
    produk_id: number
    quantity: number
    produk: any
    coffee_strength?: 'strong' | 'medium' | 'soft' | 'other'
    coffee_grams?: number
    catatan?: string
  }>>([])


  // Fetch products
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', { search: searchTerm, kategori_id: selectedCategory, is_active: true, favorite: showFavorites }],
    queryFn: async () => {
      const result = await productService.getProducts({
        search: searchTerm,
        kategori_id: selectedCategory || undefined,
        is_active: true,
        favorite: showFavorites || undefined
      })

      return result
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch all products to get favorite count (separate query for count)
  const { data: allProducts } = useQuery({
    queryKey: ['products', 'all-favorites'],
    queryFn: async () => {
      const result = await productService.getProducts({
        is_active: true
      })
      return result
    },

  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return await productService.getCategories()
    },

  })

  // Fetch product stock from shop location (ID 2) calculated from recipe materials
  const { data: productStocks } = useQuery({
    queryKey: ['product-stocks-by-recipe', DEFAULT_SHOP_LOCATION_ID],
    queryFn: async () => {
      return await produkLokasiService.getProductStockByRecipe(DEFAULT_SHOP_LOCATION_ID)
    },
    staleTime: 1000 * 60 * 1, // 1 minute - refresh more frequently for stock
  })
  // Order creation hook
  const createOrder = useCreateOrder()

  // Calculate totals from local cart data
  const itemCount = localCart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = localCart.reduce((sum, item) => {
    return sum + (item.quantity * (item.produk?.harga || 0))
  }, 0)
  const total = subtotal // Total sama dengan subtotal untuk sekarang
  const kembalian = paymentMethod === 'cash' && paymentStatus === 'bayar' && typeof amountPaid === 'number' && amountPaid > 0
    ? Math.max(0, amountPaid - total)
    : 0

  // Reset amountPaid when payment method or status changes (if not cash or not bayar)
  useEffect(() => {
    if (paymentMethod !== 'cash' || paymentStatus !== 'bayar') {
      setAmountPaid('')
    }
  }, [paymentMethod, paymentStatus])

  const generateLineId = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    // Get product from products list
    let product = products?.data?.find((p: any) => p.id === productId)
    if (!product) return

    // Check if product is out of stock (only for stockable products)
    // if (product.stockable && isProductOutOfStock(product)) {
    //   toast.error('Produk sedang habis stok!')
    //   return
    // }

    const existingItem = localCart.find(item => item.produk_id === productId)
    const currentQuantity = existingItem ? itemIsCoffee(existingItem) ? 0 : existingItem.quantity : 0
    const newQuantity = currentQuantity + quantity

    // Check if adding would exceed available stock
    // if (product.stockable && newQuantity > availableStock) {
    //   toast.error(`Stok tidak mencukupi! Stok tersedia: ${availableStock}`)
    //   return
    // }

    if (!product.resep && product.resep_id) {
      try {
        const recipe = await recipeService.getRecipe(product.resep_id)
        product = { ...product, resep: recipe }
      } catch (e) {}
    }

    const isKopi = isProductCoffee(product)
    setLocalCart(prevCart => {
      if (!isKopi && existingItem) {
        return prevCart.map(item =>
          item.produk_id === productId
            ? { ...item, quantity: newQuantity } 
            : item
        )
      }
      return [...prevCart, {
        line_id: generateLineId(),
        produk_id: productId,
        quantity: 1,//Math.min(quantity, availableStock),
        produk: product,
        catatan: '',
      }]
    })

    toast.success('Produk ditambahkan ke keranjang!')
  }

  const handleCoffeeOptionChange = (lineId: string, strength: 'strong' | 'medium' | 'soft' | 'other', grams: number) => {
    setLocalCart(prevCart => prevCart.map(item =>
      item.line_id === lineId ? { ...item, coffee_strength: strength, coffee_grams: grams } : item
    ))
  }

  const handleCatatanChange = (lineId: string, catatan: string) => {
    setLocalCart(prevCart => prevCart.map(item =>
      item.line_id === lineId ? { ...item, catatan } : item
    ))
  }

  const handleQuantityChange = (lineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setLocalCart(prevCart => prevCart.filter(item => item.line_id !== lineId))
      toast.success('Produk dihapus dari keranjang!')
      return
    }

    // Get product and check stock limit
    // const targetItem = localCart.find(i => i.line_id === lineId)
    // const product = products?.data?.find((p: any) => p.id === targetItem?.produk_id)
    // if (product?.stockable) {
    //   const availableStock = getProductStock(product.id)
    //   if (newQuantity > availableStock) {
    //     toast.error(`Stok tidak mencukupi! Stok tersedia: ${availableStock}`)
    //     newQuantity = availableStock
    //   }
    // }

    setLocalCart(prevCart =>
      prevCart.map(item =>
        item.line_id === lineId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (lineId: string) => {
    setLocalCart(prevCart => prevCart.filter(item => item.line_id !== lineId))
    toast.success('Produk dihapus dari keranjang!')
  }

  const handlePrintOnCheckout = async (
    cart: typeof localCart,
    status: 'bayar' | 'belum_bayar',
    checkoutTotal: number,
    checkoutClientName: string,
    checkoutAmountPaid: number | '',
    checkoutKembalian: number
  ): Promise<void> => {
    if (cart.length === 0) return

    const orderDate = new Date()
    const formattedDate = orderDate.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    if (status === 'bayar') {
      await printReceipt(
        cart,
        checkoutTotal,
        paymentMethod,
        undefined,
        orderDate,
        undefined,
        checkoutClientName,
        typeof checkoutAmountPaid === 'number' ? checkoutAmountPaid : undefined,
        checkoutKembalian > 0 ? checkoutKembalian : undefined
      )
      await printChecker(cart, formattedDate, orderDate, checkoutClientName)
      await printLabel(cart, checkoutClientName, undefined, orderDate)
      return
    }

    await printChecker(cart, formattedDate, orderDate, checkoutClientName)
    await printLabel(cart, checkoutClientName, undefined, orderDate)
  }

  // Helper function to get product stock from shop location
  const getProductStock = (productId: number): number => {
    const stock = productStocks?.find(s => s.produk_id === productId)
    return stock?.quantity || 0
  }

  // Helper function to check if product is out of stock
  const isProductOutOfStock = (product: any): boolean => {
    // Only check stock for stockable products
    if (!product.stockable) {
      return false
    }
    const stock = getProductStock(product.id)
    return stock <= 0
  }

  const handleCheckout = () => {
    if (localCart.length === 0) {
      toast.error('Keranjang kosong!')
      return
    }

    // Validate payment amount only for cash payment
    if (paymentStatus === 'bayar' && paymentMethod === 'cash') {
      if (typeof amountPaid !== 'number' || amountPaid <= 0) {
        toast.error('Masukkan jumlah uang yang dibayar!')
        return
      }
      const amountToCheck = subtotal > 0 ? subtotal : total
      if (amountPaid < amountToCheck) {
        toast.error(`Uang dibayar (${formatPrice(amountPaid)}) tidak boleh kurang dari total (${formatPrice(amountToCheck)})!`)
        return
      }
    }

    // Validate stock before checkout
    // for (const item of localCart) {
    //   if (item.produk?.stockable) {
    //     const availableStock = getProductStock(item.produk_id)
    //     if (item.quantity > availableStock) {
    //       toast.error(`${item.produk?.nama}: Stok tidak mencukupi! Stok tersedia: ${availableStock}`)
    //       return
    //     }
    //   }
    // }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('lokasi_id', DEFAULT_SHOP_LOCATION_ID.toString())
    formData.append('metode_pembayaran', paymentMethod)
    formData.append('status', paymentStatus)
    if (clientName) formData.append('nama_client', clientName)
    if (qrisImage && paymentMethod === 'qris') {
      formData.append('gambar_qris', qrisImage)
    }
    formData.append('items', JSON.stringify(localCart.map(item => ({
      produk_id: item.produk_id,
      quantity: item.quantity,
      harga_satuan: item.produk && item.produk.harga ? item.produk.harga : 0,
      coffee_strength: item.coffee_strength,
      coffee_grams: item.coffee_grams,
      target_material_id: resolveCoffeeMaterialId(item.produk),
      catatan: item.catatan?.trim() || undefined,
    }))))

    // Prepare data in the format expected by CreateOrderRequest
    const orderRequest: any = {
      lokasi_id: DEFAULT_SHOP_LOCATION_ID,
      metode_pembayaran: paymentMethod,
      status: paymentStatus,
      nama_client: clientName || undefined,
      gambar_qris: qrisImage && paymentMethod === 'qris' ? qrisImage : undefined,
      subtotal: subtotal,
      uang_dibayar: paymentMethod === 'cash' && paymentStatus === 'bayar' && typeof amountPaid === 'number' ? amountPaid : undefined,
      kembalian: paymentMethod === 'cash' && paymentStatus === 'bayar' ? kembalian : undefined,
      items: localCart.map(item => ({
        produk_id: item.produk_id,
        quantity: item.quantity,
        harga_satuan: item.produk?.harga || 0,
        coffee_strength: item.coffee_strength,
        coffee_grams: item.coffee_grams,
        target_material_id: resolveCoffeeMaterialId(item.produk),
        catatan: item.catatan?.trim() || undefined,
      }))
    };
    
    const cartSnapshot = [...localCart]
    const checkoutClientName = clientName
    const checkoutAmountPaid = amountPaid
    const checkoutKembalian = kembalian
    const checkoutPaymentStatus = paymentStatus

    createOrder.mutate(orderRequest, {
      onSuccess: () => {
        handlePrintOnCheckout(
          cartSnapshot,
          checkoutPaymentStatus,
          total,
          checkoutClientName,
          checkoutAmountPaid,
          checkoutKembalian
        ).then(() => {
          setLocalCart([])
          setClientName('')
          setQrisImage(null)
          setAmountPaid('')
        })
      }
    })
  }

  const itemIsCoffee = (item: { produk: any }) => {
    const p = item?.produk
    return isProductCoffee(p)
  }

  const resolveCoffeeMaterialId = (product: any): number | undefined => {
    try {
      const rm: any[] = product?.resep?.recipe_materials || []
      const flagged = rm.find((x: any) => x?.material?.is_bahan_kopi)
      if (flagged) return flagged.material_id
      const byName = rm.find((x: any) => {
        const nama = x?.material?.name || x?.material?.nama || ''
        const lower = (nama || '').toLowerCase()
        return lower.includes('kopi') || lower.includes('coffee') || lower.includes('espresso')
      })
      if (byName) return byName.material_id
      const byUnit = rm.find((x: any) => (x?.unit || '').toLowerCase().includes('gram'))
      if (byUnit) return byUnit.material_id
      return undefined
    } catch (e) {
      return undefined
    }
  }

  const isProductCoffee = (product: any): boolean => {
    try {
      const flagged = !!(product?.resep?.is_kopi)
      const namaKategori = (product?.kategori?.nama || '').toLowerCase()
      const kategoriMatch = namaKategori.includes('kopi') || namaKategori.includes('coffee')
      return flagged || kategoriMatch
    } catch (e) {
      return false
    }
  }


  const kategorix = categories as any
  const foodCategories = (kategorix?.data ? kategorix?.data : kategorix)?.filter((item: any) =>
    !['Bahan Baku','Bahan Baku Kitchen'].includes(item?.nama || ''))

 

  // Toggle favorite status using API
  const toggleFavorite = async (productId: number) => {
    try {
      await productService.toggleFavorite(productId)
      // Invalidate and refetch all product queries
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Status favorit diperbarui')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status favorit')
    }
  }

  // Get favorite products count from all products
  const favoriteCount = allProducts?.data?.filter((p: any) => p.favorite).length || 0

  // If shift is loading, show loading state
  if (isLoadingShift) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data shift kasir...</p>
        </div>
      </div>
    )
  }

  // Check if shift exists and is open
  // currentShift can be null if no shift exists, or an object if shift exists
  // Also verify that the shift belongs to the correct location
  const hasOpenShift = currentShift != null
    && currentShift?.status === 'open'
    && (currentShift?.lokasi_id === DEFAULT_SHOP_LOCATION_ID || currentShift?.lokasi?.id === DEFAULT_SHOP_LOCATION_ID)

  // If shift is not open or doesn't exist, show message
  if (!hasOpenShift) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Shift Kasir Belum Dibuka
              </h2>
              <p className="text-gray-600 mb-6">
                Anda harus membuka shift kasir terlebih dahulu sebelum dapat menggunakan fitur kasir.
              </p>
              <Button
                onClick={() => navigate('/shift-kasir')}
                className="w-full"
                size="lg"
              >
                Buka Shift Kasir
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Kasir</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant={showCart ? "default" : "outline"}
                onClick={() => setShowCart(!showCart)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {showCart ? 'Tutup Keranjang' : 'Buka Keranjang'}
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex-1 mb-2">
                <div className="relative ">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">


                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === null && !showFavorites ? "default" : "outline"}
                    onClick={() => {
                      setSelectedCategory(null)
                      setShowFavorites(false)
                    }}
                    size="sm"
                  >
                    Semua
                  </Button>

                  <Button
                    variant={showFavorites ? "default" : "outline"}
                    onClick={() => {
                      setShowFavorites(!showFavorites)
                      setSelectedCategory(null)
                    }}
                    size="sm"
                    className="flex items-center gap-1 bg-pink-50 hover:bg-pink-100 border-pink-200"
                  >
                    <Heart className="h-4 w-4 text-pink-600" />
                    Menu Favorit ({favoriteCount})
                  </Button>
                  {foodCategories?.map((category:any) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setShowFavorites(false)
                      }}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Utensils className="h-4 w-4" />
                      {category.nama}
                    </Button>
                  ))}

                  {foodCategories?.length === 0 && (
                    <span className="text-sm text-gray-500">
                      Tidak ada kategori tersedia
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Favorites Section - Show when favorites filter is active */}
            {showFavorites && favoriteCount > 0 && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <h3 className="text-lg font-semibold text-pink-800">Menu Favorit</h3>
                    <Badge className="bg-pink-100 text-pink-800">{favoriteCount} item</Badge>
                  </div>
                  <p className="text-sm text-pink-700 mb-4">
                    Menu yang sering dipesan - klik untuk menambah ke keranjang dengan cepat
                  </p>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 items-stretch">
              {productsLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="p-3 h-full flex flex-col animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded mb-2 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2 mt-auto"></div>
                    </div>
                  </Card>
                ))
              ) : productsError ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-red-500 mb-4">
                    <Package className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error memuat produk</h3>
                  <p className="text-gray-500">
                    Terjadi kesalahan saat memuat data produk. Silakan coba lagi.
                  </p>
                </div>
              ) : products?.data && products.data.length > 0 ? (
                products.data.map((product: any) => {
                  const productStock = getProductStock(product.id)
                  const isOutOfStock = isProductOutOfStock(product)

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      productStock={productStock}
                      isOutOfStock={isOutOfStock}
                      isFavorite={product.favorite || false}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={toggleFavorite}
                    />
                  )
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  {showFavorites ? (
                    <div>
                      <Heart className="h-12 w-12 mx-auto text-pink-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada menu favorit</h3>
                      <p className="text-gray-500 mb-4">
                        Klik ikon hati pada produk untuk menambahkannya ke menu favorit
                      </p>
                      <Button
                        onClick={() => setShowFavorites(false)}
                        variant="outline"
                        size="sm"
                        className="bg-pink-50 hover:bg-pink-100 border-pink-200"
                      >
                        Lihat Semua Menu
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || selectedCategory
                          ? 'Tidak ada produk yang sesuai dengan filter yang dipilih.'
                          : 'Belum ada produk yang tersedia.'}
                      </p>
                      {!searchTerm && !selectedCategory && (
                        <Button
                          onClick={() => window.location.href = '/produk/tambah'}
                          variant="outline"
                          size="sm"
                        >
                          Tambah Produk
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          {showCart && (
          <CartSidebar
            cart={localCart}
            total={total}
            subtotal={subtotal}
            amountPaid={amountPaid}
            kembalian={kembalian}
            paymentMethod={paymentMethod}
            paymentStatus={paymentStatus}
            clientName={clientName}
            qrisImage={qrisImage}
            onClose={() => setShowCart(false)}
            onPaymentMethodChange={setPaymentMethod}
            onPaymentStatusChange={setPaymentStatus}
            onClientNameChange={setClientName}
            onQrisImageChange={setQrisImage}
            onAmountPaidChange={setAmountPaid}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onCoffeeOptionChange={handleCoffeeOptionChange}
            onCatatanChange={handleCatatanChange}
            onCheckout={handleCheckout}
            getProductStock={getProductStock}
            isCheckoutPending={createOrder.isPending}
          />
          )}
        </div>
      </div>
    </div>
  )
}
