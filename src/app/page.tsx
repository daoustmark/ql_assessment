'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllAssessments, testDatabaseConnection, createAssessmentAttempt } from '@/lib/supabase/queries'
import type { Assessment } from '@/types/database'

export default function HomePage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing')
  const [startingAssessment, setStartingAssessment] = useState<number | null>(null)

  useEffect(() => {
    async function initializeApp() {
      // Test database connection first
      const isConnected = await testDatabaseConnection()
      setConnectionStatus(isConnected ? 'connected' : 'failed')

      if (isConnected) {
        // Fetch available assessments
        const assessmentData = await getAllAssessments()
        setAssessments(assessmentData)
      }
      
      setLoading(false)
    }

    initializeApp()
  }, [])

  const handleStartAssessment = async (assessmentId: number) => {
    setStartingAssessment(assessmentId)
    
    try {
      // For now, we'll use a dummy user ID. In a real app, this would come from authentication
      const dummyUserId = `user_${Date.now()}`
      
      // Create an assessment attempt
      const attempt = await createAssessmentAttempt(assessmentId, dummyUserId)
      
      if (attempt) {
        // Redirect to the assessment taking page
        router.push(`/assessment/${attempt.id}`)
      } else {
        alert('Failed to start assessment. Please try again.')
      }
    } catch (error) {
      console.error('Error starting assessment:', error)
      alert('Failed to start assessment. Please try again.')
    } finally {
      setStartingAssessment(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Assessment Platform</h1>
            <p className="text-muted-foreground">
              {connectionStatus === 'testing' ? 'Connecting to database...' : 'Loading assessments...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Connection Failed</CardTitle>
              <CardDescription>
                Unable to connect to the database. Please check your configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Assessment Platform</h1>
          <p className="text-xl text-muted-foreground">
            Select an assessment to begin your evaluation
          </p>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ Database Connected Successfully</p>
          <p className="text-green-600 text-sm">
            Found {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} in the database
          </p>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No assessments available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  {assessment.description && (
                    <CardDescription>{assessment.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {assessment.time_limit_overall && (
                      <p>⏱️ Time Limit: {assessment.time_limit_overall} minutes</p>
                    )}
                    <p>📅 Created: {new Date(assessment.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => handleStartAssessment(assessment.id)}
                    disabled={startingAssessment === assessment.id}
                  >
                    {startingAssessment === assessment.id ? 'Starting...' : 'Start Assessment'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 