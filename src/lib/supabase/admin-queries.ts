import { supabase } from './client'
import type { Assessment, AssessmentAttempt, AssessmentWithParts } from '@/types/assessment'

export interface AdminDashboardData {
  totalAssessments: number
  activeAssessments: number
  totalAttempts: number
  completedAttempts: number
  activeSessions: number
  recentAssessments: AssessmentWithParts[]
  recentAttempts: AssessmentAttempt[]
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    // Get assessment counts
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id')
    
    // Get attempt counts
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('id, completed_at, started_at')
    
    // Get recent assessments with parts
    const { data: recentAssessments } = await supabase
      .from('assessments')
      .select(`
        *,
        parts (id)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    // Get recent attempts
    const { data: recentAttempts } = await supabase
      .from('assessment_attempts')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5)

    const totalAssessments = assessments?.length || 0
    const totalAttempts = attempts?.length || 0
    const completedAttempts = attempts?.filter(a => a.completed_at)?.length || 0
    
    // Active sessions (started but not completed)
    const activeSessions = attempts?.filter(a => !a.completed_at)?.length || 0

    return {
      totalAssessments,
      activeAssessments: totalAssessments, // For now, all assessments are active
      totalAttempts,
      completedAttempts,
      activeSessions,
      recentAssessments: recentAssessments || [],
      recentAttempts: recentAttempts || []
    }
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return {
      totalAssessments: 0,
      activeAssessments: 0,
      totalAttempts: 0,
      completedAttempts: 0,
      activeSessions: 0,
      recentAssessments: [],
      recentAttempts: []
    }
  }
}

// Assessment Management Functions
export async function getAllAssessmentsForAdmin(): Promise<AssessmentWithParts[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      parts (
        id,
        title,
        sequence_order,
        blocks (
          id,
          title,
          sequence_order,
          questions (id)
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assessments for admin:', error)
    return []
  }

  return data || []
}

export async function createAssessment(
  assessmentData: {
    title: string
    description?: string
    instructions?: string
    time_limit_overall?: number
  }
): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .insert(assessmentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating assessment:', error)
    return null
  }

  return data
}

export async function updateAssessment(
  id: number,
  updates: Partial<Assessment>
): Promise<boolean> {
  const { error } = await supabase
    .from('assessments')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating assessment:', error)
    return false
  }

  return true
}

export async function deleteAssessment(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting assessment:', error)
    return false
  }

  return true
}

// Assessment Attempts Management
export async function getAllAttempts(): Promise<AssessmentAttempt[]> {
  const { data, error } = await supabase
    .from('assessment_attempts')
    .select(`
      *,
      assessments (
        title,
        id
      )
    `)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Error fetching attempts:', error)
    return []
  }

  if (!data) return []

  // Enhance each attempt with progress information
  const attemptsWithProgress = await Promise.all(
    data.map(async (attempt) => {
      // Get total questions for this assessment
      const { data: totalQuestionsData } = await supabase
        .from('questions')
        .select('id, blocks!inner(part_id, parts!inner(assessment_id))')
        .eq('blocks.parts.assessment_id', attempt.assessment_id)

      const totalQuestions = totalQuestionsData?.length || 0

      // Get answered questions for this attempt
      const { data: answeredQuestionsData } = await supabase
        .from('user_answers')
        .select('question_id')
        .eq('attempt_id', attempt.id)

      const answeredQuestions = answeredQuestionsData?.length || 0

      // Calculate progress percentage
      const progressPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

      return {
        ...attempt,
        progress: {
          answered_questions: answeredQuestions,
          total_questions: totalQuestions,
          percentage: progressPercentage
        }
      }
    })
  )

  return attemptsWithProgress
}

export async function getAttemptWithDetails(attemptId: number) {
  const { data, error } = await supabase
    .from('assessment_attempts')
    .select(`
      *,
      assessments (
        title,
        description
      ),
      user_answers (
        *,
        questions (
          question_text,
          question_type
        ),
        mcq_options (
          option_text
        )
      )
    `)
    .eq('id', attemptId)
    .single()

  if (error) {
    console.error('Error fetching attempt details:', error)
    return null
  }

  return data
} 