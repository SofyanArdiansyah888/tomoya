# UI/UX System Design - Tomoya Coffee Shop

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Component Architecture](#component-architecture)
3. [State Management Design](#state-management-design)
4. [Design Token System](#design-token-system)
5. [Component Composition Patterns](#component-composition-patterns)
6. [Performance Architecture](#performance-architecture)
7. [Accessibility Architecture](#accessibility-architecture)
8. [Responsive System Design](#responsive-system-design)
9. [Animation and Interaction System](#animation-and-interaction-system)
10. [Testing Architecture](#testing-architecture)

## System Architecture Overview

### Frontend Architecture Pattern
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (Route Components)                                  │
│  ├── HomePage                                              │
│  ├── ProductPage                                           │
│  ├── CartPage                                              │
│  └── CheckoutPage                                          │
├─────────────────────────────────────────────────────────────┤
│  Feature Components                                       │
│  ├── ProductCard                                            │
│  ├── CartItem                                             │
│  ├── OrderSummary                                         │
│  └── UserProfile                                          │
├─────────────────────────────────────────────────────────────┤
│  UI Components (shadcn/ui)                                 │
│  ├── Button                                               │
│  ├── Input                                                │
│  ├── Card                                                 │
│  └── Modal                                                │
├─────────────────────────────────────────────────────────────┤
│  Design System Layer                                       │
│  ├── Design Tokens                                        │
│  ├── Theme Provider                                       │
│  └── Style Utilities                                      │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                    │
│  ├── Global State (Zustand)                               │
│  ├── Local State (React)                                  │
│  └── Server State (React Query)                           │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                             │
│  ├── API Services                                         │
│  ├── Authentication                                       │
│  └── Data Transformers                                    │
└─────────────────────────────────────────────────────────────┘
```

### Design System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Design System Core                      │
├─────────────────────────────────────────────────────────────┤
│  Design Tokens                                             │
│  ├── Colors                                               │
│  ├── Typography                                           │
│  ├── Spacing                                              │
│  ├── Shadows                                              │
│  └── Border Radius                                        │
├─────────────────────────────────────────────────────────────┤
│  Component Library                                         │
│  ├── Primitives (Atoms)                                   │
│  ├── Composites (Molecules)                               │
│  ├── Layouts (Organisms)                                  │
│  └── Templates (Pages)                                    │
├─────────────────────────────────────────────────────────────┤
│  Theme System                                              │
│  ├── Light Theme                                          │
│  ├── Dark Theme (Future)                                  │
│  └── Custom Themes                                        │
├─────────────────────────────────────────────────────────────┤
│  Utilities                                                 │
│  ├── TailwindCSS Classes                                  │
│  ├── CSS Custom Properties                                │
│  └── Utility Functions                                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Atomic Design Implementation

#### Atoms (Basic Building Blocks)
```typescript
// Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// Input Component
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}
```

#### Molecules (Simple Combinations)
```typescript
// Product Card
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

// Search Bar
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

// Cart Item
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}
```

#### Organisms (Complex Components)
```typescript
// Product Grid
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  filters?: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

// Shopping Cart
interface ShoppingCartProps {
  items: CartItem[];
  total: number;
  onUpdateItem: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

// Navigation Header
interface NavigationHeaderProps {
  user?: User;
  cartItemCount: number;
  onLogin: () => void;
  onLogout: () => void;
  onCartClick: () => void;
}
```

### Component Composition Patterns

#### Render Props Pattern
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading, error)}</>;
};
```

#### Compound Component Pattern
```typescript
interface ProductCardProps {
  children: React.ReactNode;
  className?: string;
}

const ProductCard = ({ children, className }: ProductCardProps) => {
  return (
    <div className={`product-card ${className}`}>
      {children}
    </div>
  );
};

const ProductCardImage = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="product-card-image" />
);

const ProductCardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="product-card-content">{children}</div>
);

const ProductCardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="product-card-title">{children}</h3>
);

const ProductCardPrice = ({ price }: { price: number }) => (
  <div className="product-card-price">${price}</div>
);

// Usage
<ProductCard>
  <ProductCardImage src="/coffee.jpg" alt="Coffee" />
  <ProductCardContent>
    <ProductCardTitle>Premium Coffee</ProductCardTitle>
    <ProductCardPrice price={12.99} />
  </ProductCardContent>
</ProductCard>
```

#### Higher-Order Component Pattern
```typescript
interface WithLoadingProps {
  loading: boolean;
}

const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & WithLoadingProps) => {
    if (props.loading) {
      return <LoadingSpinner />;
    }
    return <Component {...props} />;
  };
};

const ProductListWithLoading = withLoading(ProductList);
```

## State Management Design

### Global State Architecture
```typescript
// Zustand Store Structure
interface AppState {
  // Authentication State
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
  };
  
  // Cart State
  cart: {
    items: CartItem[];
    total: number;
    itemCount: number;
    loading: boolean;
  };
  
  // Product State
  products: {
    items: Product[];
    categories: Category[];
    filters: ProductFilters;
    loading: boolean;
    error: string | null;
  };
  
  // UI State
  ui: {
    sidebarOpen: boolean;
    modalOpen: boolean;
    theme: 'light' | 'dark';
    notifications: Notification[];
  };
}

// Store Actions
interface AppActions {
  // Auth Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  
  // Cart Actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Product Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  openModal: (modalType: string) => void;
  closeModal: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

### Local State Management
```typescript
// Custom Hooks for Local State
const useProductForm = (initialProduct?: Product) => {
  const [formData, setFormData] = useState<ProductFormData>(
    initialProduct || defaultProductForm
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await productService.createProduct(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    submit,
    reset: () => setFormData(defaultProductForm)
  };
};
```

### Server State Management
```typescript
// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Query Hooks
const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    enabled: true,
  });
};

const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

// Mutation Hooks
const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AddToCartData) => cartService.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['products']);
    },
  });
};
```

## Design Token System

### Token Structure
```typescript
// Design Token Types
interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    semantic: {
      success: ColorScale;
      warning: ColorScale;
      error: ColorScale;
      info: ColorScale;
    };
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      mono: string;
    };
    fontSize: FontSizeScale;
    fontWeight: FontWeightScale;
    lineHeight: LineHeightScale;
  };
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  breakpoints: BreakpointScale;
}

// Color Scale Implementation
interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

// Token Provider
const DesignTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tokens: DesignTokens = {
    colors: {
      primary: {
        50: '#faf7f2',
        100: '#f2ebe0',
        // ... rest of the scale
      },
      // ... other color scales
    },
    // ... other token categories
  };

  return (
    <DesignTokenContext.Provider value={tokens}>
      {children}
    </DesignTokenContext.Provider>
  );
};
```

### CSS Custom Properties Integration
```css
/* CSS Custom Properties from Design Tokens */
:root {
  /* Colors */
  --color-primary-50: #faf7f2;
  --color-primary-100: #f2ebe0;
  --color-primary-500: #9d7c4a;
  --color-primary-600: #8b6b3a;
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

## Performance Architecture

### Code Splitting Strategy
```typescript
// Route-based Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

// Component-based Code Splitting
const ProductModal = lazy(() => import('./components/ProductModal'));
const ImageGallery = lazy(() => import('./components/ImageGallery'));

// Feature-based Code Splitting
const AdminPanel = lazy(() => import('./features/admin/AdminPanel'));
const UserDashboard = lazy(() => import('./features/user/UserDashboard'));
```

### Image Optimization System
```typescript
// Image Component with Optimization
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};
```

### Bundle Optimization
```typescript
// Webpack Bundle Analyzer Configuration
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
```

## Accessibility Architecture

### Accessibility Provider
```typescript
interface AccessibilityContextType {
  announce: (message: string) => void;
  setFocus: (elementId: string) => void;
  trapFocus: (containerId: string) => void;
  releaseFocus: () => void;
}

const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const announce = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const setFocus = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }, []);

  return (
    <AccessibilityContext.Provider value={{ announce, setFocus }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
```

### Focus Management System
```typescript
// Focus Trap Hook
const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};
```

## Responsive System Design

### Breakpoint System
```typescript
// Breakpoint Configuration
const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Responsive Hook
const useResponsive = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setCurrentBreakpoint('2xl');
      else if (width >= 1280) setCurrentBreakpoint('xl');
      else if (width >= 1024) setCurrentBreakpoint('lg');
      else if (width >= 768) setCurrentBreakpoint('md');
      else if (width >= 640) setCurrentBreakpoint('sm');
      else setCurrentBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    currentBreakpoint,
    isMobile: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl',
  };
};
```

### Container System
```typescript
// Container Component
interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'md',
  center = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: 'px-0',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  };

  return (
    <div
      className={`
        ${maxWidthClasses[maxWidth]}
        ${paddingClasses[padding]}
        ${center ? 'mx-auto' : ''}
        w-full
      `}
    >
      {children}
    </div>
  );
};
```

## Animation and Interaction System

### Animation Library Integration
```typescript
// Framer Motion Configuration
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

// Page Transition Component
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};
```

### Micro-interaction System
```typescript
// Hover Animation Hook
const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    animate: {
      scale: isHovered ? 1.05 : 1,
      y: isHovered ? -2 : 0,
    },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  };

  return hoverProps;
};

// Loading Animation Component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-coffee-200 border-t-coffee-600 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};
```

## Testing Architecture

### Component Testing Strategy
```typescript
// Component Test Utilities
const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createStore(),
    ...renderOptions
  } = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          {children}
        </Router>
      </ThemeProvider>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Component Test Example
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const mockProduct = {
      id: '1',
      name: 'Premium Coffee',
      price: 12.99,
      image: '/coffee.jpg',
    };

    renderWithProviders(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Premium Coffee')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByAltText('Premium Coffee')).toBeInTheDocument();
  });

  it('calls onAddToCart when add button is clicked', () => {
    const mockOnAddToCart = jest.fn();
    const mockProduct = { id: '1', name: 'Coffee', price: 10 };

    renderWithProviders(
      <ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />
    );

    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockOnAddToCart).toHaveBeenCalledWith('1');
  });
});
```

### Accessibility Testing
```typescript
// Accessibility Test Utilities
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations', async () => {
    const { container } = renderWithProviders(<ProductCard product={mockProduct} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    addButton.focus();
    expect(addButton).toHaveFocus();
    
    fireEvent.keyDown(addButton, { key: 'Enter' });
    expect(mockOnAddToCart).toHaveBeenCalled();
  });
});
```

### Visual Regression Testing
```typescript
// Storybook Stories for Visual Testing
export default {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    docs: {
      description: {
        component: 'A card component for displaying product information.',
      },
    },
  },
} as ComponentMeta<typeof ProductCard>;

export const Default: ComponentStory<typeof ProductCard> = (args) => (
  <ProductCard {...args} />
);

Default.args = {
  product: {
    id: '1',
    name: 'Premium Coffee',
    price: 12.99,
    image: '/coffee.jpg',
    description: 'A delicious premium coffee blend.',
  },
  onAddToCart: () => {},
  onViewDetails: () => {},
};

export const Loading: ComponentStory<typeof ProductCard> = (args) => (
  <ProductCard {...args} loading />
);

export const OutOfStock: ComponentStory<typeof ProductCard> = (args) => (
  <ProductCard {...args} outOfStock />
);
```

This comprehensive UI/UX system design provides the architectural foundation for building a scalable, maintainable, and accessible coffee shop application with professional design standards and modern development practices.
