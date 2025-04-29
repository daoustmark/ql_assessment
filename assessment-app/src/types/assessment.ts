// Types for the assessment system

export type Assessment = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

export type Part = {
  id: number;
  assessment_id: number;
  title: string;
  description: string;
  sequence_order: number;
  created_at: string;
  blocks?: Block[];
};

export type Block = {
  id: number;
  part_id: number;
  title: string;
  description: string;
  block_type: string;
  sequence_order: number;
  created_at: string;
  questions?: Question[];
  scenarios?: Scenario[];
};

export type Question = {
  id: number;
  block_id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'textarea' | 'written' | 'video' | 'email' | 'likert';
  sequence_order: number;
  is_required: boolean;
  created_at: string;
  mcq_options?: MCQOption[];
  likert_statements?: LikertStatement[];
};

export type MCQOption = {
  id: number;
  question_id: number;
  option_text: string;
  sequence_order: number;
  created_at: string;
};

export type Scenario = {
  id: number;
  block_id: number;
  scenario_text: string;
  sequence_order: number;
  created_at: string;
  scenario_options?: ScenarioOption[];
};

export type ScenarioOption = {
  id: number;
  scenario_id: number;
  option_text: string;
  sequence_order: number;
  created_at: string;
};

export type LikertStatement = {
  id: number;
  question_id: number;
  statement_text: string;
  sequence_order: number;
  created_at: string;
};

export type AssessmentAttempt = {
  id: number;
  user_id: string;
  assessment_id: number;
  started_at: string;
  completed_at?: string;
  current_part_id?: number;
  created_at?: string;
};

export type UserAnswer = {
  id?: number;
  attempt_id: number;
  question_id: number;
  mcq_option_id?: number;
  text_answer?: string;
  likert_rating?: number;
  video_response_path?: string;
  scenario_id?: number;
  scenario_option_id?: number;
  selected_option_id?: number;
  answered_at?: string;
}; 