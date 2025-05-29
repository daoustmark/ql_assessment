-- Migration: Add detailed rubric scoring support
-- Run this in your Supabase SQL editor

-- Create table to store detailed rubric scoring
CREATE TABLE rubric_scores (
    id SERIAL PRIMARY KEY,
    user_answer_id INTEGER NOT NULL REFERENCES user_answers(id) ON DELETE CASCADE,
    rubric_criterion VARCHAR(100) NOT NULL, -- e.g., 'professional_tone', 'problem_resolution', etc.
    max_points INTEGER NOT NULL,
    points_awarded INTEGER NOT NULL,
    notes TEXT, -- Optional notes from grader
    graded_by VARCHAR(255), -- User ID of grader
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_rubric_scores_user_answer_id ON rubric_scores(user_answer_id);
CREATE INDEX idx_rubric_scores_criterion ON rubric_scores(rubric_criterion);

-- Add constraints
ALTER TABLE rubric_scores ADD CONSTRAINT chk_points_valid 
    CHECK (points_awarded >= 0 AND points_awarded <= max_points);

-- Add unique constraint to prevent duplicate scoring of same criterion
ALTER TABLE rubric_scores ADD CONSTRAINT unique_answer_criterion 
    UNIQUE (user_answer_id, rubric_criterion);

-- Add comments
COMMENT ON TABLE rubric_scores IS 'Detailed rubric scoring breakdown for manual assessment questions';
COMMENT ON COLUMN rubric_scores.user_answer_id IS 'Reference to the user answer being scored';
COMMENT ON COLUMN rubric_scores.rubric_criterion IS 'Scoring criterion (professional_tone, problem_resolution, etc.)';
COMMENT ON COLUMN rubric_scores.max_points IS 'Maximum points possible for this criterion';
COMMENT ON COLUMN rubric_scores.points_awarded IS 'Points awarded for this criterion';
COMMENT ON COLUMN rubric_scores.notes IS 'Optional grader notes for this criterion';
COMMENT ON COLUMN rubric_scores.graded_by IS 'User ID of the person who provided this score';
COMMENT ON COLUMN rubric_scores.graded_at IS 'Timestamp when this criterion was scored'; 