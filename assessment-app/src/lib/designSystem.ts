/**
 * Design System Tokens
 * Centralized design tokens based on UX improvement suggestions
 */

// Colors
export const colors = {
  // Primary color palette from UX improvements
  primary: '#3B6E8F',    // soft teal-blue
  secondary: '#47B39D',  // mint green
  accent: '#EC6B56',     // coral accent
  
  // Background colors
  background: {
    main: '#F2F7F9',
    card: '#FFFFFF',
    subtle: '#E0E7EC',
  },
  
  // Interactive element states
  interactive: {
    unselected: '#D8E1E8',
    selected: '#47B39D',
    hover: '#EBF5F2',
  },
  
  // Text colors
  text: {
    heading: '#202A37',
    body: '#3E4D5C',
    light: '#6E7A89',
  },
  
  // Status colors (preserving from existing theme)
  status: {
    success: '#36a157',
    warning: '#ffab00',
    error: '#dc2626',
    info: '#8abded',
  },
};

// Typography
export const typography = {
  fontFamily: 'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  
  // Font sizes
  size: {
    heading: '24px',
    question: '18px',
    option: '16px',
    caption: '14px',
    small: '12px',
  },
  
  // Font weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    heading: '1.3',
    question: '1.5',
    option: '1.4',
  },
  
  // Letter spacing
  letterSpacing: {
    heading: '-0.2px',
    body: '-0.1px',
    button: '0.5px',
  },
};

// Spacing
export const spacing = {
  // Base 8px grid system
  '0': '0',
  '1': '4px',    // 0.5 × 8px
  '2': '8px',    // 1 × 8px
  '3': '12px',   // 1.5 × 8px
  '4': '16px',   // 2 × 8px
  '5': '20px',   // 2.5 × 8px
  '6': '24px',   // 3 × 8px
  '7': '28px',   // 3.5 × 8px
  '8': '32px',   // 4 × 8px
  '9': '36px',   // 4.5 × 8px
  '10': '40px',  // 5 × 8px
  '12': '48px',  // 6 × 8px
  '14': '56px',  // 7 × 8px
  '16': '64px',  // 8 × 8px
  '20': '80px',  // 10 × 8px
  '24': '96px',  // 12 × 8px
  
  // Card padding
  cardPadding: '28px',
  
  // Spacing between question and first option
  questionOptionGap: '32px',
  
  // Spacing between options
  optionGap: '20px',
  
  // Visual separation between question groups
  questionGroupGap: '48px',
};

// Shadows
export const shadows = {
  card: 'box-shadow: 0 2px 8px rgba(71, 179, 157, 0.08)',
  floating: 'box-shadow: 0 4px 12px rgba(59, 110, 143, 0.12)',
  focusRing: 'box-shadow: 0 0 0 2px rgba(236, 107, 86, 0.2)',
};

// Borders and Radiuses
export const borders = {
  radius: {
    sm: '3px',
    md: '4px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  width: {
    thin: '1px',
    regular: '2px',
    thick: '3px',
  },
};

// Animations and Transitions
export const animations = {
  transition: {
    fast: '100ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    emphasis: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  keyframes: {
    fadeIn: 'fadeIn 0.6s ease-out forwards',
    slideInUp: 'slideInUp 0.6s ease-out forwards',
    slideInRight: 'slideInRight 0.5s ease-out forwards',
    pulse: 'pulse 1.5s ease-in-out infinite',
  },
};

// Breakpoints
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1200px',
};

// Layout constraints
export const layout = {
  maxWidth: '720px',
  aspectRatio: {
    video: '16 / 9',
  },
};

// Z-index scale
export const zIndex = {
  behind: -1,
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 100,
  overlay: 1000,
  modal: 1100,
  popover: 1200,
  toast: 1300,
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borders,
  animations,
  breakpoints,
  layout,
  zIndex,
}; 