-- Create table for custom competency mappings
CREATE TABLE IF NOT EXISTS question_competency_mappings (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    competency_area VARCHAR(50) NOT NULL,
    mapped_by VARCHAR(255), -- User who set this mapping
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_custom BOOLEAN DEFAULT TRUE, -- Distinguish from auto-generated mappings
    
    -- Ensure one mapping per question
    UNIQUE(question_id)
);

-- Create index for performance
CREATE INDEX idx_question_competency_mappings_question_id ON question_competency_mappings(question_id);
CREATE INDEX idx_question_competency_mappings_competency ON question_competency_mappings(competency_area); 