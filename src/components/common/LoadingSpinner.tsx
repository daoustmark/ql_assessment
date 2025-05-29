import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const variantClasses = {
  default: 'border-gray-300 border-t-gray-600',
  primary: 'border-blue-200 border-t-blue-600',
  secondary: 'border-gray-200 border-t-gray-500', 
  accent: 'border-purple-200 border-t-purple-600'
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className,
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-2',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
      {text && (
        <p className={cn(
          'mt-3 text-gray-600',
          size === 'sm' ? 'text-xs' : size === 'lg' || size === 'xl' ? 'text-base' : 'text-sm'
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

// Specialized loading components
export function AssessmentLoadingSpinner({ text = "Loading assessment..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
        <LoadingSpinner size="lg" variant="primary" text={text} />
        <div className="mt-4 text-xs text-gray-500">
          This may take a few moments while we prepare your assessment.
        </div>
      </div>
    </div>
  )
}

export function QuestionLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" variant="primary" text="Loading question..." />
    </div>
  )
}

export function SavingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-sm text-blue-600">
      <LoadingSpinner size="sm" variant="primary" />
      <span>Saving...</span>
    </div>
  )
} 