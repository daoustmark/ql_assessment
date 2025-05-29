'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Assessment, AssessmentInvitation } from '@/types'

interface InvitationsSectionProps {
  invitations: AssessmentInvitation[]
  assessment: Assessment
}

export function InvitationsSection({ invitations, assessment }: InvitationsSectionProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  const copyInvitationLink = async (token: string) => {
    const url = `${window.location.origin}/assessment/invite/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(token)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invitations</CardTitle>
        <CardDescription>Latest invitations for this assessment</CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length > 0 ? (
          <div className="space-y-3">
            {invitations.slice(0, 5).map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{invitation.invited_email}</p>
                  {invitation.invitation_name && (
                    <p className="text-xs text-gray-500">{invitation.invitation_name}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Sent {new Date(invitation.invited_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={
                      invitation.status === 'pending' ? 'text-yellow-600 border-yellow-600' :
                      invitation.status === 'accepted' ? 'text-green-600 border-green-600' :
                      invitation.status === 'expired' ? 'text-gray-600 border-gray-600' :
                      'text-red-600 border-red-600'
                    }
                  >
                    {invitation.status}
                  </Badge>
                  {invitation.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInvitationLink(invitation.invitation_token)}
                      className={copySuccess === invitation.invitation_token ? "bg-green-50 border-green-200" : ""}
                      title="Copy invitation link"
                    >
                      {copySuccess === invitation.invitation_token ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {invitations.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/admin/invitations">
                  <Button variant="outline" size="sm">
                    View All Invitations
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations yet</h3>
            <p className="text-gray-600 mb-4">
              Send your first invitation to get people taking this assessment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 