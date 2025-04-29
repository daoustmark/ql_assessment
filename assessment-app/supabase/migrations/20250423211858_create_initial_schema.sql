-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assessments Table (Optional, can represent different versions or types)
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Parts Table
CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE, -- Link if using assessments table
    part_number INTEGER NOT NULL,
    part_title TEXT NOT NULL,
    assessment_type TEXT, -- e.g., 'multiple-choice', 'timed-scenario-response', 'ethical-choice', 'likert-scale'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
    -- Note: Consider unique constraint on (assessment_id, part_number) if using assessments table
);

-- Blocks Table (Groups of questions within a part)
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    block_title TEXT NOT NULL,
    block_order INTEGER, -- Optional: for ordering blocks within a part
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Questions Table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- e.g., 'multiple-choice', 'video-response', 'likert'
    explanation TEXT, -- For foundational knowledge questions
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (block_id, question_number) -- Ensure question numbers are unique within a block
);

-- MCQ Options Table
CREATE TABLE mcq_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    choice CHAR(1) NOT NULL,
    "text" TEXT NOT NULL, -- Use quotes for reserved keyword
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (question_id, choice) -- Ensure choices are unique per question
);

-- Scenarios Table (For timed responses, ethical dilemmas)
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID REFERENCES parts(id) ON DELETE CASCADE, -- Link scenarios directly to parts
    scenario_number INTEGER, -- For ethical dilemmas
    title TEXT NOT NULL,
    background TEXT,
    event_description TEXT,
    buyer_email_subject TEXT, -- For timed negotiation
    buyer_email_body TEXT, -- For timed negotiation
    seller_reaction TEXT, -- For timed negotiation
    task_description TEXT,
    prompt_text TEXT, -- For video scenarios
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
    -- Note: Could link to questions if scenarios ARE the questions
);

-- Scenario Options Table (For ethical dilemmas A/B choices)
CREATE TABLE scenario_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    choice CHAR(1) NOT NULL,
    "text" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (scenario_id, choice)
);

-- Likert Statements Table (For Part 6)
CREATE TABLE likert_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    statement_number INTEGER NOT NULL,
    statement_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (part_id, statement_number)
);

-- Assessment Attempts Table
CREATE TABLE assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL, -- Link if using assessments table
    status TEXT DEFAULT 'started', -- e.g., 'started', 'in-progress', 'completed'
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Answers Table
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE, -- For MCQs, video responses linked to foundation questions
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE, -- For ethical choices, timed responses
    likert_statement_id UUID REFERENCES likert_statements(id) ON DELETE CASCADE, -- For Likert scale responses
    selected_mcq_option_id UUID REFERENCES mcq_options(id) ON DELETE SET NULL,
    selected_scenario_option_id UUID REFERENCES scenario_options(id) ON DELETE SET NULL,
    likert_score INTEGER, -- e.g., 1-5
    text_response TEXT, -- For timed negotiation response
    video_response_path TEXT, -- Path in Supabase Storage
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Ensure an answer belongs to one question type
    CONSTRAINT chk_answer_type CHECK (
        (question_id IS NOT NULL AND scenario_id IS NULL AND likert_statement_id IS NULL) OR
        (question_id IS NULL AND scenario_id IS NOT NULL AND likert_statement_id IS NULL) OR
        (question_id IS NULL AND scenario_id IS NULL AND likert_statement_id IS NOT NULL)
    )
);

-- Enable RLS for tables with user-specific data
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies later (e.g., user can only see their own attempts/answers) 