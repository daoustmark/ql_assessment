// Consolidated type definitions for the assessment platform
// This file replaces the conflicting types in assessment.ts and database.ts

export interface Assessment {
  id: number
  title: string
  description: string | null
  instruction_overall?: string | null
  instruction_detailed?: string | null
  image_before_assessment?: string | null
  time_limit_overall?: number | null
  total_points?: number | null
  passing_score?: number | null
  created_at: string
  updated_at?: string
}

export interface Part {
  id: number
  assessment_id: number
  title: string
  description: string | null
  sequence_order: number
  time_limit?: number | null
  created_at: string
  updated_at?: string
}

export interface Block {
  id: number
  part_id: number
  title: string | null
  description: string | null
  block_type: string
  sequence_order: number
  created_at: string
  updated_at?: string
}

export interface Question {
  id: number
  block_id: number
  question_text: string
  question_type: 'multiple_choice' | 'essay' | 'video' | 'email' | 'likert' | 'timed_video_response' | 'email_response' | 'video_response' | 'likert_scale' | 'ethical_choice'
  sequence_order: number
  is_required: boolean
  time_limit?: number | null
  instruction_before?: string | null
  instruction_after?: string | null
  correct_answer?: string | null
  points?: number
  created_at: string
  updated_at?: string
}

export interface McqOption {
  id: number
  question_id: number
  option_text: string
  sequence_order: number
  is_correct?: boolean
  created_at: string
  updated_at?: string
}

export interface Scenario {
  id: number
  block_id: number
  scenario_text: string
  sequence_order: number
  created_at: string
  scenario_options?: ScenarioOption[]
}

export interface ScenarioOption {
  id: number
  scenario_id: number
  option_text: string
  sequence_order: number
  is_correct?: boolean
  points?: number
  created_at: string
}

export interface AssessmentAttempt {
  id: number
  assessment_id: number
  user_id: string | null
  started_at: string
  completed_at: string | null
  current_part_id?: number | null
  auth_users_id?: string | null
  score?: number | null
  percentage?: number | null
  passed?: boolean | null
  invitation_id?: number | null
  invitee_email?: string | null
  invitee_name?: string | null
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
  points_awarded?: number
  is_correct?: boolean | null
  answered_at: string
}

// Invitation system types
export interface AssessmentInvitation {
  id: number
  assessment_id: number
  invited_email: string
  invited_by_user_id?: string | null
  invitation_token: string
  invited_at: string
  expires_at: string
  used_at?: string | null
  attempt_id?: number | null
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invitation_name?: string | null
  custom_message?: string | null
  created_at: string
}

export interface InvitationWithAssessment extends AssessmentInvitation {
  assessment: Pick<Assessment, 'id' | 'title' | 'description'>
}

export interface CreateInvitationData {
  assessment_id: number
  invited_email: string
  invitation_name?: string
  custom_message?: string
  expires_in_days?: number // defaults to 7 days
}

export interface InvitationStats {
  total_sent: number
  total_accepted: number
  total_expired: number
  total_pending: number
  acceptance_rate: number
}

// Extended types for joined queries
export interface QuestionWithOptions extends Question {
  mcq_options?: McqOption[]
}

export interface BlockWithQuestions extends Block {
  questions: QuestionWithOptions[]
}

export interface PartWithBlocks extends Part {
  blocks: BlockWithQuestions[]
}

export interface AssessmentWithParts extends Assessment {
  parts: PartWithBlocks[]
}

export interface AttemptWithAnswers extends AssessmentAttempt {
  user_answers: UserAnswer[]
}

// Assessment attempt with progress information (for admin views)
export interface AssessmentAttemptWithProgress extends AssessmentAttempt {
  progress?: AttemptProgress
  invitation?: Pick<AssessmentInvitation, 'invited_email' | 'invitation_name' | 'invited_at'>
}

// Progress tracking interface
export interface AttemptProgress {
  answered_questions: number
  total_questions: number
  percentage: number
}

// Answer data for saving responses
export interface AnswerData {
  mcq_option_id?: number
  scenario_option_id?: number
  text_answer?: string
  likert_rating?: number
  video_response_path?: string
  points_awarded?: number
  is_correct?: boolean
}

// Scoring interfaces
export interface QuestionScore {
  question_id: number
  question_text: string
  question_type: string
  sequence_order: number
  points_possible: number
  points_awarded: number
  is_correct: boolean
  answer_type: 'mcq' | 'text' | 'likert' | 'video' | 'scenario'
  
  // User's answer details
  user_answer?: {
    text_answer?: string | null
    mcq_option_text?: string | null
    mcq_option_selected?: number | null
    likert_rating?: number | null
    video_response_path?: string | null
  }
  
  // Correct answer details
  correct_answer?: {
    text?: string | null
    mcq_correct_option_text?: string | null
  }
}

export interface AttemptScore {
  attempt_id: number
  total_points_possible: number
  total_points_awarded: number
  percentage: number
  passed: boolean
  question_scores: QuestionScore[]
} 