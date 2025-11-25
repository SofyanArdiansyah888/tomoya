# Responsive Design Guidelines - Tomoya Coffee Shop

## Table of Contents
1. [Mobile-First Design Philosophy](#mobile-first-design-philosophy)
2. [Breakpoint System](#breakpoint-system)
3. [Layout Patterns](#layout-patterns)
4. [Component Responsiveness](#component-responsiveness)
5. [Typography Scaling](#typography-scaling)
6. [Image Optimization](#image-optimization)
7. [Touch Interactions](#touch-interactions)
8. [Performance Considerations](#performance-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Examples](#implementation-examples)

## Mobile-First Design Philosophy

### Core Principles

#### 1. Progressive Enhancement
- **Start with Mobile**: Design for the smallest screen first
- **Add Complexity Gradually**: Enhance for larger screens
- **Content Priority**: Most important content first
- **Performance Focus**: Optimize for mobile constraints

#### 2. Content-First Approach
- **Essential Content**: Core functionality on mobile
- **Progressive Disclosure**: Show more on larger screens
- **Context Awareness**: Adapt to user's current situation
- **Task Completion**: Ensure key tasks work on all devices

#### 3. Touch-First Interaction
- **Touch Targets**: Minimum 44px touch areas
- **Gesture Support**: Swipe, pinch, and tap interactions
- **Thumb Navigation**: Important actions within thumb reach
- **Feedback**: Visual and haptic feedback for interactions

### Mobile Design Constraints

#### Screen Size Limitations
- **Viewport Width**: 320px minimum (iPhone SE)
- **Viewport Height**: 568px minimum
- **Safe Areas**: Account for notches and home indicators
- **Orientation**: Support both portrait and landscape

#### Performance Constraints
- **Network Speed**: 3G/4G connection considerations
- **Battery Life**: Optimize for mobile battery usage
- **Processing Power**: Efficient animations and interactions
- **Memory Usage**: Optimize for limited RAM

## Breakpoint System

### Standard Breakpoints
```css
/* Mobile First Approach */
/* Base styles for mobile (320px+) */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Small devices (640px and up) */
@media (min-width: 640px) {
  .container {
    padding: 1.5rem;
  }
}

/* Medium devices (768px and up) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Large devices (1024px and up) */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

/* Extra large devices (1280px and up) */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### Custom Breakpoints for Coffee Shop
```css
/* Coffee Shop Specific Breakpoints */
:root {
  --breakpoint-mobile: 320px;
  --breakpoint-mobile-lg: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-tablet-lg: 1024px;
  --breakpoint-desktop: 1280px;
  --breakpoint-desktop-lg: 1536px;
}

/* Mobile Landscape */
@media (min-width: 480px) and (max-width: 767px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet Portrait */
@media (min-width: 768px) and (max-width: 1023px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tablet Landscape */
@media (min-width: 1024px) and (max-width: 1279px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Layout Patterns

### Grid System

#### Mobile Grid (320px - 767px)
```css
.mobile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Product cards stack vertically */
.product-card {
  width: 100%;
  margin-bottom: 1rem;
}

/* Navigation becomes hamburger menu */
.nav-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.nav-mobile .menu-toggle {
  display: block;
}

.nav-mobile .nav-links {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

#### Tablet Grid (768px - 1023px)
```css
.tablet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Two-column layout for products */
.product-grid {
  grid-template-columns: repeat(2, 1fr);
}

/* Navigation becomes horizontal */
.nav-tablet {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-tablet .nav-links {
  display: flex;
  gap: 2rem;
}

.nav-tablet .menu-toggle {
  display: none;
}
```

#### Desktop Grid (1024px+)
```css
.desktop-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Four-column layout for products */
.product-grid {
  grid-template-columns: repeat(4, 1fr);
}

/* Full navigation with dropdowns */
.nav-desktop {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-desktop .nav-links {
  display: flex;
  gap: 2rem;
}

.nav-desktop .dropdown {
  position: relative;
}

.nav-desktop .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}
```

### Flexbox Patterns

#### Mobile Flexbox
```css
.mobile-flex {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Stack elements vertically */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Full-width buttons */
.btn-mobile {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}
```

#### Tablet Flexbox
```css
.tablet-flex {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
}

/* Side-by-side layout */
.product-info {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.product-image {
  flex: 0 0 200px;
}

.product-details {
  flex: 1;
}
```

#### Desktop Flexbox
```css
.desktop-flex {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

/* Complex layouts with multiple columns */
.main-content {
  display: flex;
  gap: 2rem;
}

.sidebar {
  flex: 0 0 300px;
}

.content-area {
  flex: 1;
}
```

## Component Responsiveness

### Navigation Components

#### Mobile Navigation
```css
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  z-index: 50;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  text-decoration: none;
  color: #6b7280;
  font-size: 0.75rem;
}

.mobile-nav-item.active {
  color: #9d7c4a;
}

.mobile-nav-icon {
  width: 24px;
  height: 24px;
}
```

#### Tablet Navigation
```css
.tablet-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.tablet-nav-links {
  display: flex;
  gap: 2rem;
}

.tablet-nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.tablet-nav-link:hover {
  background-color: #f3f4f6;
}
```

#### Desktop Navigation
```css
.desktop-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.desktop-nav-links {
  display: flex;
  gap: 2rem;
}

.desktop-nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
  position: relative;
}

.desktop-nav-link:hover {
  background-color: #f3f4f6;
  color: #9d7c4a;
}

.desktop-nav-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 0;
  height: 2px;
  background: #9d7c4a;
  transition: all 0.2s;
  transform: translateX(-50%);
}

.desktop-nav-link:hover::after {
  width: 100%;
}
```

### Product Cards

#### Mobile Product Card
```css
.mobile-product-card {
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1rem;
}

.mobile-product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.mobile-product-content {
  padding: 1rem;
}

.mobile-product-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.mobile-product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #9d7c4a;
  margin-bottom: 1rem;
}

.mobile-product-actions {
  display: flex;
  gap: 0.5rem;
}

.mobile-add-to-cart {
  flex: 1;
  padding: 0.75rem;
  background: #9d7c4a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
}
```

#### Tablet Product Card
```css
.tablet-product-card {
  display: flex;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.tablet-product-image {
  flex: 0 0 200px;
  height: 200px;
  object-fit: cover;
}

.tablet-product-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tablet-product-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.tablet-product-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tablet-product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #9d7c4a;
  margin-bottom: 1rem;
}

.tablet-product-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.tablet-add-to-cart {
  padding: 0.75rem 1.5rem;
  background: #9d7c4a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1rem;
}
```

#### Desktop Product Card
```css
.desktop-product-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.desktop-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.desktop-product-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.desktop-product-card:hover .desktop-product-image {
  transform: scale(1.05);
}

.desktop-product-content {
  padding: 1.5rem;
}

.desktop-product-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.desktop-product-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desktop-product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #9d7c4a;
  margin-bottom: 1rem;
}

.desktop-product-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.desktop-add-to-cart {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #9d7c4a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.desktop-add-to-cart:hover {
  background: #8b6b3a;
}

.desktop-favorite-btn {
  padding: 0.75rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s;
}

.desktop-favorite-btn:hover {
  border-color: #9d7c4a;
  color: #9d7c4a;
}
```

## Typography Scaling

### Responsive Typography System
```css
/* Mobile Typography */
.mobile-heading-1 {
  font-size: 1.875rem; /* 30px */
  line-height: 1.2;
  font-weight: 700;
}

.mobile-heading-2 {
  font-size: 1.5rem; /* 24px */
  line-height: 1.3;
  font-weight: 600;
}

.mobile-heading-3 {
  font-size: 1.25rem; /* 20px */
  line-height: 1.4;
  font-weight: 600;
}

.mobile-body {
  font-size: 1rem; /* 16px */
  line-height: 1.5;
  font-weight: 400;
}

.mobile-caption {
  font-size: 0.875rem; /* 14px */
  line-height: 1.4;
  font-weight: 400;
}

/* Tablet Typography */
@media (min-width: 768px) {
  .tablet-heading-1 {
    font-size: 2.25rem; /* 36px */
    line-height: 1.1;
  }
  
  .tablet-heading-2 {
    font-size: 1.875rem; /* 30px */
    line-height: 1.2;
  }
  
  .tablet-heading-3 {
    font-size: 1.5rem; /* 24px */
    line-height: 1.3;
  }
  
  .tablet-body {
    font-size: 1.125rem; /* 18px */
    line-height: 1.5;
  }
}

/* Desktop Typography */
@media (min-width: 1024px) {
  .desktop-heading-1 {
    font-size: 3rem; /* 48px */
    line-height: 1.1;
  }
  
  .desktop-heading-2 {
    font-size: 2.25rem; /* 36px */
    line-height: 1.2;
  }
  
  .desktop-heading-3 {
    font-size: 1.875rem; /* 30px */
    line-height: 1.3;
  }
  
  .desktop-body {
    font-size: 1.125rem; /* 18px */
    line-height: 1.6;
  }
}
```

### Fluid Typography
```css
/* Fluid Typography using clamp() */
.fluid-heading {
  font-size: clamp(1.5rem, 4vw, 3rem);
  line-height: 1.2;
  font-weight: 700;
}

.fluid-body {
  font-size: clamp(1rem, 2.5vw, 1.125rem);
  line-height: 1.5;
}

.fluid-caption {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.4;
}
```

## Image Optimization

### Responsive Images
```css
/* Responsive Image Container */
.image-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
  border-radius: 0.5rem;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-container:hover img {
  transform: scale(1.05);
}

/* Different aspect ratios for different breakpoints */
@media (min-width: 768px) {
  .image-container {
    padding-bottom: 66.67%; /* 3:2 aspect ratio */
  }
}

@media (min-width: 1024px) {
  .image-container {
    padding-bottom: 60%; /* 5:3 aspect ratio */
  }
}
```

### Picture Element Implementation
```html
<picture>
  <source 
    media="(min-width: 1024px)" 
    srcset="
      /images/coffee-desktop-1x.jpg 1x,
      /images/coffee-desktop-2x.jpg 2x
    "
  >
  <source 
    media="(min-width: 768px)" 
    srcset="
      /images/coffee-tablet-1x.jpg 1x,
      /images/coffee-tablet-2x.jpg 2x
    "
  >
  <img 
    src="/images/coffee-mobile-1x.jpg"
    srcset="
      /images/coffee-mobile-1x.jpg 1x,
      /images/coffee-mobile-2x.jpg 2x
    "
    alt="Premium Coffee"
    loading="lazy"
  >
</picture>
```

### Lazy Loading Implementation
```css
/* Lazy loading placeholder */
.lazy-image {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Fade in animation when loaded */
.image-loaded {
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
```

## Touch Interactions

### Touch-Friendly Design
```css
/* Minimum touch target size */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

/* Touch feedback */
.touch-feedback {
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.touch-feedback:active {
  transform: scale(0.95);
  background-color: rgba(0, 0, 0, 0.1);
}

/* Swipe gestures */
.swipe-container {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.swipe-item {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

### Gesture Support
```css
/* Swipe indicators */
.swipe-indicator {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.swipe-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: background-color 0.3s ease;
}

.swipe-dot.active {
  background: white;
}

/* Pull to refresh */
.pull-to-refresh {
  position: relative;
  overflow: hidden;
}

.pull-indicator {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  transition: top 0.3s ease;
}

.pull-indicator.pulling {
  top: 1rem;
}
```

## Performance Considerations

### Critical CSS
```css
/* Above-the-fold styles */
.critical-css {
  /* Hero section styles */
  .hero {
    background: linear-gradient(135deg, #9d7c4a 0%, #8b6b3a 100%);
    color: white;
    padding: 2rem 1rem;
    text-align: center;
  }
  
  /* Navigation styles */
  .nav {
    background: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Product grid styles */
  .product-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}
```

### Resource Optimization
```css
/* Preload critical resources */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Optimize animations for performance */
.optimized-animation {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Reduce repaints */
.stable-layout {
  contain: layout style paint;
}

/* GPU acceleration for smooth scrolling */
.smooth-scroll {
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}
```

## Testing Strategy

### Device Testing Matrix
```css
/* Test on these devices */
/*
Mobile:
- iPhone SE (375x667)
- iPhone 12 (390x844)
- Samsung Galaxy S21 (360x800)
- Pixel 5 (393x851)

Tablet:
- iPad (768x1024)
- iPad Pro (834x1194)
- Surface Pro (912x1368)

Desktop:
- MacBook Air (1440x900)
- MacBook Pro (1680x1050)
- iMac (1920x1080)
- 4K Monitor (3840x2160)
*/
```

### Browser Testing
```css
/* Test on these browsers */
/*
Mobile Browsers:
- Safari iOS
- Chrome Mobile
- Firefox Mobile
- Samsung Internet

Desktop Browsers:
- Chrome
- Firefox
- Safari
- Edge
- Opera
*/
```

### Performance Testing
```css
/* Performance metrics to monitor */
/*
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms
- Time to Interactive (TTI) < 3.5s
*/
```

## Implementation Examples

### Responsive Product Grid
```html
<div class="product-grid">
  <div class="product-card">
    <div class="product-image">
      <img src="/coffee-1.jpg" alt="Premium Coffee" loading="lazy">
    </div>
    <div class="product-content">
      <h3 class="product-title">Premium Coffee</h3>
      <p class="product-description">Rich, aromatic coffee blend</p>
      <div class="product-price">$12.99</div>
      <button class="add-to-cart">Add to Cart</button>
    </div>
  </div>
  <!-- More products -->
</div>
```

```css
/* Mobile First Grid */
.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet Grid */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

/* Desktop Grid */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }
}

/* Large Desktop Grid */
@media (min-width: 1280px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Responsive Navigation
```html
<nav class="responsive-nav">
  <div class="nav-brand">
    <img src="/logo.svg" alt="Tomoya Coffee">
  </div>
  
  <div class="nav-links">
    <a href="/products">Products</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </div>
  
  <div class="nav-actions">
    <button class="cart-btn">Cart (0)</button>
    <button class="account-btn">Account</button>
  </div>
  
  <button class="mobile-menu-toggle">
    <span></span>
    <span></span>
    <span></span>
  </button>
</nav>
```

```css
/* Mobile Navigation */
.responsive-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.nav-links {
  display: none;
}

.mobile-menu-toggle {
  display: block;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-toggle span {
  display: block;
  width: 25px;
  height: 3px;
  background: #374151;
  margin: 5px 0;
  transition: 0.3s;
}

/* Tablet Navigation */
@media (min-width: 768px) {
  .nav-links {
    display: flex;
    gap: 2rem;
  }
  
  .mobile-menu-toggle {
    display: none;
  }
}

/* Desktop Navigation */
@media (min-width: 1024px) {
  .responsive-nav {
    padding: 1rem 2rem;
  }
  
  .nav-links a {
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #374151;
    font-weight: 500;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  
  .nav-links a:hover {
    background-color: #f3f4f6;
  }
}
```

This comprehensive responsive design guide ensures that the Tomoya Coffee Shop application provides an optimal user experience across all devices and screen sizes, with particular attention to mobile-first design principles and performance optimization.
