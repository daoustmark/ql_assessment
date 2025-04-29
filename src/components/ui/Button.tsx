import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'error';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  icon,
  ...props
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-bespoke-navy text-white hover:bg-bespoke-navy-75';
      case 'secondary':
        return 'bg-nomad-blue text-white hover:bg-nomad-blue-75';
      case 'accent':
        return 'bg-renew-mint text-bespoke-navy hover:bg-renew-mint-75';
      case 'error':
        return 'bg-error text-white hover:opacity-90';
      case 'outline':
        return 'bg-transparent border border-nomad-blue text-nomad-blue hover:bg-nomad-blue hover:text-white';
      default:
        return 'bg-bespoke-navy text-white hover:bg-bespoke-navy-75';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3 text-sm';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4';
    }
  };

  return (
    <button
      className={`
        rounded-md font-medium transition-colors focus:outline-none focus:ring-2 
        focus:ring-nomad-blue focus:ring-opacity-50 disabled:opacity-70 
        disabled:cursor-not-allowed flex items-center justify-center gap-2
        ${getVariantClasses()} ${getSizeClasses()} ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="loading loading-spinner loading-sm"></span>
      )}
      {icon && !isLoading && icon}
      {children}
    </button>
  );
} 