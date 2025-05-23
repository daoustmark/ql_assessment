// Database entity interfaces matching the updated schema with scoring support:

export interface Assessment {
  id: number;
  title: string;
  description: string | null;
  total_points: number | null;
  passing_score: number | null; // Percentage 0-100
  created_at: string;
}

export interface Part {
  id: number;
  assessment_id: number;
  title: string;
  description: string | null;
  sequence_order: number;
  created_at: string;
}

export interface Block {
  id: number;
  part_id: number;
  title: string;
  description: string | null;
  block_type: string; // 'multiple_choice' | 'email_scenario' | 'video_scenario' | 'ethical_scenario'
  sequence_order: number;
  created_at: string;
}

export interface Question {
  id: number;
  block_id: number;
  question_text: string;
  question_type: string; // 'multiple_choice' | 'email_response' | 'video_response' | 'likert_scale' | 'essay' | etc.
  sequence_order: number;
  is_required: boolean;
  time_limit: number | null; // Time limit in seconds
  correct_answer: string | null; // For essay/email/text questions
  points: number; // Points awarded for correct answer
  created_at: string;
  mcq_options?: McqOption[]; // Populated when fetching questions
}

export interface McqOption {
  id: number;
  question_id: number;
  option_text: string;
  sequence_order: number;
  is_correct: boolean; // Indicates if this is the correct answer
  created_at: string;
}

export interface Scenario {
  id: number;
  block_id: number;
  scenario_text: string;
  sequence_order: number;
  created_at: string;
  scenario_options?: ScenarioOption[]; // Populated when fetching scenarios
}

export interface ScenarioOption {
  id: number;
  scenario_id: number;
  option_text: string;
  sequence_order: number;
  is_correct: boolean; // Indicates if this is the preferred/correct choice
  points: number; // Points awarded for selecting this option
  created_at: string;
}

export interface AssessmentAttempt {
  id: number;
  assessment_id: number;
  user_id: string | null;
  started_at: string;
  completed_at: string | null;
  current_part_id: number | null;
  auth_users_id: string | null;
  score: number | null; // Total points earned
  percentage: number | null; // Percentage score
  passed: boolean | null; // Whether attempt passed
  progress?: AttemptProgress; // Progress information
}

// Progress tracking interface
export interface AttemptProgress {
  answered_questions: number; // Number of questions answered
  total_questions: number; // Total questions in assessment
  percentage: number; // Progress percentage (0-100)
}

export interface UserAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  mcq_option_id: number | null;
  scenario_id: number | null;
  scenario_option_id: number | null;
  text_answer: string | null;
  likert_rating: number | null; // 1-5 scale
  video_response_path: string | null;
  points_awarded: number; // Points earned for this answer
  is_correct: boolean | null; // Whether this answer was correct
  answered_at: string;
}

// Composite interfaces for complex data fetching:
export interface AssessmentWithStructure extends Assessment {
  parts: (Part & {
    blocks: (Block & {
      questions: Question[];
      scenarios: Scenario[];
    })[];
  })[];
}

// For admin dashboard - simpler structure
export interface AssessmentWithParts extends Assessment {
  parts: Part[];
}

// Answer data for saving responses (updated with scoring)
export interface AnswerData {
  mcq_option_id?: number;
  scenario_option_id?: number;
  text_answer?: string;
  likert_rating?: number; // 1-5
  video_response_path?: string;
  points_awarded?: number;
  is_correct?: boolean;
}

// Scoring and analytics interfaces
export interface QuestionScore {
  question_id: number;
  points_possible: number;
  points_awarded: number;
  is_correct: boolean;
  answer_type: 'mcq' | 'text' | 'likert' | 'video' | 'scenario';
}

export interface AttemptScore {
  attempt_id: number;
  total_points_possible: number;
  total_points_awarded: number;
  percentage: number;
  passed: boolean;
  question_scores: QuestionScore[];
} 