'use client'

import React from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Save, Home, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AssessmentErrorBoundaryProps {
  children: React.ReactNode
  attemptId?: number
  onSaveProgress?: () => Promise<void>
}

function AssessmentErrorFallback({ 
  attemptId, 
  onSaveProgress 
}: { 
  attemptId?: number
  onSaveProgress?: () => Promise<void> 
}) {
  const router = useRouter()
  
  const handleSaveAndExit = async () => {
    try {
      if (onSaveProgress) {
        await onSaveProgress()
      }
      router.push('/')
    } catch (error) {
      console.error('Failed to save progress:', error)
      // Fallback to just going home
      router.push('/')
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-lg w-full">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Assessment Error</AlertTitle>
          <AlertDescription>
            An unexpected error occurred while taking your assessment. Don't worry - your progress has been automatically saved.
          </AlertDescription>
        </Alert>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">What you can do:</h3>
          
          <div className="space-y-3">
            {attemptId && onSaveProgress && (
              <Button 
                onClick={handleSaveAndExit}
                className="w-full"
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Progress & Exit
              </Button>
            )}
            
            <Button 
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Your Progress is Safe</h4>
            <p className="text-sm text-blue-800">
              All your answers are automatically saved as you complete them. You can continue your assessment later from where you left off.
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              If this problem continues, please contact support with assessment ID: 
              <span className="font-mono font-medium">{attemptId || 'N/A'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AssessmentErrorBoundary({ 
  children, 
  attemptId, 
  onSaveProgress 
}: AssessmentErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log assessment-specific error details
    console.error('Assessment Error:', {
      attemptId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // errorReporting.captureException(error, {
      //   tags: { module: 'assessment', attemptId },
      //   extra: errorInfo
      // })
    }
  }

  return (
    <ErrorBoundary
      fallback={
        <AssessmentErrorFallback 
          attemptId={attemptId} 
          onSaveProgress={onSaveProgress} 
        />
      }
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
} 