-- Add time_limit column to questions table
-- time_limit is in seconds, null means no time limit
ALTER TABLE questions 
ADD COLUMN time_limit INTEGER;

-- Add a comment to document the field
COMMENT ON COLUMN questions.time_limit IS 'Time limit for answering this question in seconds. NULL means no time limit.';

-- Optional: Add a check constraint to ensure positive values
ALTER TABLE questions 
ADD CONSTRAINT check_positive_time_limit 
CHECK (time_limit IS NULL OR time_limit > 0); 