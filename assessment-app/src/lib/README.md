# Design System Documentation

This document provides an overview of the design system implemented for the assessment application based on the UX improvement plan.

## Files and Structure

- `src/lib/designSystem.ts`: Central source of design tokens as TypeScript variables
- `tailwind.config.ts`: Tailwind configuration extended with design tokens
- `src/app/globals.css`: Global CSS with CSS custom properties (variables)

## Using the Design System

### In TypeScript/JavaScript Components

```tsx
import { colors, typography, spacing } from '@/lib/designSystem';

// Example usage in a component
const MyComponent = () => (
  <div style={{ 
    color: colors.text.body,
    fontFamily: typography.fontFamily,
    padding: spacing[8]
  }}>
    Content
  </div>
);
```

### In Tailwind Classes

```tsx
// Example using Tailwind classes with our custom design tokens
const MyComponent = () => (
  <div className="
    bg-background 
    text-text-body 
    p-8 
    font-sans 
    text-question 
    font-medium 
    leading-question
    shadow-card
    rounded-lg
  ">
    Content
  </div>
);
```

### Using CSS Variables

```tsx
// Example using CSS variables defined in globals.css
const MyComponent = () => (
  <div style={{ 
    backgroundColor: 'var(--color-background-main)',
    color: 'var(--color-text-body)',
    boxShadow: 'var(--shadow-card)'
  }}>
    Content
  </div>
);
```

## Design Token Categories

### Colors

- Primary palette: teal-blue, mint green, coral accent
- Text colors: dark for headings, medium for body, light for secondary text
- Background colors: light blue-gray for main, white for cards
- Interactive states: unselected, selected, hover

### Typography

- Font family: Inter, SF Pro Display with system fallbacks
- Font sizes: heading (24px), question (18px), option (16px)
- Line heights: optimized for readability (1.3-1.5)
- Letter spacing: slightly negative for headings and body text

### Spacing

- Based on 8px grid system
- Special spacing values for card padding, question spacing, etc.

### Animations and Transitions

- Consistent timing functions and durations
- Reduced motion support for accessibility

### Shadows and Elevation

- Card shadows, floating element shadows, focus indicators

## Accessibility Considerations

- Color contrast meets WCAG standards
- Reduced motion preferences respected
- Focus styles clearly visible
- Text sizes optimized for readability 