# Accessibility Guidelines - Tomoya Coffee Shop

## Table of Contents
1. [Accessibility Overview](#accessibility-overview)
2. [WCAG 2.1 Compliance](#wcag-21-compliance)
3. [Semantic HTML Structure](#semantic-html-structure)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Screen Reader Support](#screen-reader-support)
6. [Visual Accessibility](#visual-accessibility)
7. [Motor Accessibility](#motor-accessibility)
8. [Cognitive Accessibility](#cognitive-accessibility)
9. [Testing and Validation](#testing-and-validation)
10. [Implementation Checklist](#implementation-checklist)

## Accessibility Overview

### Why Accessibility Matters
- **Legal Compliance**: Meet ADA and international accessibility standards
- **Inclusive Design**: Serve all users regardless of abilities
- **Business Benefits**: Expand customer base and improve SEO
- **Ethical Responsibility**: Ensure equal access to digital services

### Accessibility Principles
1. **Perceivable**: Information must be presentable in ways users can perceive
2. **Operable**: Interface components must be operable by all users
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must be robust enough for various assistive technologies

## WCAG 2.1 Compliance

### Level AA Requirements

#### 1. Perceivable (P)
- **P1.1**: Text alternatives for non-text content
- **P1.2**: Captions for multimedia content
- **P1.3**: Adaptable content structure
- **P1.4**: Distinguishable content (contrast, resize text)

#### 2. Operable (O)
- **O2.1**: Keyboard accessible
- **O2.2**: No seizure-inducing content
- **O2.3**: Navigable content
- **O2.4**: Help users navigate and find content

#### 3. Understandable (U)
- **U3.1**: Readable text content
- **U3.2**: Predictable functionality
- **U3.3**: Input assistance

#### 4. Robust (R)
- **R4.1**: Compatible with assistive technologies

### Color Contrast Requirements
```css
/* Minimum contrast ratios */
:root {
  /* Normal text (18px+ or 14px+ bold) */
  --contrast-normal: 4.5:1;
  
  /* Large text (18px+ or 14px+ bold) */
  --contrast-large: 3:1;
  
  /* UI components and graphical objects */
  --contrast-ui: 3:1;
}

/* Example color combinations that meet WCAG AA */
.text-primary {
  color: #1f2937; /* Gray-800 */
  background: #ffffff; /* White */
  /* Contrast ratio: 12.63:1 */
}

.text-secondary {
  color: #6b7280; /* Gray-500 */
  background: #ffffff; /* White */
  /* Contrast ratio: 4.5:1 */
}

.text-on-coffee {
  color: #ffffff; /* White */
  background: #9d7c4a; /* Coffee-500 */
  /* Contrast ratio: 4.5:1 */
}
```

## Semantic HTML Structure

### Document Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tomoya Coffee Shop - Premium Coffee & Pastries</title>
  <meta name="description" content="Discover premium coffee blends and fresh pastries at Tomoya Coffee Shop. Order online for pickup or delivery.">
</head>
<body>
  <!-- Skip to main content link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Header with navigation -->
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <!-- Navigation content -->
    </nav>
  </header>
  
  <!-- Main content area -->
  <main id="main-content" role="main">
    <!-- Page content -->
  </main>
  
  <!-- Footer -->
  <footer role="contentinfo">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

### Heading Hierarchy
```html
<!-- Proper heading structure -->
<h1>Tomoya Coffee Shop</h1>
  <h2>Our Products</h2>
    <h3>Coffee</h3>
      <h4>Espresso</h4>
      <h4>Drip Coffee</h4>
    <h3>Pastries</h3>
      <h4>Croissants</h4>
      <h4>Muffins</h4>
  <h2>About Us</h2>
    <h3>Our Story</h3>
    <h3>Our Mission</h3>
```

### Landmark Roles
```html
<!-- Page landmarks for screen readers -->
<header role="banner">
  <!-- Site header content -->
</header>

<nav role="navigation" aria-label="Main navigation">
  <!-- Primary navigation -->
</nav>

<nav role="navigation" aria-label="Breadcrumb">
  <!-- Breadcrumb navigation -->
</nav>

<main role="main">
  <!-- Main content -->
</main>

<aside role="complementary" aria-label="Related products">
  <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
  <!-- Site footer -->
</footer>
```

## Keyboard Navigation

### Focus Management
```css
/* Visible focus indicators */
*:focus {
  outline: 2px solid #9d7c4a;
  outline-offset: 2px;
}

/* Custom focus styles for interactive elements */
button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #9d7c4a;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(157, 124, 74, 0.2);
}

/* Remove default focus for mouse users */
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}

/* Ensure focus is visible for keyboard users */
.focus-visible {
  outline: 2px solid #9d7c4a;
  outline-offset: 2px;
}
```

### Tab Order
```html
<!-- Logical tab order -->
<nav>
  <a href="/" tabindex="0">Home</a>
  <a href="/products" tabindex="0">Products</a>
  <a href="/about" tabindex="0">About</a>
  <a href="/contact" tabindex="0">Contact</a>
</nav>

<!-- Skip links for keyboard users -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#search" class="skip-link">Skip to search</a>
```

### Keyboard Shortcuts
```javascript
// Keyboard navigation implementation
document.addEventListener('keydown', (e) => {
  // Escape key to close modals
  if (e.key === 'Escape') {
    closeModal();
  }
  
  // Enter key to activate buttons
  if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
    e.target.click();
  }
  
  // Arrow keys for product navigation
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    navigateProducts(e.key === 'ArrowLeft' ? -1 : 1);
  }
});
```

## Screen Reader Support

### ARIA Labels and Descriptions
```html
<!-- Descriptive labels -->
<button aria-label="Add Premium Coffee to cart">
  <span aria-hidden="true">+</span>
  <span class="sr-only">Add to cart</span>
</button>

<!-- Form labels -->
<label for="email">Email Address</label>
<input 
  type="email" 
  id="email" 
  name="email" 
  aria-describedby="email-help"
  aria-required="true"
>
<div id="email-help">We'll never share your email</div>

<!-- Error messages -->
<input 
  type="email" 
  id="email" 
  aria-invalid="true"
  aria-describedby="email-error"
>
<div id="email-error" role="alert">Please enter a valid email address</div>
```

### Live Regions
```html
<!-- Announce dynamic content changes -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <span id="cart-count">0</span> items in cart
</div>

<!-- Announce urgent updates -->
<div aria-live="assertive" role="alert">
  Your order has been confirmed!
</div>

<!-- Screen reader only content -->
<span class="sr-only">Screen reader only text</span>
```

### ARIA States and Properties
```html
<!-- Interactive elements with proper states -->
<button 
  aria-expanded="false" 
  aria-controls="menu"
  aria-haspopup="true"
>
  Menu
</button>

<div id="menu" aria-hidden="true">
  <!-- Menu content -->
</div>

<!-- Form validation states -->
<input 
  type="email" 
  aria-invalid="false"
  aria-describedby="email-error"
>

<!-- Loading states -->
<button aria-busy="true" aria-label="Adding to cart...">
  <span aria-hidden="true">⏳</span>
  Adding...
</button>
```

## Visual Accessibility

### Color and Contrast
```css
/* High contrast color scheme */
.high-contrast {
  --text-primary: #000000;
  --text-secondary: #333333;
  --background: #ffffff;
  --border: #000000;
  --accent: #0066cc;
}

/* Color-blind friendly palette */
.colorblind-friendly {
  --success: #2e7d32; /* Green */
  --warning: #f57c00; /* Orange */
  --error: #d32f2f; /* Red */
  --info: #1976d2; /* Blue */
}

/* Focus indicators that don't rely on color */
.focus-indicator {
  position: relative;
}

.focus-indicator:focus::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #9d7c4a;
  border-radius: 4px;
}
```

### Text Scaling
```css
/* Responsive typography that scales with user preferences */
html {
  font-size: 16px; /* Base font size */
}

/* Respect user's font size preferences */
@media (prefers-reduced-motion: no-preference) {
  html {
    font-size: clamp(14px, 2.5vw, 18px);
  }
}

/* Large text for better readability */
.large-text {
  font-size: 1.25rem; /* 20px */
  line-height: 1.6;
}

/* Ensure text remains readable when zoomed */
.readable-text {
  min-height: 1.5em;
  line-height: 1.5;
}
```

### Visual Indicators
```html
<!-- Icons with text alternatives -->
<button>
  <span aria-hidden="true">🛒</span>
  <span class="sr-only">Shopping Cart</span>
</button>

<!-- Status indicators -->
<div role="status" aria-live="polite">
  <span aria-hidden="true">✓</span>
  <span>Item added to cart</span>
</div>

<!-- Progress indicators -->
<div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
  <span class="sr-only">50% complete</span>
</div>
```

## Motor Accessibility

### Touch Target Sizes
```css
/* Minimum touch target size of 44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Adequate spacing between interactive elements */
.interactive-spacing {
  margin: 8px;
}

/* Large touch targets for important actions */
.primary-action {
  min-width: 48px;
  min-height: 48px;
  padding: 16px 24px;
}
```

### Gesture Alternatives
```html
<!-- Provide alternatives to swipe gestures -->
<div class="swipe-container">
  <button aria-label="Previous product" class="nav-button">
    ← Previous
  </button>
  
  <div class="product-carousel" aria-live="polite">
    <!-- Product content -->
  </div>
  
  <button aria-label="Next product" class="nav-button">
    Next →
  </button>
</div>

<!-- Alternative to pinch-to-zoom -->
<button aria-label="Zoom in on product image">
  🔍 Zoom
</button>
```

### Time Limits
```javascript
// Provide options to extend time limits
const timeLimit = 300000; // 5 minutes
let timeRemaining = timeLimit;

const extendSession = () => {
  timeRemaining = timeLimit;
  showNotification('Session extended by 5 minutes');
};

// Auto-extend for users who need more time
if (userHasAccessibilityNeeds) {
  setInterval(extendSession, timeLimit);
}
```

## Cognitive Accessibility

### Clear Language
```html
<!-- Use simple, clear language -->
<h1>Order Your Coffee</h1>
<p>Choose from our selection of premium coffee blends and fresh pastries.</p>

<!-- Provide clear instructions -->
<fieldset>
  <legend>Payment Information</legend>
  <label for="card-number">Card Number</label>
  <input 
    type="text" 
    id="card-number" 
    placeholder="1234 5678 9012 3456"
    aria-describedby="card-help"
  >
  <div id="card-help">Enter your 16-digit card number</div>
</fieldset>
```

### Error Prevention
```html
<!-- Clear error messages -->
<div role="alert" aria-live="assertive">
  <h3>Please fix the following errors:</h3>
  <ul>
    <li>Email address is required</li>
    <li>Phone number must be 10 digits</li>
  </ul>
</div>

<!-- Confirmation for destructive actions -->
<button 
  onclick="deleteAccount()" 
  aria-describedby="delete-warning"
>
  Delete Account
</button>
<div id="delete-warning">
  This action cannot be undone. All your data will be permanently deleted.
</div>
```

### Consistent Navigation
```html
<!-- Consistent navigation structure -->
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/" aria-current="page">Home</a>
    </li>
    <li role="none">
      <a role="menuitem" href="/products">Products</a>
    </li>
    <li role="none">
      <a role="menuitem" href="/about">About</a>
    </li>
  </ul>
</nav>
```

## Testing and Validation

### Automated Testing Tools
```javascript
// Axe-core integration for automated testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<ProductPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing Checklist
```markdown
## Manual Accessibility Testing Checklist

### Keyboard Navigation
- [ ] All interactive elements are reachable via keyboard
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are visible
- [ ] No keyboard traps

### Screen Reader Testing
- [ ] All content is announced correctly
- [ ] Form labels are associated properly
- [ ] Headings provide proper structure
- [ ] Images have appropriate alt text

### Visual Testing
- [ ] Content is readable at 200% zoom
- [ ] Color contrast meets WCAG AA standards
- [ ] Information is not conveyed by color alone
- [ ] Text is readable without stylesheets

### Motor Accessibility
- [ ] Touch targets are at least 44px
- [ ] Adequate spacing between interactive elements
- [ ] No time limits that cannot be extended
- [ ] Alternatives to gesture-based interactions
```

### User Testing
```javascript
// Accessibility testing with real users
const accessibilityTesting = {
  screenReaderUsers: [
    'Test with NVDA on Windows',
    'Test with JAWS on Windows',
    'Test with VoiceOver on macOS',
    'Test with TalkBack on Android'
  ],
  
  keyboardOnlyUsers: [
    'Test complete user flows with keyboard only',
    'Verify all functionality is accessible',
    'Check for keyboard traps'
  ],
  
  motorImpairedUsers: [
    'Test with voice control software',
    'Test with switch navigation',
    'Test with eye tracking devices'
  ]
};
```

## Implementation Checklist

### HTML Structure
- [ ] Use semantic HTML elements
- [ ] Implement proper heading hierarchy
- [ ] Add landmark roles
- [ ] Include skip links
- [ ] Use proper form labels

### CSS and Styling
- [ ] Ensure sufficient color contrast
- [ ] Provide visible focus indicators
- [ ] Support text scaling up to 200%
- [ ] Use relative units for sizing
- [ ] Avoid relying on color alone

### JavaScript and Interactions
- [ ] Support keyboard navigation
- [ ] Provide ARIA labels and descriptions
- [ ] Implement live regions for dynamic content
- [ ] Handle focus management
- [ ] Provide alternatives to gestures

### Content and Media
- [ ] Write clear, simple language
- [ ] Provide alt text for images
- [ ] Include captions for videos
- [ ] Use descriptive link text
- [ ] Provide text alternatives for icons

### Testing and Validation
- [ ] Run automated accessibility tests
- [ ] Perform manual keyboard testing
- [ ] Test with screen readers
- [ ] Validate with real users
- [ ] Document accessibility features

### Maintenance
- [ ] Regular accessibility audits
- [ ] User feedback integration
- [ ] Training for development team
- [ ] Accessibility policy documentation
- [ ] Continuous improvement process

## Accessibility Resources

### Tools and Extensions
- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Automated accessibility auditing
- **Color Oracle**: Color blindness simulator
- **Screen Reader Testing**: NVDA, JAWS, VoiceOver

### Documentation and Guidelines
- **WCAG 2.1 Guidelines**: Official accessibility guidelines
- **ARIA Authoring Practices**: ARIA implementation guide
- **WebAIM**: Web accessibility resources
- **A11y Project**: Community-driven accessibility resources

### Testing Services
- **Accessibility Insights**: Microsoft's accessibility testing tool
- **Tenon.io**: Automated accessibility testing service
- **Siteimprove**: Comprehensive accessibility platform
- **UserWay**: Accessibility widget and testing tools

This comprehensive accessibility guide ensures that the Tomoya Coffee Shop application is inclusive and accessible to all users, meeting WCAG 2.1 AA standards and providing an excellent experience for users with disabilities.
