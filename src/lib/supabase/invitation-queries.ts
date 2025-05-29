import { supabase } from './client'
import type { 
  AssessmentInvitation, 
  InvitationWithAssessment, 
  CreateInvitationData,
  InvitationStats,
  AssessmentAttempt
} from '@/types'

// Create a new assessment invitation
export async function createAssessmentInvitation(
  data: CreateInvitationData,
  invitedByUserId?: string
): Promise<AssessmentInvitation | null> {
  try {
    // Calculate expiration date (default 7 days)
    const expiresInDays = data.expires_in_days || 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Generate unique token using database function
    const { data: tokenResult, error: tokenError } = await supabase
      .rpc('generate_invitation_token')

    if (tokenError || !tokenResult) {
      console.error('Error generating invitation token:', tokenError)
      return null
    }

    // Create the invitation
    const { data: invitation, error } = await supabase
      .from('assessment_invitations')
      .insert({
        assessment_id: data.assessment_id,
        invited_email: data.invited_email.toLowerCase().trim(),
        invitation_name: data.invitation_name,
        custom_message: data.custom_message,
        invited_by_user_id: invitedByUserId,
        invitation_token: tokenResult,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invitation:', error)
      return null
    }

    return invitation
  } catch (error) {
    console.error('Error creating assessment invitation:', error)
    return null
  }
}

// Get invitation by token (for invitation links)
export async function getInvitationByToken(token: string): Promise<InvitationWithAssessment | null> {
  try {
    // Clean up expired invitations first
    await supabase.rpc('cleanup_expired_invitations')

    const { data: invitation, error } = await supabase
      .from('assessment_invitations')
      .select(`
        *,
        assessment:assessments (
          id,
          title,
          description
        )
      `)
      .eq('invitation_token', token)
      .single()

    if (error) {
      console.error('Error fetching invitation by token:', error)
      return null
    }

    return invitation as InvitationWithAssessment
  } catch (error) {
    console.error('Error getting invitation by token:', error)
    return null
  }
}

// Use an invitation to start an assessment
export async function useInvitation(
  token: string,
  userIdOverride?: string
): Promise<AssessmentAttempt | null> {
  try {
    // Get the invitation
    const invitation = await getInvitationByToken(token)
    
    if (!invitation) {
      console.error('Invitation not found')
      return null
    }

    // Check if invitation is valid
    if (invitation.status !== 'pending') {
      console.error('Invitation is not pending:', invitation.status)
      return null
    }

    if (new Date(invitation.expires_at) < new Date()) {
      console.error('Invitation has expired')
      return null
    }

    if (invitation.used_at) {
      console.error('Invitation has already been used')
      return null
    }

    // Create assessment attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('assessment_attempts')
      .insert({
        assessment_id: invitation.assessment_id,
        user_id: userIdOverride || `invited_${Date.now()}`,
        invitation_id: invitation.id,
        invitee_email: invitation.invited_email,
        invitee_name: invitation.invitation_name,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating assessment attempt:', attemptError)
      return null
    }

    // Mark invitation as used
    const { error: updateError } = await supabase
      .from('assessment_invitations')
      .update({
        status: 'accepted',
        used_at: new Date().toISOString(),
        attempt_id: attempt.id
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation status:', updateError)
      // Note: We don't return null here because the attempt was created successfully
    }

    return attempt
  } catch (error) {
    console.error('Error using invitation:', error)
    return null
  }
}

// Get all invitations for an assessment
export async function getInvitationsByAssessment(assessmentId: number): Promise<AssessmentInvitation[]> {
  try {
    const { data: invitations, error } = await supabase
      .from('assessment_invitations')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations by assessment:', error)
      return []
    }

    return invitations || []
  } catch (error) {
    console.error('Error getting invitations by assessment:', error)
    return []
  }
}

// Get all invitations (admin view)
export async function getAllInvitations(): Promise<InvitationWithAssessment[]> {
  try {
    const { data: invitations, error } = await supabase
      .from('assessment_invitations')
      .select(`
        *,
        assessment:assessments (
          id,
          title,
          description
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all invitations:', error)
      return []
    }

    return invitations as InvitationWithAssessment[] || []
  } catch (error) {
    console.error('Error getting all invitations:', error)
    return []
  }
}

// Get invitation statistics
export async function getInvitationStats(): Promise<InvitationStats> {
  try {
    const { data: stats, error } = await supabase
      .from('assessment_invitations')
      .select('status')

    if (error) {
      console.error('Error fetching invitation stats:', error)
      return {
        total_sent: 0,
        total_accepted: 0,
        total_expired: 0,
        total_pending: 0,
        acceptance_rate: 0
      }
    }

    const total_sent = stats?.length || 0
    const total_accepted = stats?.filter(s => s.status === 'accepted').length || 0
    const total_expired = stats?.filter(s => s.status === 'expired').length || 0
    const total_pending = stats?.filter(s => s.status === 'pending').length || 0
    const acceptance_rate = total_sent > 0 ? (total_accepted / total_sent) * 100 : 0

    return {
      total_sent,
      total_accepted,
      total_expired,
      total_pending,
      acceptance_rate: Math.round(acceptance_rate * 100) / 100
    }
  } catch (error) {
    console.error('Error getting invitation stats:', error)
    return {
      total_sent: 0,
      total_accepted: 0,
      total_expired: 0,
      total_pending: 0,
      acceptance_rate: 0
    }
  }
}

// Cancel an invitation
export async function cancelInvitation(invitationId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('assessment_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
      .eq('status', 'pending') // Only cancel pending invitations

    if (error) {
      console.error('Error cancelling invitation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return false
  }
}

// Resend invitation (create new token with extended expiry)
export async function resendInvitation(invitationId: number): Promise<AssessmentInvitation | null> {
  try {
    // Get the original invitation
    const { data: originalInvitation, error: fetchError } = await supabase
      .from('assessment_invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (fetchError || !originalInvitation) {
      console.error('Error fetching original invitation:', fetchError)
      return null
    }

    // Generate new token
    const { data: newToken, error: tokenError } = await supabase
      .rpc('generate_invitation_token')

    if (tokenError || !newToken) {
      console.error('Error generating new token:', tokenError)
      return null
    }

    // Update with new token and extended expiry
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7) // 7 days from now

    const { data: updatedInvitation, error: updateError } = await supabase
      .from('assessment_invitations')
      .update({
        invitation_token: newToken,
        expires_at: newExpiresAt.toISOString(),
        status: 'pending',
        used_at: null,
        attempt_id: null
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating invitation with new token:', updateError)
      return null
    }

    return updatedInvitation
  } catch (error) {
    console.error('Error resending invitation:', error)
    return null
  }
}

// Check if email already has pending invitation for assessment
export async function checkExistingInvitation(
  assessmentId: number, 
  email: string
): Promise<AssessmentInvitation | null> {
  try {
    const { data: invitation, error } = await supabase
      .from('assessment_invitations')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('invited_email', email.toLowerCase().trim())
      .eq('status', 'pending')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing invitation:', error)
      return null
    }

    return invitation
  } catch (error) {
    console.error('Error checking existing invitation:', error)
    return null
  }
} 