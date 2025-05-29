'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Send, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import { createAssessmentInvitation, checkExistingInvitation } from '@/lib/supabase/invitation-queries'
import type { Assessment, CreateInvitationData, AssessmentInvitation } from '@/types'

interface InviteFormProps {
  assessment: Assessment
  onInvitationSent?: () => void
}

export function InviteForm({ assessment, onInvitationSent }: InviteFormProps) {
  const [formData, setFormData] = useState<Partial<CreateInvitationData>>({
    assessment_id: assessment.id,
    invited_email: '',
    invitation_name: '',
    custom_message: '',
    expires_in_days: 7
  })
  
  const [sending, setSending] = useState(false)
  const [createdInvitation, setCreatedInvitation] = useState<AssessmentInvitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const generateInvitationUrl = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/assessment/invite/${token}`
  }

  const copyInvitationUrl = async (token: string) => {
    const url = generateInvitationUrl(token)
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.invited_email || !validateEmail(formData.invited_email)) {
      setError('Please enter a valid email address')
      return
    }

    setSending(true)
    setError(null)
    setCreatedInvitation(null)

    try {
      // Check if there's already a pending invitation for this email
      const existingInvitation = await checkExistingInvitation(
        assessment.id, 
        formData.invited_email
      )

      if (existingInvitation) {
        setError(`There is already a pending invitation for ${formData.invited_email}`)
        setSending(false)
        return
      }

      // Create the invitation
      const invitation = await createAssessmentInvitation(formData as CreateInvitationData)
      
      if (invitation) {
        setCreatedInvitation(invitation)
        
        // Reset form
        setFormData({
          assessment_id: assessment.id,
          invited_email: '',
          invitation_name: '',
          custom_message: '',
          expires_in_days: 7
        })

        // Notify parent component if callback provided
        onInvitationSent?.()
      } else {
        setError('Failed to send invitation. Please try again.')
      }
    } catch (err) {
      console.error('Error sending invitation:', err)
      setError('Failed to send invitation. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Create Assessment Invitation</span>
        </CardTitle>
        <CardDescription>
          Create a secure invitation link for "{assessment.title}"
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {createdInvitation ? (
          /* Success State with Copy Link */
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Invitation created successfully!</strong><br />
                Invitation sent to: <strong>{createdInvitation.invited_email}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-blue-900">Invitation Link</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInvitationUrl(createdInvitation.invitation_token)}
                  className="h-7"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-white border rounded text-xs font-mono break-all">
                <span className="flex-1">{generateInvitationUrl(createdInvitation.invitation_token)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(generateInvitationUrl(createdInvitation.invitation_token), '_blank')}
                  className="h-6 w-6 p-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-xs text-blue-700">
                <strong>Share this link</strong> with {createdInvitation.invited_email} to give them access to the assessment.
                The link expires on {new Date(createdInvitation.expires_at).toLocaleDateString()}.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No automatic email sent.</strong> You'll need to share this link manually via email, 
                messaging, or your preferred communication method.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => setCreatedInvitation(null)}
              variant="outline"
              className="w-full"
            >
              Create Another Invitation
            </Button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="invited_email">Email Address *</Label>
              <Input
                id="invited_email"
                type="email"
                placeholder="invitee@example.com"
                value={formData.invited_email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  invited_email: e.target.value 
                }))}
                required
              />
            </div>

            {/* Invitee Name (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="invitation_name">Invitee Name (Optional)</Label>
              <Input
                id="invitation_name"
                type="text"
                placeholder="John Doe"
                value={formData.invitation_name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  invitation_name: e.target.value 
                }))}
              />
              <p className="text-xs text-gray-500">
                This will be shown in the invitation for personalization
              </p>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expires_in_days">Expires In (Days)</Label>
              <Input
                id="expires_in_days"
                type="number"
                min="1"
                max="30"
                value={formData.expires_in_days}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expires_in_days: parseInt(e.target.value) || 7
                }))}
              />
              <p className="text-xs text-gray-500">
                The invitation will expire after this many days (1-30)
              </p>
            </div>

            {/* Custom Message (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="custom_message">Custom Message (Optional)</Label>
              <Textarea
                id="custom_message"
                placeholder="Please take your time with this assessment..."
                value={formData.custom_message}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  custom_message: e.target.value 
                }))}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                This message will be shown to the invitee along with the assessment
              </p>
            </div>

            {/* Error Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={sending || !formData.invited_email}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Invitation...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Invitation
                </>
              )}
            </Button>
          </form>
        )}

        {/* Information Box - only show in form state */}
        {!createdInvitation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Creates a unique, secure link for this specific person</li>
              <li>• You'll get the link to share manually (no automatic email)</li>
              <li>• They click the link to start the assessment immediately</li>
              <li>• No account creation required - they're identified by the invitation</li>
              <li>• Each invitation can only be used once</li>
              <li>• You'll be able to see their responses tied to their email address</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 