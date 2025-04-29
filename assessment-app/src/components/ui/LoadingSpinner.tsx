'use client';

import React from 'react';
import { usePrefersReducedMotion } from '@/lib/animationUtils';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  className?: string;
  centered?: boolean;
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  label,
  className = '',
  centered = false,
  fullPage = false,
}: LoadingSpinnerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Size classes
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  // Motion-aware animation class
  const animationClass = prefersReducedMotion 
    ? 'opacity-50' // Simple opacity for reduced motion
    : 'animate-spin';

  // Container classes for positioning
  const containerClasses = [
    fullPage ? 'fixed inset-0 bg-background/80 z-50 flex items-center justify-center' : '',
    centered && !fullPage ? 'flex flex-col items-center justify-center w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div 
          className={`
            ${sizeClasses[size]}
            ${animationClass}
            rounded-full 
            border-t-transparent 
            border-primary-600 
            border-solid
          `}
          role="status"
          aria-label={label || "Loading"}
        >
          <span className="sr-only">{label || "Loading"}</span>
        </div>
        
        {label && (
          <p className="text-neutral-700 font-medium text-sm mt-3">
            {label}
          </p>
        )}
      </div>
    </div>
  );
} 