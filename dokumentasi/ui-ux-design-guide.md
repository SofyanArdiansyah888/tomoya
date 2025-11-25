# UI/UX Design Guide - Tomoya Coffee Shop

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Design System](#design-system)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Component Library](#component-library)
6. [Layout Principles](#layout-principles)
7. [User Experience Guidelines](#user-experience-guidelines)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Performance Guidelines](#performance-guidelines)
11. [Coffee Shop Specific Design](#coffee-shop-specific-design)

## Design Philosophy

### Core Principles
- **Warm & Inviting**: Reflect the cozy atmosphere of a coffee shop
- **Professional**: Clean, modern interface that builds trust
- **Intuitive**: Easy navigation and clear user flows
- **Accessible**: Inclusive design for all users
- **Mobile-First**: Optimized for mobile devices

### Brand Personality
- **Friendly**: Approachable and welcoming
- **Authentic**: Genuine coffee shop experience
- **Quality**: Premium feel for premium products
- **Efficient**: Fast and smooth user experience

## Design System

### Design Tokens

#### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

#### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

#### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

## Color Palette

### Primary Colors
```css
/* Coffee Brown Palette */
--coffee-50: #faf7f2;
--coffee-100: #f2ebe0;
--coffee-200: #e4d5c1;
--coffee-300: #d1b896;
--coffee-400: #b8956b;
--coffee-500: #9d7c4a;
--coffee-600: #8b6b3a;
--coffee-700: #735a2f;
--coffee-800: #5f4a26;
--coffee-900: #4f3e20;
--coffee-950: #2a1f11;
```

### Secondary Colors
```css
/* Cream & Warm Tones */
--cream-50: #fefdf9;
--cream-100: #fdf9f0;
--cream-200: #faf1d8;
--cream-300: #f5e6b8;
--cream-400: #efd68f;
--cream-500: #e6c466;
--cream-600: #d9b04a;
--cream-700: #b8923a;
--cream-800: #977431;
--cream-900: #7c5f2a;
--cream-950: #433115;
```

### Accent Colors
```css
/* Green for Success/Positive Actions */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

/* Red for Errors/Danger */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Blue for Information */
--info-50: #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
```

### Neutral Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
--gray-950: #030712;
```

## Typography

### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-display: 'Playfair Display', Georgia, serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--coffee-600);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--coffee-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--coffee-600);
  border: 2px solid var(--coffee-600);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
}
```

#### Button Sizes
```css
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.btn-md { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }
```

### Cards

#### Product Card
```css
.product-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.product-card-image {
  aspect-ratio: 4/3;
  object-fit: cover;
}

.product-card-content {
  padding: var(--space-4);
}

.product-card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.product-card-price {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--coffee-600);
}
```

### Forms

#### Input Fields
```css
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--coffee-500);
  box-shadow: 0 0 0 3px rgb(157 124 74 / 0.1);
}

.form-label {
  display: block;
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}
```

### Navigation

#### Header Navigation
```css
.header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-link {
  color: var(--gray-600);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--coffee-600);
  background: var(--coffee-50);
}
```

## Layout Principles

### Grid System
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2 { grid-template-columns: 1fr; }
  .grid-cols-3 { grid-template-columns: 1fr; }
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
}
```

### Spacing System
- Use consistent spacing scale throughout the application
- Maintain visual hierarchy with appropriate spacing
- Group related elements with closer spacing
- Separate different sections with larger spacing

### Visual Hierarchy
1. **Primary**: Main headings, important buttons
2. **Secondary**: Subheadings, secondary actions
3. **Tertiary**: Body text, labels, captions
4. **Quaternary**: Meta information, timestamps

## User Experience Guidelines

### Navigation Patterns

#### Primary Navigation
- Logo and brand name (left)
- Main navigation menu (center)
- User account and cart (right)

#### Secondary Navigation
- Breadcrumbs for deep pages
- Category filters for products
- Search functionality

#### Mobile Navigation
- Hamburger menu for mobile
- Bottom navigation for key actions
- Swipe gestures for product browsing

### User Flows

#### Product Discovery
1. **Landing Page** → Featured products and categories
2. **Category Browse** → Filter and sort options
3. **Product Detail** → Images, description, reviews
4. **Add to Cart** → Quantity selection and confirmation

#### Purchase Flow
1. **Cart Review** → Item summary and quantities
2. **Checkout** → Shipping and payment information
3. **Order Confirmation** → Receipt and tracking information
4. **Order Tracking** → Status updates and delivery info

#### User Account
1. **Registration/Login** → Account creation or authentication
2. **Profile Management** → Personal information updates
3. **Order History** → Past purchases and reorder options
4. **Preferences** → Notification and privacy settings

### Micro-interactions

#### Loading States
- Skeleton screens for content loading
- Progress indicators for multi-step processes
- Smooth transitions between states

#### Feedback
- Success messages for completed actions
- Error states with clear resolution steps
- Confirmation dialogs for destructive actions

#### Animations
- Subtle hover effects on interactive elements
- Smooth page transitions
- Loading animations that match brand personality

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Mobile Design Principles
- **Touch-Friendly**: Minimum 44px touch targets
- **Thumb Navigation**: Important actions within thumb reach
- **Simplified Interface**: Reduce cognitive load
- **Fast Loading**: Optimize for mobile networks

### Tablet Design
- **Two-Column Layout**: Utilize wider screen space
- **Enhanced Product Grid**: Show more products at once
- **Improved Forms**: Better input experience

### Desktop Design
- **Multi-Column Layout**: Full utilization of screen space
- **Hover States**: Enhanced interactivity
- **Keyboard Navigation**: Full accessibility support

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Color is not the only means of conveying information

#### Keyboard Navigation
- All interactive elements accessible via keyboard
- Visible focus indicators
- Logical tab order

#### Screen Reader Support
- Semantic HTML structure
- Alt text for images
- ARIA labels for complex components
- Form labels and error messages

#### Visual Accessibility
- Scalable text up to 200%
- No content loss at 400% zoom
- Sufficient spacing between interactive elements

### Implementation Guidelines

#### Semantic HTML
```html
<!-- Use proper heading hierarchy -->
<h1>Main Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

<!-- Use proper form labels -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" required>

<!-- Use proper button types -->
<button type="submit">Add to Cart</button>
<button type="button" aria-label="Close modal">×</button>
```

#### ARIA Attributes
```html
<!-- Navigation landmarks -->
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none"><a role="menuitem" href="/products">Products</a></li>
  </ul>
</nav>

<!-- Form validation -->
<input type="email" aria-invalid="true" aria-describedby="email-error">
<div id="email-error" role="alert">Please enter a valid email address</div>

<!-- Loading states -->
<button aria-busy="true" aria-label="Adding to cart...">Add to Cart</button>
```

## Performance Guidelines

### Image Optimization
- **WebP Format**: Modern format with better compression
- **Responsive Images**: Different sizes for different devices
- **Lazy Loading**: Load images as they enter viewport
- **Alt Text**: Descriptive alternative text

### Loading Performance
- **Critical CSS**: Inline critical styles
- **Code Splitting**: Load only necessary JavaScript
- **Bundle Optimization**: Minimize and compress assets
- **CDN Usage**: Serve static assets from CDN

### User Experience Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Coffee Shop Specific Design

### Product Showcase

#### Product Cards
- **High-Quality Images**: Professional product photography
- **Clear Pricing**: Prominent price display
- **Quick Actions**: Add to cart button
- **Product Variants**: Size, flavor options

#### Product Detail Pages
- **Image Gallery**: Multiple product angles
- **Detailed Descriptions**: Ingredients, brewing methods
- **Customer Reviews**: Social proof and ratings
- **Related Products**: Cross-selling opportunities

### Shopping Experience

#### Cart Design
- **Visual Cart**: Product images in cart
- **Quantity Controls**: Easy quantity adjustment
- **Price Breakdown**: Clear cost calculation
- **Save for Later**: Wishlist functionality

#### Checkout Process
- **Progress Indicator**: Step-by-step guidance
- **Guest Checkout**: Optional account creation
- **Multiple Payment**: Various payment methods
- **Order Summary**: Final review before purchase

### Brand Elements

#### Coffee Shop Atmosphere
- **Warm Colors**: Coffee browns and cream tones
- **Natural Textures**: Subtle background patterns
- **Typography**: Elegant serif for headings
- **Imagery**: Lifestyle and product photography

#### Seasonal Adaptations
- **Holiday Themes**: Special seasonal designs
- **Limited Editions**: Highlight seasonal products
- **Promotional Banners**: Eye-catching offers
- **Social Proof**: Customer testimonials and reviews

### Mobile-First Features

#### Touch Interactions
- **Swipe Gestures**: Product image swiping
- **Pull to Refresh**: Update product listings
- **Infinite Scroll**: Seamless product browsing
- **Quick Add**: One-tap add to cart

#### Location Services
- **Store Locator**: Find nearby locations
- **Delivery Options**: Local delivery areas
- **Pickup Scheduling**: Order ahead functionality
- **Real-time Updates**: Order status notifications

## Implementation Checklist

### Design System Setup
- [ ] Install and configure TailwindCSS
- [ ] Set up shadcn/ui components
- [ ] Create custom color palette
- [ ] Define typography scale
- [ ] Implement spacing system

### Component Development
- [ ] Build reusable button components
- [ ] Create product card templates
- [ ] Implement form components
- [ ] Design navigation components
- [ ] Build modal and dialog components

### Responsive Implementation
- [ ] Mobile-first CSS approach
- [ ] Tablet layout optimization
- [ ] Desktop enhancement
- [ ] Touch interaction support
- [ ] Cross-browser testing

### Accessibility Implementation
- [ ] Semantic HTML structure
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast validation

### Performance Optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle analysis
- [ ] Loading performance
- [ ] Core Web Vitals monitoring

### Testing and Validation
- [ ] User testing sessions
- [ ] Accessibility audits
- [ ] Performance testing
- [ ] Cross-device testing
- [ ] Browser compatibility

This comprehensive UI/UX design guide provides the foundation for creating a professional, accessible, and user-friendly coffee shop application that delivers an exceptional user experience across all devices and platforms.
