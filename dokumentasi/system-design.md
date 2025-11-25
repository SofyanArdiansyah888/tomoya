# Tomoya Coffee Shop - System Design

## Overview
Tomoya is a coffee shop application that sells bread and coffee products. The application consists of a React frontend and Laravel backend with authentication using Laravel Sanctum.

## Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: TailwindCSS for utility-first CSS
- **UI Components**: shadcn/ui for consistent, accessible components
- **State Management**: React Context API or Zustand (for complex state)
- **HTTP Client**: Axios for API communication
- **Authentication**: JWT tokens via Laravel Sanctum

### Backend (Laravel)
- **Framework**: Laravel 10+
- **Authentication**: Laravel Sanctum for API authentication
- **Database**: MySQL/PostgreSQL
- **API**: RESTful API with JSON responses
- **File Storage**: Local/S3 for product images

## Core Features

### 1. User Management
- User registration and login
- Profile management
- Role-based access (Customer, Admin)

### 2. Product Management
- Coffee products catalog
- Bread products catalog
- Product categories
- Product images and descriptions
- Inventory management
- Warehouse inventory tracking
- Shop inventory management
- Stock transfer system

### 3. Shopping Cart
- Add/remove products
- Quantity management
- Cart persistence

### 4. Order Management
- Order creation
- Order history
- Order status tracking
- Order confirmation

### 5. Admin Panel
- Product CRUD operations
- Order management
- User management
- Analytics dashboard
- Warehouse management
- Shop management
- Inventory tracking
- Stock transfer management
- Stock alerts and notifications

## Database Schema

### Core Tables
- `users` - User accounts
- `products` - Coffee and bread items
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `cart_items` - Shopping cart items

### Inventory Management Tables
- `warehouses` - Warehouse locations
- `shops` - Coffee shop locations
- `warehouse_inventory` - Warehouse stock levels
- `shop_inventory` - Shop stock levels
- `stock_transfers` - Stock transfer requests
- `stock_transfer_items` - Individual transfer items
- `stock_movements` - Stock movement history
- `stock_alerts` - Low stock and out of stock alerts

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `GET /api/categories` - List categories

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove cart item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/{id}` - Get order details

### Inventory Management
- `GET /api/warehouses` - List warehouses
- `GET /api/warehouses/{id}/inventory` - Get warehouse inventory
- `GET /api/shops` - List shops
- `GET /api/shops/{id}/inventory` - Get shop inventory
- `POST /api/stock-transfers` - Create stock transfer
- `GET /api/stock-transfers` - List stock transfers
- `PUT /api/stock-transfers/{id}/approve` - Approve transfer
- `PUT /api/stock-transfers/{id}/ship` - Ship transfer
- `PUT /api/stock-transfers/{id}/deliver` - Deliver transfer
- `GET /api/stock-alerts` - Get stock alerts
- `GET /api/stock-movements` - Get stock movement history

## Security Considerations
- CORS configuration for frontend-backend communication
- CSRF protection for web routes
- API rate limiting
- Input validation and sanitization
- Secure file upload handling
- Environment variable management

## Deployment
- Frontend: Vercel/Netlify for static hosting
- Backend: DigitalOcean/AWS for server hosting
- Database: Managed database service
- File Storage: AWS S3 or similar for production

## Development Workflow
1. Backend API development with Laravel
2. Frontend development with React
3. API integration and testing
4. Authentication flow implementation
5. UI/UX implementation with TailwindCSS and shadcn
6. Testing and optimization
7. Deployment and monitoring
