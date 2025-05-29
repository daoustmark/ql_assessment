'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react'
import { getInvitationByToken, useInvitation } from '@/lib/supabase/invitation-queries'
import type { InvitationWithAssessment } from '@/types'

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationWithAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    async function loadInvitation() {
      if (!token) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }

      try {
        const invitationData = await getInvitationByToken(token)
        
        if (!invitationData) {
          setError('Invitation not found or has expired')
          setLoading(false)
          return
        }

        // Check if invitation is valid
        if (invitationData.status !== 'pending') {
          if (invitationData.status === 'expired') {
            setError('This invitation has expired')
          } else if (invitationData.status === 'accepted') {
            // If invitation was accepted, check if there's an existing attempt to resume
            if (invitationData.attempt_id) {
              // Show loading state while redirecting
              setRedirecting(true)
              setLoading(false)
              
              // Add a small delay so user can see the message
              setTimeout(() => {
                router.push(`/assessment/${invitationData.attempt_id}`)
              }, 2000)
              return
            } else {
              setError('This invitation has already been used but no assessment was found')
            }
          } else {
            setError('This invitation is no longer valid')
          }
          setLoading(false)
          return
        }

        // Check if invitation has expired
        if (new Date(invitationData.expires_at) < new Date()) {
          setError('This invitation has expired')
          setLoading(false)
          return
        }

        setInvitation(invitationData)
      } catch (err) {
        console.error('Error loading invitation:', err)
        setError('Failed to load invitation details')
      } finally {
        setLoading(false)
      }
    }

    loadInvitation()
  }, [token])

  const handleStartAssessment = async () => {
    if (!invitation) return

    setStarting(true)
    try {
      const attempt = await useInvitation(token)
      
      if (attempt) {
        // Redirect to assessment taking page
        router.push(`/assessment/${attempt.id}`)
      } else {
        setError('Failed to start assessment. Please try again.')
      }
    } catch (err) {
      console.error('Error starting assessment:', err)
      setError('Failed to start assessment. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Assessment Found!</h2>
            <p className="text-gray-600 text-center mb-4">
              You've already started this assessment. Redirecting you to continue where you left off...
            </p>
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription>
            You have been invited to take an assessment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Assessment Information */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {invitation.assessment.title}
            </h3>
            {invitation.assessment.description && (
              <p className="text-gray-600 mb-4">
                {invitation.assessment.description}
              </p>
            )}
            
            {/* Invitation Details */}
            <div className="space-y-3 pt-4 border-t">
              {invitation.invitation_name && (
                <div className="flex items-center space-x-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Invited for: <span className="font-medium">{invitation.invitation_name}</span>
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Sent to: <span className="font-medium">{invitation.invited_email}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Expires: <span className="font-medium">{formatDate(invitation.expires_at)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Custom Message */}
          {invitation.custom_message && (
            <Alert>
              <AlertDescription>
                <strong>Message from organizer:</strong><br />
                {invitation.custom_message}
              </AlertDescription>
            </Alert>
          )}

          {/* Start Assessment Button */}
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleStartAssessment}
              disabled={starting}
              size="lg"
              className="w-full"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Starting Assessment...
                </>
              ) : (
                'Start Assessment'
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              By starting this assessment, you acknowledge that you are {invitation.invited_email}{' '}
              and consent to taking this assessment.
            </p>
          </div>

          {/* Important Notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Once you start the assessment, you can return to this link 
              to continue where you left off if needed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
} 