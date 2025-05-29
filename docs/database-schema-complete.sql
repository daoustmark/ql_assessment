-- =============================================================================
-- COMPLETE ASSESSMENT PLATFORM DATABASE SCHEMA
-- Updated: December 2024
-- Includes: Correct Answer Tracking, Invitation System, Scoring System
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CORE ASSESSMENT STRUCTURE
-- -----------------------------------------------------------------------------

-- Main assessments table
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instruction_overall TEXT,
    instruction_detailed TEXT,
    image_before_assessment TEXT,
    time_limit_overall INTEGER, -- in minutes
    total_points INTEGER,
    passing_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment parts/sections
CREATE TABLE parts (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL,
    time_limit INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content blocks within parts
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    block_type VARCHAR(100) NOT NULL, -- 'multiple_choice', 'email_scenario', 'video_scenario', etc.
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual questions within blocks
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    block_id INTEGER NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(100) NOT NULL, -- 'multiple_choice', 'email_response', 'video_response', 'likert_scale', 'essay', etc.
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    time_limit INTEGER, -- in minutes (question-level time limit)
    instruction_before TEXT,
    instruction_after TEXT,
    correct_answer TEXT, -- For non-MCQ questions (essays, etc.)
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multiple choice options
CREATE TABLE mcq_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE, -- ✅ CORRECT ANSWER TRACKING
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenario-based questions (alternative structure for complex scenarios)
CREATE TABLE scenarios (
    id SERIAL PRIMARY KEY,
    block_id INTEGER NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    scenario_text TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options for scenario questions
CREATE TABLE scenario_options (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE, -- ✅ CORRECT ANSWER TRACKING
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- USER ATTEMPTS & RESPONSES
-- -----------------------------------------------------------------------------

-- User assessment attempts
CREATE TABLE assessment_attempts (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id VARCHAR(255), -- Could be UUID or string depending on auth system
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    current_part_id INTEGER REFERENCES parts(id),
    auth_users_id VARCHAR(255), -- For Supabase Auth integration
    score INTEGER, -- ✅ SCORING SYSTEM
    percentage DECIMAL(5,2), -- ✅ SCORING SYSTEM
    passed BOOLEAN, -- ✅ SCORING SYSTEM
    invitation_id INTEGER, -- ✅ INVITATION SYSTEM
    invitee_email VARCHAR(255), -- ✅ INVITATION SYSTEM
    invitee_name VARCHAR(255) -- ✅ INVITATION SYSTEM
);

-- User responses to questions
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    mcq_option_id INTEGER REFERENCES mcq_options(id),
    scenario_id INTEGER REFERENCES scenarios(id),
    scenario_option_id INTEGER REFERENCES scenario_options(id),
    text_answer TEXT, -- For essay/email responses
    likert_rating INTEGER CHECK (likert_rating >= 1 AND likert_rating <= 5), -- For 1-5 scale questions
    video_response_path VARCHAR(255), -- For video upload responses
    points_awarded INTEGER DEFAULT 0, -- ✅ SCORING SYSTEM
    is_correct BOOLEAN, -- ✅ SCORING SYSTEM
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INVITATION SYSTEM
-- -----------------------------------------------------------------------------

-- Assessment invitations
CREATE TABLE assessment_invitations (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_by_user_id VARCHAR(255),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    attempt_id INTEGER REFERENCES assessment_attempts(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    invitation_name VARCHAR(255),
    custom_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------

-- Core structure indexes
CREATE INDEX idx_parts_assessment_id ON parts(assessment_id);
CREATE INDEX idx_parts_sequence ON parts(assessment_id, sequence_order);

CREATE INDEX idx_blocks_part_id ON blocks(part_id);
CREATE INDEX idx_blocks_sequence ON blocks(part_id, sequence_order);

CREATE INDEX idx_questions_block_id ON questions(block_id);
CREATE INDEX idx_questions_sequence ON questions(block_id, sequence_order);
CREATE INDEX idx_questions_type ON questions(question_type);

CREATE INDEX idx_mcq_options_question_id ON mcq_options(question_id);
CREATE INDEX idx_mcq_options_sequence ON mcq_options(question_id, sequence_order);
CREATE INDEX idx_mcq_options_is_correct ON mcq_options(is_correct) WHERE is_correct = TRUE; -- ✅ CORRECT ANSWERS

CREATE INDEX idx_scenarios_block_id ON scenarios(block_id);
CREATE INDEX idx_scenario_options_scenario_id ON scenario_options(scenario_id);
CREATE INDEX idx_scenario_options_is_correct ON scenario_options(is_correct) WHERE is_correct = TRUE; -- ✅ CORRECT ANSWERS

-- Attempt and response indexes
CREATE INDEX idx_assessment_attempts_assessment_id ON assessment_attempts(assessment_id);
CREATE INDEX idx_assessment_attempts_user_id ON assessment_attempts(user_id);
CREATE INDEX idx_assessment_attempts_auth_users_id ON assessment_attempts(auth_users_id);
CREATE INDEX idx_assessment_attempts_invitation_id ON assessment_attempts(invitation_id);

CREATE INDEX idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_mcq_option_id ON user_answers(mcq_option_id);

-- Invitation system indexes
CREATE INDEX idx_invitations_assessment_id ON assessment_invitations(assessment_id);
CREATE INDEX idx_invitations_email ON assessment_invitations(invited_email);
CREATE INDEX idx_invitations_token ON assessment_invitations(invitation_token);
CREATE INDEX idx_invitations_status ON assessment_invitations(status);
CREATE INDEX idx_invitations_expires_at ON assessment_invitations(expires_at);

-- -----------------------------------------------------------------------------
-- UNIQUE CONSTRAINTS
-- -----------------------------------------------------------------------------

-- Ensure proper sequencing
ALTER TABLE parts ADD CONSTRAINT unique_part_sequence_per_assessment 
    UNIQUE (assessment_id, sequence_order);

ALTER TABLE blocks ADD CONSTRAINT unique_block_sequence_per_part 
    UNIQUE (part_id, sequence_order);

ALTER TABLE questions ADD CONSTRAINT unique_question_sequence_per_block 
    UNIQUE (block_id, sequence_order);

ALTER TABLE mcq_options ADD CONSTRAINT unique_option_sequence_per_question 
    UNIQUE (question_id, sequence_order);

ALTER TABLE scenarios ADD CONSTRAINT unique_scenario_sequence_per_block 
    UNIQUE (block_id, sequence_order);

ALTER TABLE scenario_options ADD CONSTRAINT unique_scenario_option_sequence 
    UNIQUE (scenario_id, sequence_order);

-- Prevent duplicate answers per attempt/question
ALTER TABLE user_answers ADD CONSTRAINT unique_answer_per_attempt_question 
    UNIQUE (attempt_id, question_id);

-- -----------------------------------------------------------------------------
-- SUPPORTED QUESTION TYPES
-- -----------------------------------------------------------------------------

/*
QUESTION TYPES SUPPORTED:
- multiple_choice: Standard A/B/C/D/E questions with mcq_options
- email_response: Written email responses stored in text_answer
- video_response: Video recordings with path stored in video_response_path
- timed_video_response: Video with time constraints
- likert_scale: 1-5 rating scale stored in likert_rating
- essay: Long-form written responses in text_answer
- ethical_choice: Multiple choice ethical dilemmas
- forced_choice: Binary A/B decisions
- instructions: Non-scored informational content

BLOCK TYPES SUPPORTED:
- multiple_choice: Blocks containing MCQ questions
- email_scenario: Email response scenarios
- video_scenario: Video response scenarios
- ethical_scenario: Ethical dilemma scenarios
- timed_negotiation: Time-constrained scenarios
- behavioral_assessment: Behavioral evaluation blocks
*/

-- -----------------------------------------------------------------------------
-- DATABASE STATISTICS (Current State)
-- -----------------------------------------------------------------------------

/*
CURRENT DATA SUMMARY (as of last update):
- ✅ 1 Assessment loaded (Quiet Light Assessment)
- ✅ 8 Parts structured
- ✅ Multiple blocks per part
- ✅ 74 Multiple choice questions
- ✅ 56 Questions with correct answers set
- ✅ 18 Questions without correct answers (likely non-MCQ or unmatched)
- ✅ 0 Questions with multiple correct answers (fixed)
- ✅ Full invitation system operational
- ✅ Scoring system ready for implementation
*/

-- -----------------------------------------------------------------------------
-- RECENT UPDATES APPLIED
-- -----------------------------------------------------------------------------

/*
✅ COMPLETED UPDATES:
1. Added is_correct field to mcq_options table
2. Added is_correct field to scenario_options table  
3. Added correct_answer field to questions table
4. Added scoring fields to assessment_attempts (score, percentage, passed)
5. Added scoring fields to user_answers (points_awarded, is_correct)
6. Added invitation system tables and fields
7. Added performance indexes for correct answer lookups
8. Applied correct answers to 56 MCQ questions
9. Fixed duplicate correct answers issue
10. Added time_limit field to questions table
*/

-- -----------------------------------------------------------------------------
-- SAMPLE QUERIES FOR VALIDATION
-- -----------------------------------------------------------------------------

-- Check correct answers are properly set
SELECT 
    q.id,
    q.question_text,
    COUNT(mo.id) as total_options,
    COUNT(CASE WHEN mo.is_correct THEN 1 END) as correct_answers
FROM questions q
LEFT JOIN mcq_options mo ON q.id = mo.question_id
WHERE q.question_type = 'multiple_choice'
GROUP BY q.id, q.question_text
ORDER BY q.id;

-- Verify no questions have multiple correct answers
SELECT 
    question_id,
    COUNT(*) as correct_count
FROM mcq_options 
WHERE is_correct = true 
GROUP BY question_id 
HAVING COUNT(*) > 1;

-- Check assessment structure
SELECT 
    a.title as assessment,
    COUNT(DISTINCT p.id) as parts,
    COUNT(DISTINCT b.id) as blocks,
    COUNT(DISTINCT q.id) as questions
FROM assessments a
LEFT JOIN parts p ON a.id = p.assessment_id
LEFT JOIN blocks b ON p.id = b.part_id
LEFT JOIN questions q ON b.id = q.block_id
GROUP BY a.id, a.title; 