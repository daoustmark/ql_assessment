-- Migration to add correct answer tracking
-- Add is_correct field to mcq_options table
ALTER TABLE mcq_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;

-- Add is_correct field to scenario_options table  
ALTER TABLE scenario_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;

-- For other question types (essay, text_response, etc.), add correct_answer field to questions table
ALTER TABLE questions ADD COLUMN correct_answer TEXT;

-- Add indexes for performance
CREATE INDEX idx_mcq_options_is_correct ON mcq_options(is_correct) WHERE is_correct = TRUE;
CREATE INDEX idx_scenario_options_is_correct ON scenario_options(is_correct) WHERE is_correct = TRUE;

-- Add constraint to ensure only one correct answer per question for MCQs
-- (This is a soft constraint - we'll enforce it in the application logic) 