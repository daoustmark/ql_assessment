-- Migration: Add correct answer support to assessment system
-- Run this in your Supabase SQL editor

-- Add is_correct column to mcq_options table
ALTER TABLE mcq_options 
ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;

-- Add comment to document the field
COMMENT ON COLUMN mcq_options.is_correct IS 'Indicates if this option is the correct answer for the question';

-- Add columns to questions table for other question types
ALTER TABLE questions 
ADD COLUMN correct_answer TEXT,
ADD COLUMN points DECIMAL(5,2) DEFAULT 1.0;

-- Add comments
COMMENT ON COLUMN questions.correct_answer IS 'Expected/correct answer for essay, email, or other text-based questions';
COMMENT ON COLUMN questions.points IS 'Points awarded for correct answer (default 1.0)';

-- Add scoring columns to scenario_options table
ALTER TABLE scenario_options 
ADD COLUMN is_correct BOOLEAN DEFAULT FALSE,
ADD COLUMN points DECIMAL(5,2) DEFAULT 1.0;

COMMENT ON COLUMN scenario_options.is_correct IS 'Indicates if this scenario option is the preferred/correct choice';
COMMENT ON COLUMN scenario_options.points IS 'Points awarded for selecting this option';

-- Add total possible points to assessments table
ALTER TABLE assessments 
ADD COLUMN total_points DECIMAL(7,2),
ADD COLUMN passing_score DECIMAL(5,2);

COMMENT ON COLUMN assessments.total_points IS 'Total possible points for this assessment (calculated from questions)';
COMMENT ON COLUMN assessments.passing_score IS 'Minimum score required to pass (percentage 0-100)';

-- Add scoring to assessment attempts
ALTER TABLE assessment_attempts 
ADD COLUMN score DECIMAL(7,2),
ADD COLUMN percentage DECIMAL(5,2),
ADD COLUMN passed BOOLEAN;

COMMENT ON COLUMN assessment_attempts.score IS 'Total points earned in this attempt';
COMMENT ON COLUMN assessment_attempts.percentage IS 'Percentage score (score/total_points * 100)';
COMMENT ON COLUMN assessment_attempts.passed IS 'Whether this attempt met the passing criteria';

-- Add individual question scoring to user_answers
ALTER TABLE user_answers 
ADD COLUMN points_awarded DECIMAL(5,2) DEFAULT 0,
ADD COLUMN is_correct BOOLEAN;

COMMENT ON COLUMN user_answers.points_awarded IS 'Points awarded for this specific answer';
COMMENT ON COLUMN user_answers.is_correct IS 'Whether this answer was marked as correct';

-- Create indexes for performance
CREATE INDEX idx_mcq_options_is_correct ON mcq_options(is_correct);
CREATE INDEX idx_scenario_options_is_correct ON scenario_options(is_correct);
CREATE INDEX idx_user_answers_is_correct ON user_answers(is_correct);
CREATE INDEX idx_assessment_attempts_passed ON assessment_attempts(passed);

-- Update existing data to have sensible defaults
-- Mark first option as correct for existing multiple choice questions (this is just a placeholder)
UPDATE mcq_options 
SET is_correct = (sequence_order = 1) 
WHERE question_id IN (
  SELECT id FROM questions WHERE question_type = 'multiple_choice'
);

-- Set default points for existing questions
UPDATE questions SET points = 1.0 WHERE points IS NULL; 