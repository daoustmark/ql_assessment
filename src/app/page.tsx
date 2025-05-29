'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Play, Clock, Calendar, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { getAllAssessments, testDatabaseConnection, createAssessmentAttempt } from '@/lib/supabase/queries'
import type { Assessment } from '@/types'

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-4 text-gray-800">Assessment Platform</h1>
              <p className="text-gray-600">
                {connectionStatus === 'testing' ? 'Connecting to platform...' : 'Loading assessments...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                  </div>
                  Connection Failed
                </CardTitle>
                <CardDescription>
                  Unable to connect to the platform. Please check your connection and try again.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Retry Connection
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Assessment Platform</h1>
                  <p className="text-sm text-gray-500">Powered by Quiet Light</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Platform Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4 mr-2" />
              Professional Assessment Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Take Your Assessment with
              <span className="text-blue-600 block">Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive assessment platform provides a seamless experience for evaluating your skills, 
              knowledge, and competencies in a professional environment.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Start New Assessment */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="text-xl text-gray-900">Start New Assessment</CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  Begin a fresh evaluation with our professional assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {assessments.length > 0 ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200" 
                    size="lg"
                    onClick={() => handleStartAssessment(assessments[0].id)}
                    disabled={startingAssessment === assessments[0].id}
                  >
                    {startingAssessment === assessments[0].id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Starting...
                      </div>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Assessment
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    No Assessments Available
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Continue Assessment */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="text-xl text-gray-900">Continue Assessment</CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  Resume your progress from where you left off
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/assessment')}
                  className="w-full border-green-200 hover:bg-green-50"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find My Assessments
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <div className="text-center">
            <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need Assistance?</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Continue Previous Work</h4>
                    <p className="text-gray-600 text-sm">
                      Already started an assessment? Use the "Find My Assessments" button above 
                      to continue where you left off.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Have an Invitation?</h4>
                    <p className="text-gray-600 text-sm">
                      Received an invitation link? Click on the link in your email to access 
                      your specific assessment directly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <span>Powered by</span>
            <div className="mx-2 h-4 w-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded"></div>
            <span className="font-medium">Quiet Light Assessment Platform</span>
          </div>
        </div>
      </div>
    </div>
  )
} 