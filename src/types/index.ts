export interface Assessment {
  id: number
  title: string
  description?: string
  time_limit_overall?: number
  instructions?: string
  created_at?: string
  updated_at?: string
}

export interface Part {
  id: number
  assessment_id: number
  title: string
  description?: string
  sequence_order: number
  time_limit?: number
  created_at?: string
  updated_at?: string
}

export interface Block {
  id: number
  part_id: number
  title?: string
  description?: string
  sequence_order: number
  created_at?: string
  updated_at?: string
}

export interface Question {
  id: number
  block_id: number
  question_type: 'multiple_choice' | 'essay' | 'video' | 'email' | 'likert' | 'timed_video_response' | 'email_response' | 'video_response' | 'likert_scale' | 'ethical_choice'
  question_text: string
  sequence_order: number
  is_required?: boolean
  points?: number
  time_limit?: number
  created_at?: string
  updated_at?: string
}

export interface McqOption {
  id: number
  question_id: number
  option_text: string
  sequence_order: number
  is_correct?: boolean
  created_at?: string
  updated_at?: string
}

// Updated to match actual database schema - NO status column
export interface AssessmentAttempt {
  id: number
  assessment_id: number
  user_id: string
  started_at: string
  completed_at?: string | null
  current_part_id?: number | null
  auth_users_id?: string | null
}

export interface UserAnswer {
  id: number
  attempt_id: number
  question_id: number
  text_answer?: string | null
  mcq_option_id?: number | null
  scenario_id?: number | null
  scenario_option_id?: number | null
  likert_rating?: number | null
  video_response_path?: string | null
  answered_at?: string
}

// Extended types for joined queries
export interface AssessmentWithParts extends Assessment {
  parts: PartWithBlocks[]
}

export interface PartWithBlocks extends Part {
  blocks: BlockWithQuestions[]
}

export interface BlockWithQuestions extends Block {
  questions: QuestionWithOptions[]
}

export interface QuestionWithOptions extends Question {
  mcq_options?: McqOption[]
}

export interface AttemptWithAnswers extends AssessmentAttempt {
  user_answers: UserAnswer[]
} 