import React from 'react';
import { animations } from '@/lib/designSystem';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'next';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animated?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animated = true,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  // Base styling from our design system
  const baseClasses = 'font-semibold rounded-lg transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 transform';
  
  // Updated size classes with our spacing system
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg tracking-wider',
    xl: 'px-10 py-5 text-xl',
  };
  
  // Updated variants with our color system
  const variantClasses = {
    primary: 'bg-gradient-primary text-white shadow-card hover:shadow-floating focus:ring-primary active:scale-98',
    secondary: 'bg-gradient-secondary text-white shadow-card hover:shadow-floating focus:ring-secondary active:scale-98',
    accent: 'bg-accent text-white shadow-card hover:shadow-floating focus:ring-accent active:scale-98',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-hover focus:ring-primary active:scale-98',
    ghost: 'bg-transparent text-text-body hover:bg-hover focus:ring-primary active:scale-98',
    next: 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white hover:from-primary-700 hover:to-secondary-600 active:scale-[0.97] disabled:opacity-40 focus-visible:ring-secondary-400 font-semibold tracking-wider',
  };
  
  // Hover effects based on our design system
  const hoverEffects = animated ? 'hover:-translate-y-0.5' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Loading spinner with updated styling
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${hoverEffects}
        ${widthClass}
        ${isLoading ? 'opacity-90 cursor-wait' : ''}
        ${className}
        flex items-center justify-center
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      
      {!isLoading && leftIcon && iconPosition === 'left' && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span className="tracking-button">{children}</span>
      
      {!isLoading && rightIcon && iconPosition === 'right' && (
        <span className="ml-2">{rightIcon}</span>
      )}
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
} 