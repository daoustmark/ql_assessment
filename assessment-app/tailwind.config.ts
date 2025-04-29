import type { Config } from 'tailwindcss';
import { 
  colors, 
  typography, 
  spacing, 
  borders, 
  animations 
} from './src/lib/designSystem';

const config = {
  content: [
    // Use src/ directory paths
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: { 
    extend: {
      colors: {
        // Primary UX improvements color palette
        'primary': colors.primary,
        'secondary': colors.secondary,
        'accent': colors.accent,
        
        // Background colors
        'background': colors.background.main,
        'card': colors.background.card,
        'subtle': colors.background.subtle,
        
        // Interactive states
        'unselected': colors.interactive.unselected,
        'selected': colors.interactive.selected,
        'hover': colors.interactive.hover,
        
        // Text colors
        'text': {
          'heading': colors.text.heading,
          'body': colors.text.body,
          'light': colors.text.light,
        },
        
        // Status colors
        'success': colors.status.success,
        'warning': colors.status.warning,
        'error': colors.status.error,
        'info': colors.status.info,
        
        // Keep existing colors for backwards compatibility
        'bespoke-navy': {
          DEFAULT: '#0a1a3d',
          75: '#364259',
          50: '#737d94',
          25: '#c2c9d9',
        },
        'renew-mint': {
          DEFAULT: '#b8f7b8',
          75: '#c7fac7',
          50: '#d9f7d9',
          25: '#edfaed',
        },
        'nomad-blue': {
          DEFAULT: '#297dde',
          75: '#61a1e3',
          50: '#8abded',
          25: '#c9e3fa',
        },
        'constant-green': {
          DEFAULT: '#36a157',
          75: '#6bc47a',
          50: '#99d4a3',
          25: '#ccedd4',
        },
      },
      fontFamily: {
        sans: [typography.fontFamily],
      },
      fontSize: {
        'heading': typography.size.heading,
        'question': typography.size.question,
        'option': typography.size.option,
        'caption': typography.size.caption,
        'small': typography.size.small,
      },
      fontWeight: {
        'regular': typography.weight.regular,
        'medium': typography.weight.medium,
        'semibold': typography.weight.semibold,
        'bold': typography.weight.bold,
      },
      lineHeight: {
        'heading': typography.lineHeight.heading,
        'question': typography.lineHeight.question,
        'option': typography.lineHeight.option,
      },
      letterSpacing: {
        'heading': typography.letterSpacing.heading,
        'body': typography.letterSpacing.body,
        'button': typography.letterSpacing.button,
      },
      spacing: spacing,
      borderRadius: borders.radius,
      borderWidth: borders.width,
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        'fast': '100ms',
        'base': '200ms',
        'slow': '300ms',
        'emphasis': '400ms',
      },
      transitionTimingFunction: {
        'emphasis': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': animations.keyframes.fadeIn,
        'slide-in-up': animations.keyframes.slideInUp,
        'slide-in-right': animations.keyframes.slideInRight,
        'pulse': animations.keyframes.pulse,
      },
      boxShadow: {
        'card': '0 2px 8px rgba(71, 179, 157, 0.08)',
        'floating': '0 4px 12px rgba(59, 110, 143, 0.12)',
        'focus': '0 0 0 2px rgba(236, 107, 86, 0.2)',
      },
      maxWidth: {
        'content': spacing['20'] + ' ' + spacing['24'],
      },
      textColor: {
        DEFAULT: colors.text.body, // Set as default text color
      }
    } 
  },
  // Add daisyUI plugin
  plugins: [require("daisyui")],
  // Custom daisyUI theme based on our UX improvements color palette
  daisyui: { 
    themes: [
      {
        assessment: {
          "primary": colors.primary,        // soft teal-blue
          "primary-content": "#ffffff",     // White text on primary
          "secondary": colors.secondary,    // mint green
          "secondary-content": "#ffffff",   // White text on secondary
          "accent": colors.accent,          // coral accent
          "accent-content": "#ffffff",      // White text on accent
          "neutral": colors.text.light,     // Light text color as neutral
          "neutral-content": "#ffffff",     // White text
          "base-100": colors.background.card, // White background
          "base-200": colors.background.main, // Light blue-gray background
          "base-300": colors.background.subtle, // Slightly darker gray
          "base-content": colors.text.body, // Dark text on light backgrounds
          "info": colors.status.info,       // Info blue
          "success": colors.status.success, // Success green
          "warning": colors.status.warning, // Warning amber
          "error": colors.status.error,     // Error red
        }
      },
      "light",
      "dark"
    ],
    darkTheme: "dark",
  },
} as Config;

export default config; 