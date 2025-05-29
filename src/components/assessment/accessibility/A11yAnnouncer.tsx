'use client'

import React, { useEffect, useRef } from 'react'

interface A11yAnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number
}

export function A11yAnnouncer({ 
  message, 
  priority = 'polite', 
  clearAfter = 3000 
}: A11yAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message && announcerRef.current) {
      // Update the aria-live region
      announcerRef.current.textContent = message

      // Clear the message after specified time
      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = ''
          }
        }, clearAfter)

        return () => clearTimeout(timer)
      }
    }
  }, [message, clearAfter])

  return (
    <div
      ref={announcerRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  )
}

// Hook for managing announcements
export function useA11yAnnouncements() {
  const [announcement, setAnnouncement] = React.useState('')
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite')

  const announce = React.useCallback((
    message: string, 
    announcementPriority: 'polite' | 'assertive' = 'polite'
  ) => {
    setPriority(announcementPriority)
    setAnnouncement(message)
  }, [])

  return {
    announcement,
    priority,
    announce,
    AnnouncerComponent: () => (
      <A11yAnnouncer message={announcement} priority={priority} />
    )
  }
} 