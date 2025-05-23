export interface Assessment {
  id: number
  title: string
  description: string | null
  instruction_overall: string | null
  instruction_detailed: string | null
  image_before_assessment: string | null
  time_limit_overall: number | null
  created_at: string
  updated_at: string
}

export interface Part {
  id: number
  assessment_id: number
  title: string
  description: string | null
  sequence_order: number
  time_limit: number | null
  created_at: string
  updated_at: string
}

export interface Block {
  id: number
  part_id: number
  title: string | null
  description: string | null
  sequence_order: number
  block_type: 'question' | 'content' | 'instruction'
  created_at: string
  updated_at: string
}

export interface Question {
  id: number
  block_id: number
  question_text: string
  question_type: 'mcq' | 'email' | 'video' | 'likert' | 'essay' | 'scenario'
  sequence_order: number
  is_required: boolean
  time_limit: number | null
  instruction_before: string | null
  instruction_after: string | null
  created_at: string
  updated_at: string
}

export interface McqOption {
  id: number
  question_id: number
  option_text: string
  sequence_order: number
  is_correct: boolean | null
  created_at: string
  updated_at: string
}

export interface Scenario {
  id: number
  question_id: number
  title: string
  description: string
  background_info: string | null
  created_at: string
  updated_at: string
}

export interface ScenarioOption {
  id: number
  scenario_id: number
  option_text: string
  sequence_order: number
  scoring_value: number | null
  created_at: string
  updated_at: string
}

export interface AssessmentAttempt {
  id: number
  assessment_id: number
  user_id: string
  started_at: string
  completed_at: string | null
  status: 'in_progress' | 'completed' | 'abandoned'
  current_part_id: number | null
  current_block_id: number | null
  current_question_id: number | null
  total_time_spent: number | null
  created_at: string
  updated_at: string
}

export interface UserAnswer {
  id: number
  attempt_id: number
  question_id: number
  text_answer: string | null
  mcq_option_id: number | null
  scenario_id: number | null
  scenario_option_id: number | null
  likert_rating: number | null
  video_response_path: string | null
  answered_at: string
}

// Combined types for easier use
export interface QuestionWithOptions extends Question {
  mcq_options?: McqOption[]
  scenario?: Scenario & {
    scenario_options: ScenarioOption[]
  }
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