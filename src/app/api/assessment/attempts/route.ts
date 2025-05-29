import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Find assessment attempts by invitee email
    const { data: attempts, error } = await supabase
      .from('assessment_attempts')
      .select(`
        id,
        started_at,
        completed_at,
        invitee_email,
        invitee_name,
        assessments (
          id,
          title,
          description
        )
      `)
      .eq('invitee_email', email)
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessment attempts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assessment attempts' },
        { status: 500 }
      )
    }

    // Format the response to include assessment title
    const formattedAttempts = attempts?.map(attempt => ({
      id: attempt.id,
      started_at: attempt.started_at,
      completed_at: attempt.completed_at,
      invitee_email: attempt.invitee_email,
      invitee_name: attempt.invitee_name,
      assessment_title: (attempt.assessments as any)?.title,
      assessment_description: (attempt.assessments as any)?.description
    })) || []

    return NextResponse.json({
      attempts: formattedAttempts,
      count: formattedAttempts.length
    })
  } catch (error) {
    console.error('Error in GET /api/assessment/attempts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 