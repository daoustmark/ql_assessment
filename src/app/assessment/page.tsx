'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Play, Clock, CheckCircle, Mail } from 'lucide-react'

export default function AssessmentPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFindAssessments = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/assessment/attempts?email=${encodeURIComponent(email)}`)
      
      if (response.ok) {
        const data = await response.json()
        setAttempts(data.attempts || [])
        
        if (data.attempts?.length === 0) {
          setError('No assessments found for this email address')
        }
      } else {
        setError('Failed to find assessments. Please check your email and try again.')
      }
    } catch (err) {
      console.error('Error finding assessments:', err)
      setError('An error occurred while searching for assessments')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueAssessment = (attemptId: number) => {
    router.push(`/assessment/${attemptId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Continue Assessment</CardTitle>
          <CardDescription>
            Enter your email to find and continue your in-progress assessments
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter the email used for your assessment invitation"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFindAssessments()}
              />
            </div>
            
            <Button 
              onClick={handleFindAssessments}
              disabled={loading || !email.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Find My Assessments
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Assessment Results */}
          {attempts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Assessments</h3>
              
              {attempts.map((attempt) => (
                <Card key={attempt.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {attempt.assessment_title || 'Assessment'}
                        </h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Started {formatDate(attempt.started_at)}
                          </div>
                          {attempt.completed_at ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </div>
                          ) : (
                            <div className="flex items-center text-blue-600">
                              <Play className="h-3 w-3 mr-1" />
                              In Progress
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleContinueAssessment(attempt.id)}
                        variant={attempt.completed_at ? "outline" : "default"}
                        size="sm"
                      >
                        {attempt.completed_at ? 'Review' : 'Continue'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Can't find your assessment? Check your email for the invitation link, 
              or contact the person who sent you the assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 