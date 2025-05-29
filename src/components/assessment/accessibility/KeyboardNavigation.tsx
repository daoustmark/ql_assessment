'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardNavigationProps {
  onNext?: () => void
  onPrevious?: () => void
  onSave?: () => void
  onSkip?: () => void
  disabled?: boolean
}

export function useKeyboardNavigation({
  onNext,
  onPrevious, 
  onSave,
  onSkip,
  disabled = false
}: KeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return

    // Don't interfere with typing in inputs
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }

    // Handle keyboard shortcuts
    switch (event.key) {
      case 'ArrowRight':
      case 'n':
      case 'N':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onNext?.()
        }
        break
      
      case 'ArrowLeft':
      case 'p':
      case 'P':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onPrevious?.()
        }
        break
      
      case 's':
      case 'S':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onSave?.()
        }
        break
      
      case 'Escape':
        event.preventDefault()
        onSkip?.()
        break
    }
  }, [onNext, onPrevious, onSave, onSkip, disabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return null
}

// Skip Link Component for screen readers
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium z-50"
    >
      {children}
    </a>
  )
}

// Focus trap for modal dialogs
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    
    // Focus first element when trap activates
    if (firstElement) {
      firstElement.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])
} 