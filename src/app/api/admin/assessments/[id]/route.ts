import { NextRequest, NextResponse } from 'next/server'
import { getAssessmentById } from '@/lib/supabase/queries'
import { updateAssessment } from '@/lib/supabase/admin-queries'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const assessmentId = parseInt(id)
    
    if (isNaN(assessmentId)) {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      )
    }

    const assessment = await getAssessmentById(assessmentId)
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Error fetching assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const assessmentId = parseInt(id)
    
    if (isNaN(assessmentId)) {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const { 
      title, 
      description,
      total_points,
      passing_score
    } = body

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Only update fields that actually exist in the database
    const updates = {
      title: title.trim(),
      description: description?.trim() || null,
      total_points: total_points ? parseInt(total_points) : null,
      passing_score: passing_score ? parseInt(passing_score) : null
    }
    
    const success = await updateAssessment(assessmentId, updates)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 