import { supabase } from './client'
import { supabaseAdmin } from './server'
import type {
  Assessment,
  AssessmentWithParts,
  PartWithBlocks,
  BlockWithQuestions,
  QuestionWithOptions,
  AssessmentAttempt,
  UserAnswer,
  AttemptWithAnswers
} from '@/types'

// Assessment Queries
export async function getAssessmentById(id: number): Promise<AssessmentWithParts | null> {
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      *,
      parts (
        *,
        blocks (
          *,
          questions (
            *,
            mcq_options (*)
          )
        )
      )
    `)
    .eq('id', id)
    .order('sequence_order', { foreignTable: 'parts' })
    .order('sequence_order', { foreignTable: 'parts.blocks' })
    .order('sequence_order', { foreignTable: 'parts.blocks.questions' })
    .order('sequence_order', { foreignTable: 'parts.blocks.questions.mcq_options' })
    .single()

  if (error) {
    console.error('Error fetching assessment:', error)
    return null
  }

  return assessment as AssessmentWithParts
}

export async function getAllAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assessments:', error)
    return []
  }

  return data || []
}

// Assessment Attempt Queries
export async function createAssessmentAttempt(
  assessmentId: number,
  userId: string
): Promise<AssessmentAttempt | null> {
  const { data, error } = await supabase
    .from('assessment_attempts')
    .insert({
      assessment_id: assessmentId,
      user_id: userId,
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating assessment attempt:', error)
    return null
  }

  return data
}

export async function getAssessmentAttempt(attemptId: number): Promise<AttemptWithAnswers | null> {
  const { data, error } = await supabase
    .from('assessment_attempts')
    .select(`
      *,
      user_answers (*)
    `)
    .eq('id', attemptId)
    .single()

  if (error) {
    console.error('Error fetching assessment attempt:', error)
    return null
  }

  return data as AttemptWithAnswers
}

export async function updateAssessmentAttemptProgress(
  attemptId: number,
  updates: {
    current_part_id?: number
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('assessment_attempts')
    .update(updates)
    .eq('id', attemptId)

  if (error) {
    console.error('Error updating assessment attempt progress:', error)
    return false
  }

  return true
}

export async function completeAssessmentAttempt(attemptId: number): Promise<boolean> {
  const { error } = await supabase
    .from('assessment_attempts')
    .update({
      completed_at: new Date().toISOString()
    })
    .eq('id', attemptId)

  if (error) {
    console.error('Error completing assessment attempt:', error)
    return false
  }

  return true
}

// User Answer Queries
export async function saveUserAnswer(
  attemptId: number,
  questionId: number,
  answer: {
    text_answer?: string
    mcq_option_id?: number
    scenario_id?: number
    scenario_option_id?: number
    likert_rating?: number
    video_response_path?: string
  }
): Promise<UserAnswer | null> {
  console.log('💾 Saving answer for question', questionId, 'attempt', attemptId, 'data:', answer)

  // First check if an answer already exists - remove .single() to avoid 406 error
  const { data: existing, error: checkError } = await supabase
    .from('user_answers')
    .select('id')
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
    .maybeSingle() // Use maybeSingle() instead of single() to avoid errors when no record exists

  if (checkError) {
    console.error('Error checking for existing answer:', checkError)
    // Continue anyway, we'll try to insert
  }

  // Prepare data with correct column names
  const answerData = {
    attempt_id: attemptId,
    question_id: questionId,
    text_answer: answer.text_answer,
    mcq_option_id: answer.mcq_option_id,
    scenario_id: answer.scenario_id,
    scenario_option_id: answer.scenario_option_id,
    likert_rating: answer.likert_rating,
    video_response_path: answer.video_response_path
  }

  console.log('🧪 Attempting save with correct schema:', answerData)

  let result
  try {
    if (existing) {
      // Update existing answer
      result = await supabase
        .from('user_answers')
        .update(answerData)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Create new answer
      result = await supabase
        .from('user_answers')
        .insert(answerData)
        .select()
        .single()
    }

    if (!result.error) {
      console.log('✅ Answer saved successfully:', result.data)
      return result.data
    } else {
      console.log('❌ Save failed:', result.error)
      return null
    }
  } catch (error) {
    console.error('❌ Save exception:', error)
    return null
  }
}

export async function getUserAnswer(
  attemptId: number,
  questionId: number
): Promise<UserAnswer | null> {
  const { data, error } = await supabase
    .from('user_answers')
    .select('*')
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching user answer:', error)
    return null
  }

  return data
}

// Video Upload (for video responses)
export async function uploadVideo(
  file: File,
  attemptId: number,
  questionId: number
): Promise<string | null> {
  const fileName = `${attemptId}-${questionId}-${Date.now()}.webm`
  const filePath = `video-responses/${fileName}`

  const { data, error } = await supabase.storage
    .from('assessment-videos')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading video:', error)
    return null
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('assessment-videos')
    .getPublicUrl(filePath)

  return publicUrl
}

// Test connection function
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('id, title')
      .limit(1)

    if (error) {
      console.error('Database connection test failed:', error)
      return false
    }

    console.log('Database connection successful. Sample data:', data)
    return true
  } catch (err) {
    console.error('Database connection test error:', err)
    return false
  }
}

// Test user_answers table structure
export async function testUserAnswersTable(): Promise<any> {
  try {
    console.log('🔍 Testing user_answers table structure...')
    
    // First, try to select any existing records to see the structure
    const { data: existingRecords, error: selectError } = await supabase
      .from('user_answers')
      .select('*')
      .limit(1)
    
    if (selectError) {
      console.log('❌ Select error:', selectError)
      return { success: false, error: selectError.message }
    }
    
    console.log('✅ Select successful. Existing records:', existingRecords)
    
    if (existingRecords && existingRecords.length > 0) {
      const columns = Object.keys(existingRecords[0])
      console.log('📋 Available columns:', columns)
      return { success: true, columns, sample: existingRecords[0] }
    }
    
    // If no records exist, try to insert a minimal test record
    console.log('📝 No existing records. Testing minimal insert...')
    
    const testRecord = {
      attempt_id: 1,
      question_id: 1,
      answer_text: 'test'
    }
    
    const { data: insertResult, error: insertError } = await supabase
      .from('user_answers')
      .insert(testRecord)
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Insert error:', insertError)
      return { success: false, error: insertError.message }
    }
    
    console.log('✅ Insert successful:', insertResult)
    const columns = Object.keys(insertResult)
    
    // Clean up the test record
    await supabase
      .from('user_answers')
      .delete()
      .eq('id', insertResult.id)
    
    return { success: true, columns, sample: insertResult }
    
  } catch (err) {
    console.error('❌ Exception testing user_answers table:', err)
    return { success: false, error: String(err) }
  }
} 