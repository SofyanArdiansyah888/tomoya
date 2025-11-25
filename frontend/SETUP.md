# Setup Frontend Tomoya Coffee Shop

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Edit .env file
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📦 Dependencies yang Diinstall

### Core Dependencies
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing

### UI & Styling
- **TailwindCSS** - CSS Framework
- **Lucide React** - Icons
- **Class Variance Authority** - Component Variants

### State Management & Data Fetching
- **TanStack Query** - Server State
- **Zustand** - Client State
- **Axios** - HTTP Client

### Forms & Validation
- **React Hook Form** - Form Handling
- **Zod** - Schema Validation
- **@hookform/resolvers** - Form Validation

### UI Components
- **Radix UI** - Headless Components
- **Sonner** - Toast Notifications

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # UI Components
│   │   ├── ui/             # Base Components
│   │   ├── layout/         # Layout Components
│   │   ├── beranda/        # Home Page Components
│   │   ├── produk/         # Product Components
│   │   ├── keranjang/      # Cart Components
│   │   ├── checkout/       # Checkout Components
│   │   ├── pesanan/        # Order Components
│   │   └── profile/        # Profile Components
│   ├── hooks/              # Custom Hooks
│   ├── pages/              # Page Components
│   ├── services/           # API Services
│   ├── store/              # Zustand Stores
│   ├── types/              # TypeScript Types
│   ├── router/             # Router Configuration
│   └── styles/             # Global Styles
├── public/                 # Static Assets
├── package.json           # Dependencies
├── vite.config.ts         # Vite Configuration
├── tailwind.config.js     # TailwindCSS Configuration
├── tsconfig.json          # TypeScript Configuration
└── README.md              # Documentation
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🔧 Configuration Files

### Vite Config (`vite.config.ts`)
- React plugin
- Path aliases (`@` → `./src`)
- Proxy to backend API
- Development server on port 3000

### TailwindCSS Config (`tailwind.config.js`)
- Custom color scheme
- Component variants
- Responsive breakpoints
- Dark mode support

### TypeScript Config (`tsconfig.json`)
- Strict mode enabled
- Path mapping
- React JSX support
- Modern ES2020 target

## 🌐 API Integration

### Base URL
```env
VITE_API_URL=http://localhost:8000/api
```

### Endpoints
- **Auth**: `/login`, `/register`, `/logout`, `/user`
- **Products**: `/products`, `/categories`
- **Cart**: `/cart`, `/cart/add`, `/cart/update/:id`, `/cart/remove/:id`
- **Orders**: `/orders`

### Authentication
- JWT token stored in localStorage
- Automatic token refresh
- Protected routes
- Logout on token expiry

## 🎨 UI Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid system
- Touch-friendly interactions

### Component Library
- **Button** - Multiple variants and sizes
- **Input** - Form inputs with validation
- **Card** - Content containers
- **Badge** - Status indicators
- **Layout** - Header, Footer, Main content

### State Management
- **Auth Store** - User authentication state
- **Cart Store** - Shopping cart state
- **Persistent Storage** - LocalStorage integration

## 🔒 Security Features

### Authentication
- JWT token-based auth
- Automatic token refresh
- Secure token storage
- Route protection

### Input Validation
- Zod schema validation
- Client-side validation
- Error handling
- Form sanitization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Static Hosting
- Build files in `dist/` directory
- Deploy to any static hosting service
- Configure API URL for production

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **API connection failed**
   - Check backend server is running
   - Verify API URL in `.env`
   - Check CORS configuration

3. **Build errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript errors**
   - Check type definitions
   - Verify import paths
   - Update dependencies

## 📝 Development Notes

### Code Style
- Use TypeScript for all components
- Follow React best practices
- Use custom hooks for logic
- Implement error boundaries

### Performance
- Lazy load components
- Optimize images
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

### Testing
- Unit tests for utilities
- Integration tests for components
- E2E tests for user flows
- API mocking for development

## 🤝 Contributing

1. Follow existing code style
2. Add TypeScript types
3. Test your changes
4. Update documentation
5. Submit pull request

## 📞 Support

For issues and questions:
- Check existing documentation
- Search GitHub issues
- Create new issue with details
- Contact development team
