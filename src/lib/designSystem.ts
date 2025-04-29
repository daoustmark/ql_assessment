/**
 * Design System Tokens
 * Central location for all design tokens used in the application
 */

// Design tokens for the assessment application
export const designTokens = {
  colors: {
    primary: {
      '50': '#eef2ff',
      '100': '#e0e7ff',
      '200': '#c7d2fe',
      '300': '#a5b4fc',
      '400': '#818cf8',
      '500': '#6366f1',
      '600': '#4f46e5',
      '700': '#4338ca',
      '800': '#3730a3',
      '900': '#312e81',
      '950': '#1e1b4b',
    },
    secondary: {
      '50': '#f0fdfa',
      '100': '#ccfbf1',
      '200': '#99f6e4',
      '300': '#5eead4',
      '400': '#2dd4bf',
      '500': '#14b8a6',
      '600': '#0d9488',
      '700': '#0f766e',
      '800': '#115e59',
      '900': '#134e4a',
      '950': '#042f2e',
    },
    accent: {
      '50': '#fffbeb',
      '100': '#fef3c7',
      '200': '#fde68a',
      '300': '#fcd34d',
      '400': '#fbbf24',
      '500': '#f59e0b',
      '600': '#d97706',
      '700': '#b45309',
      '800': '#92400e',
      '900': '#78350f',
      '950': '#451a03',
    },
    neutral: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a',
      '950': '#020617',
    },
    success: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
      '950': '#052e16',
    },
    error: {
      '50': '#fef2f2',
      '100': '#fee2e2',
      '200': '#fecaca',
      '300': '#fca5a5',
      '400': '#f87171',
      '500': '#ef4444',
      '600': '#dc2626',
      '700': '#b91c1c',
      '800': '#991b1b',
      '900': '#7f1d1d',
      '950': '#450a0a',
    },
    warning: {
      '50': '#fff7ed',
      '100': '#ffedd5',
      '200': '#fed7aa',
      '300': '#fdba74',
      '400': '#fb923c',
      '500': '#f97316',
      '600': '#ea580c',
      '700': '#c2410c',
      '800': '#9a3412',
      '900': '#7c2d12',
      '950': '#431407',
    },
    info: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#3b82f6',
      '600': '#2563eb',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
      '950': '#172554',
    }
  },
  
  typography: {
    fontFamily: {
      sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: '"Merriweather", Georgia, Cambria, "Times New Roman", serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      'xs': '0.75rem',    // 12px
      'sm': '0.875rem',   // 14px
      'base': '1rem',     // 16px
      'lg': '1.125rem',   // 18px
      'xl': '1.25rem',    // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },
    fontWeight: {
      'thin': '100',
      'extralight': '200',
      'light': '300',
      'regular': '400',
      'medium': '500',
      'semibold': '600',
      'bold': '700',
      'extrabold': '800',
      'black': '900',
    },
    lineHeight: {
      'none': '1',
      'tight': '1.25',
      'snug': '1.375',
      'normal': '1.5',
      'relaxed': '1.625',
      'loose': '2',
    },
    letterSpacing: {
      'tighter': '-0.05em',
      'tight': '-0.025em',
      'normal': '0em',
      'wide': '0.025em',
      'wider': '0.05em',
      'widest': '0.1em',
    },
  },
  
  spacing: {
    '0': '0px',
    'px': '1px',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '3.5': '0.875rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '11': '2.75rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
    '36': '9rem',
    '40': '10rem',
    '44': '11rem',
    '48': '12rem',
    '52': '13rem',
    '56': '14rem',
    '60': '15rem',
    '64': '16rem',
    '72': '18rem',
    '80': '20rem',
    '96': '24rem',
  },
  
  borderRadius: {
    'none': '0px',
    'sm': '0.125rem',
    'DEFAULT': '0.25rem',
    'md': '0.375rem',
    'lg': '0.5rem',
    'xl': '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    'full': '9999px',
  },
  
  shadows: {
    'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    'none': 'none',
  },
  
  zIndex: {
    '0': '0',
    '10': '10',
    '20': '20',
    '30': '30',
    '40': '40',
    '50': '50',
    'auto': 'auto',
  },
  
  opacity: {
    '0': '0',
    '5': '0.05',
    '10': '0.1',
    '20': '0.2',
    '25': '0.25',
    '30': '0.3',
    '40': '0.4',
    '50': '0.5',
    '60': '0.6',
    '70': '0.7',
    '75': '0.75',
    '80': '0.8',
    '90': '0.9',
    '95': '0.95',
    '100': '1',
  },
  
  animations: {
    keyframes: {
      spin: '{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
      ping: '{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0}}',
      pulse: '{0%,100%{opacity:1}50%{opacity:.5}}',
      bounce: '{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:none;animation-timing-function:cubic-bezier(0,0,0.2,1)}}',
    },
    durations: {
      '75': '75ms',
      '100': '100ms',
      '150': '150ms',
      '200': '200ms',
      '300': '300ms',
      '500': '500ms',
      '700': '700ms',
      '1000': '1000ms',
    },
    timingFunctions: {
      'linear': 'linear',
      'in': 'cubic-bezier(0.4, 0, 1, 1)',
      'out': 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  transitions: {
    property: {
      'none': 'none',
      'all': 'all',
      'DEFAULT': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      'colors': 'background-color, border-color, color, fill, stroke',
      'opacity': 'opacity',
      'shadow': 'box-shadow',
      'transform': 'transform',
    },
    timingFunction: {
      'linear': 'linear',
      'in': 'cubic-bezier(0.4, 0, 1, 1)',
      'out': 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      '75': '75ms',
      '100': '100ms',
      '150': '150ms',
      '200': '200ms',
      '300': '300ms',
      '500': '500ms',
      '700': '700ms',
      '1000': '1000ms',
    },
  },
  // Brand-specific tokens
  brand: {
    patterns: {
      dots: 'radial-gradient(var(--tw-gradient-from) 1px, transparent 1px)',
      grid: 'linear-gradient(to right, var(--tw-gradient-from) 1px, transparent 1px), linear-gradient(to bottom, var(--tw-gradient-from) 1px, transparent 1px)',
      diagonalLines: 'repeating-linear-gradient(45deg, var(--tw-gradient-from), var(--tw-gradient-from) 1px, transparent 1px, transparent 10px)',
    },
    gradients: {
      primary: 'linear-gradient(to right, rgb(99, 102, 241), rgb(168, 85, 247))',
      secondary: 'linear-gradient(to right, rgb(14, 165, 233), rgb(79, 70, 229))',
      accent: 'linear-gradient(to right, rgb(249, 115, 22), rgb(234, 179, 8))',
    }
  }
};

// Export component variations based on the design tokens
export const componentVariants = {
  button: {
    primary: {
      base: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      disabled: 'bg-primary-300 cursor-not-allowed',
      loading: 'bg-primary-600 opacity-70',
    },
    secondary: {
      base: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed',
      loading: 'bg-white opacity-70',
    },
    accent: {
      base: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400',
      disabled: 'bg-accent-300 cursor-not-allowed',
      loading: 'bg-accent-500 opacity-70',
    },
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-2.5 text-lg',
      xl: 'px-6 py-3 text-xl',
    }
  },
  card: {
    default: 'bg-white rounded-lg shadow-md',
    flat: 'bg-white rounded-lg border border-gray-200',
    raised: 'bg-white rounded-lg shadow-lg',
    interactive: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow',
  },
  input: {
    default: 'border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500',
    error: 'border border-error-500 rounded-md focus:ring-error-500 focus:border-error-500',
    success: 'border border-success-500 rounded-md focus:ring-success-500 focus:border-success-500',
  }
};

// Define the brand voice for consistent messaging
export const brandVoice = {
  tone: {
    default: 'Friendly and professional',
    success: 'Encouraging and celebratory',
    error: 'Supportive and solution-focused',
    info: 'Clear and informative',
    warning: 'Helpful and cautionary'
  },
  messages: {
    loading: 'Preparing your experience...',
    empty: 'Nothing to display yet',
    error: 'Something went wrong. Please try again.',
    success: 'Great job! Your changes were saved.',
    welcome: 'Welcome to the assessment platform',
    completed: 'Congratulations! You\'ve completed the assessment.',
  }
};

// Export everything in a named export for easier imports
export default {
  designTokens,
  componentVariants,
  brandVoice
};

// Type definitions for our design tokens
export type DesignTokens = typeof designTokens;

// Helper function to get a specific token value
export function getToken(path: string): any {
  return path.split('.').reduce((obj, key) => obj && obj[key], designTokens as any);
}

// Export specific token categories for convenience
export const colors = designTokens.colors;
export const typography = designTokens.typography;
export const spacing = designTokens.spacing;
export const borderRadius = designTokens.borderRadius;
export const shadows = designTokens.shadows; 