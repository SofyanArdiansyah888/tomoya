# Frontend Structure - Tomoya Coffee Shop

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API / Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── common/
│   │       ├── Loading.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── NotFound.tsx
│   │       └── SearchBar.tsx
│   ├── pages/
│   │   ├── Beranda/
│   │   │   ├── Beranda.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProdukUnggulan.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProdukUnggulan.ts
│   │   │   │   └── useKategori.ts
│   │   │   ├── query/
│   │   │   │   ├── useProdukUnggulanQuery.ts
│   │   │   │   └── useKategoriQuery.ts
│   │   │   ├── store/
│   │   │   │   ├── berandaStore.ts
│   │   │   │   └── produkUnggulanStore.ts
│   │   │   └── components/
│   │   │       ├── KartuProduk.tsx
│   │   │       └── KartuKategori.tsx
│   │   ├── Produk/
│   │   │   ├── Produk.tsx
│   │   │   ├── DaftarProduk.tsx
│   │   │   ├── FilterProduk.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProduk.ts
│   │   │   │   ├── useFilterProduk.ts
│   │   │   │   └── usePencarianProduk.ts
│   │   │   ├── query/
│   │   │   │   ├── useProdukQuery.ts
│   │   │   │   ├── useFilterProdukQuery.ts
│   │   │   │   └── usePencarianProdukQuery.ts
│   │   │   ├── store/
│   │   │   │   ├── produkStore.ts
│   │   │   │   ├── filterProdukStore.ts
│   │   │   │   └── pencarianProdukStore.ts
│   │   │   └── components/
│   │   │       ├── KartuProduk.tsx
│   │   │       ├── SidebarFilter.tsx
│   │   │       └── DropdownUrut.tsx
│   │   ├── DetailProduk/
│   │   │   ├── DetailProduk.tsx
│   │   │   ├── GambarProduk.tsx
│   │   │   ├── InfoProduk.tsx
│   │   │   ├── UlasanProduk.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDetailProduk.ts
│   │   │   │   ├── useUlasanProduk.ts
│   │   │   │   └── useTambahKeKeranjang.ts
│   │   │   ├── query/
│   │   │   │   ├── useDetailProdukQuery.ts
│   │   │   │   ├── useUlasanProdukQuery.ts
│   │   │   │   └── useTambahKeKeranjangMutation.ts
│   │   │   ├── store/
│   │   │   │   ├── detailProdukStore.ts
│   │   │   │   └── ulasanProdukStore.ts
│   │   │   └── components/
│   │   │       ├── GaleriGambar.tsx
│   │   │       ├── PilihJumlah.tsx
│   │   │       └── TombolTambahKeKeranjang.tsx
│   │   ├── Keranjang/
│   │   │   ├── Keranjang.tsx
│   │   │   ├── DaftarKeranjang.tsx
│   │   │   ├── RingkasanKeranjang.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useKeranjang.ts
│   │   │   │   ├── useItemKeranjang.ts
│   │   │   │   └── useTotalKeranjang.ts
│   │   │   ├── query/
│   │   │   │   ├── useKeranjangQuery.ts
│   │   │   │   ├── useUpdateKeranjangMutation.ts
│   │   │   │   └── useHapusDariKeranjangMutation.ts
│   │   │   ├── store/
│   │   │   │   ├── keranjangStore.ts
│   │   │   │   ├── itemKeranjangStore.ts
│   │   │   │   └── totalKeranjangStore.ts
│   │   │   └── components/
│   │   │       ├── ItemKeranjang.tsx
│   │   │       ├── KeranjangKosong.tsx
│   │   │       └── DrawerKeranjang.tsx
│   │   ├── Checkout/
│   │   │   ├── Checkout.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCheckout.ts
│   │   │   │   ├── useShippingForm.ts
│   │   │   │   └── usePaymentForm.ts
│   │   │   ├── query/
│   │   │   │   ├── useCreateOrderMutation.ts
│   │   │   │   └── useOrderSummaryQuery.ts
│   │   │   ├── store/
│   │   │   │   ├── checkoutStore.ts
│   │   │   │   ├── shippingFormStore.ts
│   │   │   │   └── paymentFormStore.ts
│   │   │   └── components/
│   │   │       ├── ShippingForm.tsx
│   │   │       ├── PaymentForm.tsx
│   │   │       └── OrderReview.tsx
│   │   ├── Orders/
│   │   │   ├── Orders.tsx
│   │   │   ├── OrderHistory.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useOrders.ts
│   │   │   │   └── useOrderHistory.ts
│   │   │   ├── query/
│   │   │   │   ├── useOrdersQuery.ts
│   │   │   │   └── useOrderHistoryQuery.ts
│   │   │   ├── store/
│   │   │   │   ├── ordersStore.ts
│   │   │   │   └── orderHistoryStore.ts
│   │   │   └── components/
│   │   │       ├── OrderCard.tsx
│   │   │       └── OrderStatus.tsx
│   │   ├── Profile/
│   │   │   ├── Profile.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProfile.ts
│   │   │   │   └── useProfileUpdate.ts
│   │   │   ├── query/
│   │   │   │   ├── useProfileQuery.ts
│   │   │   │   └── useUpdateProfileMutation.ts
│   │   │   ├── store/
│   │   │   │   ├── profileStore.ts
│   │   │   │   └── profileFormStore.ts
│   │   │   └── components/
│   │   │       ├── ProfileCard.tsx
│   │   │       └── AddressForm.tsx
│   │   ├── Auth/
│   │   │   ├── Login/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useLogin.ts
│   │   │   │   ├── query/
│   │   │   │   │   └── useLoginMutation.ts
│   │   │   │   ├── store/
│   │   │   │   │   └── loginFormStore.ts
│   │   │   │   └── components/
│   │   │   │       └── LoginForm.tsx
│   │   │   ├── Register/
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useRegister.ts
│   │   │   │   ├── query/
│   │   │   │   │   └── useRegisterMutation.ts
│   │   │   │   ├── store/
│   │   │   │   │   └── registerFormStore.ts
│   │   │   │   └── components/
│   │   │   │       └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useLogout.ts
│   │   │   ├── query/
│   │   │   │   ├── useAuthQuery.ts
│   │   │   │   └── useLogoutMutation.ts
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts
│   │   │   │   └── userStore.ts
│   │   │   └── components/
│   │   │       └── AuthGuard.tsx
│   │   └── admin/
│   │       ├── Dashboard/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── hooks/
│   │       │   │   ├── useDashboardStats.ts
│   │       │   │   └── useChartData.ts
│   │       │   ├── query/
│   │       │   │   ├── useDashboardStatsQuery.ts
│   │       │   │   └── useChartDataQuery.ts
│   │       │   ├── store/
│   │       │   │   ├── dashboardStore.ts
│   │       │   │   └── statsStore.ts
│   │       │   └── components/
│   │       │       ├── StatsCard.tsx
│   │       │       └── Chart.tsx
│   │       ├── Products/
│   │       │   ├── Products.tsx
│   │       │   ├── ProductForm.tsx
│   │       │   ├── hooks/
│   │       │   │   ├── useAdminProducts.ts
│   │       │   │   ├── useProductForm.ts
│   │       │   │   └── useProductDelete.ts
│   │       │   ├── query/
│   │       │   │   ├── useAdminProductsQuery.ts
│   │       │   │   ├── useCreateProductMutation.ts
│   │       │   │   ├── useUpdateProductMutation.ts
│   │       │   │   └── useDeleteProductMutation.ts
│   │       │   ├── table/
│   │       │   │   ├── columns.ts
│   │       │   │   ├── useProductTable.ts
│   │       │   │   └── ProductTableFilters.tsx
│   │       │   ├── store/
│   │       │   │   ├── adminProductsStore.ts
│   │       │   │   ├── productFormStore.ts
│   │       │   │   └── productDeleteStore.ts
│   │       │   └── components/
│   │       │       ├── ProductTable.tsx
│   │       │       └── ProductModal.tsx
│   │       ├── Orders/
│   │       │   ├── Orders.tsx
│   │       │   ├── hooks/
│   │       │   │   ├── useAdminOrders.ts
│   │       │   │   └── useOrderStatusUpdate.ts
│   │       │   ├── query/
│   │       │   │   ├── useAdminOrdersQuery.ts
│   │       │   │   └── useUpdateOrderStatusMutation.ts
│   │       │   ├── table/
│   │       │   │   ├── columns.ts
│   │       │   │   ├── useOrderTable.ts
│   │       │   │   └── OrderTableFilters.tsx
│   │       │   ├── store/
│   │       │   │   ├── adminOrdersStore.ts
│   │       │   │   └── orderStatusStore.ts
│   │       │   └── components/
│   │       │       ├── OrderTable.tsx
│   │       │       └── OrderDetails.tsx
│   │       └── Users/
│   │           ├── Users.tsx
│   │           ├── hooks/
│   │           │   └── useAdminUsers.ts
│   │           ├── query/
│   │           │   └── useAdminUsersQuery.ts
│   │           ├── table/
│   │           │   ├── columns.ts
│   │           │   ├── useUserTable.ts
│   │           │   └── UserTableFilters.tsx
│   │           ├── store/
│   │           │   └── adminUsersStore.ts
│   │           └── components/
│   │               └── UserTable.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useToast.ts
│   ├── query/
│   │   ├── client.ts
│   │   ├── keys.ts
│   │   └── types.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   └── orders.ts
│   ├── store/
│   │   ├── index.ts
│   │   └── globalStore.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── router/
│   │   ├── index.tsx
│   │   ├── routes.tsx
│   │   ├── AppRouter.tsx
│   │   └── ProtectedRoute.tsx
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Key Directories Explanation

### `/components`
- **ui/**: Reusable shadcn/ui components (shared across the app)
- **layout/**: Global layout components (Header, Footer, Sidebar)
- **common/**: Shared/common components used across multiple pages

### `/pages` (Co-location Pattern)
Setiap halaman memiliki folder sendiri dengan komponen terkait:
- **Home/**: Homepage dengan HeroSection, FeaturedProducts, dan komponen terkait
- **Products/**: Product listing dengan ProductList, ProductFilter, dan komponen terkait
- **ProductDetail/**: Product detail dengan ProductImages, ProductInfo, dan komponen terkait
- **Cart/**: Shopping cart dengan CartList, CartSummary, dan komponen terkait
- **Checkout/**: Checkout process dengan CheckoutForm, OrderSummary, dan komponen terkait
- **Orders/**: Order history dengan OrderHistory dan komponen terkait
- **Profile/**: User profile dengan ProfileForm dan komponen terkait
- **Auth/**: Authentication pages (Login, Register) dengan komponen terkait
- **admin/**: Admin panel pages dengan komponen terkait masing-masing

### Co-location Benefits
- **Maintainability**: Komponen, hooks, dan store terkait berada dalam satu tempat
- **Discoverability**: Mudah menemukan komponen, hooks, dan store yang terkait dengan halaman tertentu
- **Scalability**: Struktur yang jelas untuk tim development
- **Code Organization**: Logical grouping berdasarkan feature/page
- **State Management**: Store yang spesifik untuk modul tidak mengotori global state
- **Performance**: Hanya load store yang diperlukan untuk modul tertentu

### `/hooks` (Global Shared Hooks)
- **useApi.ts**: Base API hook for HTTP requests
- **useLocalStorage.ts**: Local storage management
- **useDebounce.ts**: Debounce utility hook
- **useToast.ts**: Toast notification hook

### `/query` (TanStack Query Configuration)
- **client.ts**: Query client configuration
- **keys.ts**: Query keys factory
- **types.ts**: Query-related types

### Module-Specific Hooks (Co-location)
Setiap modul memiliki hooks yang spesifik untuk kebutuhan modul tersebut:
- **Home/**: useFeaturedProducts, useCategories
- **Products/**: useProducts, useProductFilters, useProductSearch
- **ProductDetail/**: useProductDetail, useProductReviews, useAddToCart
- **Cart/**: useCart, useCartItems, useCartTotal
- **Checkout/**: useCheckout, useShippingForm, usePaymentForm
- **Orders/**: useOrders, useOrderHistory
- **Profile/**: useProfile, useProfileUpdate
- **Auth/**: useAuth, useLogin, useRegister, useLogout
- **Admin/**: useDashboardStats, useAdminProducts, useAdminOrders, dll

### Module-Specific Queries (Co-location)
Setiap modul memiliki TanStack Query hooks yang spesifik:
- **Home/**: useFeaturedProductsQuery, useCategoriesQuery
- **Products/**: useProductsQuery, useProductFiltersQuery, useProductSearchQuery
- **ProductDetail/**: useProductDetailQuery, useProductReviewsQuery, useAddToCartMutation
- **Cart/**: useCartQuery, useUpdateCartMutation, useRemoveFromCartMutation
- **Checkout/**: useCreateOrderMutation, useOrderSummaryQuery
- **Orders/**: useOrdersQuery, useOrderHistoryQuery
- **Profile/**: useProfileQuery, useUpdateProfileMutation
- **Auth/**: useAuthQuery, useLoginMutation, useRegisterMutation, useLogoutMutation
- **Admin/**: useDashboardStatsQuery, useAdminProductsQuery, useAdminOrdersQuery, dll

### TanStack Table (Admin Section)
Admin section menggunakan TanStack Table untuk data management:
- **Products/**: columns.ts, useProductTable.ts, ProductTableFilters.tsx
- **Orders/**: columns.ts, useOrderTable.ts, OrderTableFilters.tsx
- **Users/**: columns.ts, useUserTable.ts, UserTableFilters.tsx

### `/services`
- API service functions
- HTTP request handlers
- Business logic separation

### `/store` (Global Shared Stores)
- **index.ts**: Store configuration and exports
- **globalStore.ts**: Global application state (theme, notifications, etc.)

### Module-Specific Stores (Co-location)
Setiap modul memiliki store yang spesifik untuk kebutuhan modul tersebut:
- **Home/**: homeStore, featuredProductsStore
- **Products/**: productsStore, productFiltersStore, productSearchStore
- **ProductDetail/**: productDetailStore, productReviewsStore
- **Cart/**: cartStore, cartItemsStore, cartTotalStore
- **Checkout/**: checkoutStore, shippingFormStore, paymentFormStore
- **Orders/**: ordersStore, orderHistoryStore
- **Profile/**: profileStore, profileFormStore
- **Auth/**: authStore, userStore, loginFormStore, registerFormStore
- **Admin/**: dashboardStore, adminProductsStore, adminOrdersStore, dll

### `/types`
- TypeScript type definitions
- Interface declarations
- Type safety

### `/router` (React Router Configuration)
- **index.tsx**: Router configuration exports
- **routes.tsx**: Route definitions
- **AppRouter.tsx**: Main router component
- **ProtectedRoute.tsx**: Protected route wrapper

### `/utils`
- Utility functions
- Constants
- Helper functions
- Formatters and validators

## Component Architecture

### Atomic Design Pattern
- **Atoms**: Basic UI elements (Button, Input, etc.)
- **Molecules**: Simple combinations (SearchBar, ProductCard)
- **Organisms**: Complex components (ProductList, Cart)
- **Templates**: Page layouts
- **Pages**: Complete page components

## State Management Strategy

### Local State
- Component-level state with useState/useReducer
- Form state management

### Global State
- Authentication state (user info, tokens)
- Shopping cart state
- Product catalog state
- UI state (modals, loading states)

## Routing Structure

```
/ - Home page
/products - Product catalog
/products/:id - Product detail
/cart - Shopping cart
/checkout - Checkout process
/orders - Order history
/profile - User profile
/login - Login page
/register - Registration page
/admin/* - Admin panel routes
```

## Styling Strategy

### TailwindCSS Configuration
- Custom color palette for coffee shop theme
- Responsive design utilities
- Component-specific styles

### shadcn/ui Integration
- Consistent component library
- Customizable theme
- Accessibility features

## Development Guidelines

### Code Organization
- One component per file
- Co-located styles and types
- Clear separation of concerns
- Consistent naming conventions

### Performance Optimization
- Code splitting with React.lazy
- Image optimization
- Bundle size monitoring
- Memoization for expensive operations

### TanStack Query Benefits
- **Caching**: Automatic caching and background updates
- **Synchronization**: Server state synchronization
- **Optimistic Updates**: UI updates before server confirmation
- **Error Handling**: Built-in error handling and retry logic
- **Loading States**: Automatic loading and error states

### TanStack Table Benefits
- **Performance**: Virtualization for large datasets
- **Flexibility**: Highly customizable columns and features
- **Sorting & Filtering**: Built-in sorting and filtering capabilities
- **Pagination**: Server-side and client-side pagination
- **Accessibility**: Built-in accessibility features

### React Router Benefits
- **Nested Routes**: Hierarchical route structure
- **Route Guards**: Protected routes with authentication
- **Code Splitting**: Lazy loading of route components
- **Navigation**: Programmatic navigation and history management

### Testing Strategy
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for user flows
- E2E tests for critical paths
