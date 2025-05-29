// =============================================================================
// COMPLETE ASSESSMENT PLATFORM DATABASE TYPES
// Updated: December 2024
// Matches: database-schema-complete.sql
// =============================================================================

// -----------------------------------------------------------------------------
// CORE ASSESSMENT STRUCTURE
// -----------------------------------------------------------------------------

export interface Assessment {
  id: number
  title: string
  description: string | null
  instruction_overall: string | null
  instruction_detailed: string | null
  image_before_assessment: string | null
  time_limit_overall: number | null // in minutes
  total_points: number | null
  passing_score: number | null
  created_at: string
  updated_at: string | null
}

export interface Part {
  id: number
  assessment_id: number
  title: string
  description: string | null
  sequence_order: number
  time_limit: number | null // in minutes
  created_at: string
  updated_at: string | null
}

export interface Block {
  id: number
  part_id: number
  title: string | null
  description: string | null
  block_type: BlockType
  sequence_order: number
  created_at: string
  updated_at: string | null
}

export interface Question {
  id: number
  block_id: number
  question_text: string
  question_type: QuestionType
  sequence_order: number
  is_required: boolean
  time_limit: number | null // in minutes
  instruction_before: string | null
  instruction_after: string | null
  correct_answer: string | null // For non-MCQ questions
  points: number
  created_at: string
  updated_at: string | null
}

export interface McqOption {
  id: number
  question_id: number
  option_text: string
  sequence_order: number
  is_correct: boolean // ✅ CORRECT ANSWER TRACKING
  created_at: string
  updated_at: string | null
}

export interface Scenario {
  id: number
  block_id: number
  scenario_text: string
  sequence_order: number
  created_at: string
}

export interface ScenarioOption {
  id: number
  scenario_id: number
  option_text: string
  sequence_order: number
  is_correct: boolean // ✅ CORRECT ANSWER TRACKING
  points: number
  created_at: string
}

// -----------------------------------------------------------------------------
// USER ATTEMPTS & RESPONSES
// -----------------------------------------------------------------------------

export interface AssessmentAttempt {
  id: number
  assessment_id: number
  user_id: string | null
  started_at: string
  completed_at: string | null
  current_part_id: number | null
  auth_users_id: string | null
  score: number | null // ✅ SCORING SYSTEM
  percentage: number | null // ✅ SCORING SYSTEM
  passed: boolean | null // ✅ SCORING SYSTEM
  invitation_id: number | null // ✅ INVITATION SYSTEM
  invitee_email: string | null // ✅ INVITATION SYSTEM
  invitee_name: string | null // ✅ INVITATION SYSTEM
}

export interface UserAnswer {
  id: number
  attempt_id: number
  question_id: number
  mcq_option_id: number | null
  scenario_id: number | null
  scenario_option_id: number | null
  text_answer: string | null
  likert_rating: number | null // 1-5 scale
  video_response_path: string | null
  points_awarded: number // ✅ SCORING SYSTEM
  is_correct: boolean | null // ✅ SCORING SYSTEM
  answered_at: string
}

// -----------------------------------------------------------------------------
// INVITATION SYSTEM
// -----------------------------------------------------------------------------

export interface AssessmentInvitation {
  id: number
  assessment_id: number
  invited_email: string
  invited_by_user_id: string | null
  invitation_token: string
  invited_at: string
  expires_at: string
  used_at: string | null
  attempt_id: number | null
  status: InvitationStatus
  invitation_name: string | null
  custom_message: string | null
  created_at: string
}

// -----------------------------------------------------------------------------
// ENUMS & TYPES
// -----------------------------------------------------------------------------

export type QuestionType = 
  | 'multiple_choice'
  | 'email_response'
  | 'video_response'
  | 'timed_video_response'
  | 'likert_scale'
  | 'essay'
  | 'ethical_choice'
  | 'forced_choice'
  | 'instructions'

export type BlockType = 
  | 'multiple_choice'
  | 'email_scenario'
  | 'video_scenario'
  | 'ethical_scenario'
  | 'timed_negotiation'
  | 'behavioral_assessment'

export type InvitationStatus = 
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'cancelled'

// -----------------------------------------------------------------------------
// COMPOSITE INTERFACES (FOR COMPLEX QUERIES)
// -----------------------------------------------------------------------------

export interface QuestionWithOptions extends Question {
  mcq_options: McqOption[]
}

export interface QuestionWithCorrectAnswer extends Question {
  mcq_options: McqOption[]
  correct_option?: McqOption // The option where is_correct = true
}

export interface BlockWithQuestions extends Block {
  questions: QuestionWithOptions[]
  scenarios?: Scenario[]
}

export interface BlockWithQuestionsAndAnswers extends Block {
  questions: (QuestionWithOptions & {
    user_answer?: UserAnswer
  })[]
}

export interface PartWithBlocks extends Part {
  blocks: BlockWithQuestions[]
}

export interface AssessmentWithStructure extends Assessment {
  parts: PartWithBlocks[]
}

export interface AssessmentWithProgress extends Assessment {
  total_questions: number
  answered_questions: number
  completion_percentage: number
}

// -----------------------------------------------------------------------------
// ATTEMPT WITH DETAILED PROGRESS
// -----------------------------------------------------------------------------

export interface AttemptWithProgress extends AssessmentAttempt {
  assessment: Assessment
  progress: {
    answered_questions: number
    total_questions: number
    percentage: number
    current_part: Part | null
  }
  invitation?: Pick<AssessmentInvitation, 'invited_email' | 'invitation_name' | 'custom_message'>
}

export interface AttemptWithAnswers extends AssessmentAttempt {
  user_answers: UserAnswer[]
  assessment: Pick<Assessment, 'id' | 'title' | 'total_points' | 'passing_score'>
}

// -----------------------------------------------------------------------------
// SCORING & RESULTS
// -----------------------------------------------------------------------------

export interface QuestionScore {
  question_id: number
  question_text: string
  question_type: QuestionType
  points_possible: number
  points_awarded: number
  is_correct: boolean | null
  user_answer: string | null // Display version of their answer
  correct_answer: string | null // Display version of correct answer
}

export interface AttemptScore {
  attempt_id: number
  assessment_title: string
  total_points_possible: number
  total_points_awarded: number
  percentage: number
  passed: boolean
  completed_at: string
  question_scores: QuestionScore[]
}

export interface ScoreBreakdown {
  by_part: {
    part_id: number
    part_title: string
    points_possible: number
    points_awarded: number
    percentage: number
  }[]
  by_question_type: {
    question_type: QuestionType
    count: number
    points_possible: number
    points_awarded: number
    percentage: number
  }[]
}

// -----------------------------------------------------------------------------
// API REQUEST/RESPONSE TYPES
// -----------------------------------------------------------------------------

export interface CreateInvitationData {
  assessment_id: number
  invited_email: string
  invitation_name?: string
  custom_message?: string
  expires_in_days?: number // defaults to 7
}

export interface AnswerData {
  mcq_option_id?: number
  scenario_option_id?: number
  text_answer?: string
  likert_rating?: number
  video_response_path?: string
}

export interface SaveAnswerRequest {
  attempt_id: number
  question_id: number
  answer_data: AnswerData
}

export interface StartAttemptRequest {
  assessment_id: number
  invitation_token?: string
}

export interface StartAttemptResponse {
  attempt: AssessmentAttempt
  assessment: AssessmentWithStructure
}

// -----------------------------------------------------------------------------
// ADMIN DASHBOARD TYPES
// -----------------------------------------------------------------------------

export interface AssessmentStats {
  total_attempts: number
  completed_attempts: number
  average_score: number
  pass_rate: number
  average_completion_time: number // in minutes
}

export interface InvitationStats {
  total_sent: number
  total_accepted: number
  total_expired: number
  total_pending: number
  acceptance_rate: number
}

export interface QuestionAnalytics {
  question_id: number
  question_text: string
  total_answers: number
  correct_answers: number
  accuracy_rate: number
  option_statistics: {
    option_id: number
    option_text: string
    selection_count: number
    selection_percentage: number
    is_correct: boolean
  }[]
}

// -----------------------------------------------------------------------------
// VALIDATION HELPERS
// -----------------------------------------------------------------------------

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface AttemptValidation extends ValidationResult {
  can_submit: boolean
  missing_required_questions: number[]
  time_remaining: number | null
}

// -----------------------------------------------------------------------------
// UTILITY TYPES
// -----------------------------------------------------------------------------

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>

// Helper type for database inserts
export type DbInsert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>

// Helper type for database updates  
export type DbUpdate<T> = Partial<Omit<T, 'id' | 'created_at'>> & {
  updated_at?: string
} 