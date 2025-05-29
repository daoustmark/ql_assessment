-- Migration: Add Assessment Invitation System
-- Run this in your Supabase SQL editor

-- Assessment invitations table
CREATE TABLE assessment_invitations (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_by_user_id VARCHAR(255), -- Admin who sent the invitation  
    invitation_token VARCHAR(255) NOT NULL UNIQUE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    attempt_id INTEGER REFERENCES assessment_attempts(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
    invitation_name VARCHAR(255), -- Optional: invitee's name for personalization
    custom_message TEXT, -- Optional: custom message from admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_invitations_token ON assessment_invitations(invitation_token);
CREATE INDEX idx_invitations_email ON assessment_invitations(invited_email);
CREATE INDEX idx_invitations_assessment_id ON assessment_invitations(assessment_id);
CREATE INDEX idx_invitations_status ON assessment_invitations(status);
CREATE INDEX idx_invitations_expires_at ON assessment_invitations(expires_at);

-- Add invitation tracking to assessment_attempts
ALTER TABLE assessment_attempts 
ADD COLUMN invitation_id INTEGER REFERENCES assessment_invitations(id),
ADD COLUMN invitee_email VARCHAR(255),
ADD COLUMN invitee_name VARCHAR(255);

-- Add index for invitation tracking
CREATE INDEX idx_attempts_invitation_id ON assessment_attempts(invitation_id);

-- Create a function to generate unique tokens
CREATE OR REPLACE FUNCTION generate_invitation_token() 
RETURNS VARCHAR(255) AS $$
DECLARE
    token VARCHAR(255);
    token_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random token (you could also use uuid_generate_v4())
        token := encode(gen_random_bytes(32), 'base64');
        -- Remove URL-unsafe characters
        token := replace(replace(replace(token, '/', '_'), '+', '-'), '=', '');
        
        -- Check if token already exists
        SELECT EXISTS(SELECT 1 FROM assessment_invitations WHERE invitation_token = token) INTO token_exists;
        
        -- Exit loop if token is unique
        EXIT WHEN NOT token_exists;
    END LOOP;
    
    RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations() 
RETURNS void AS $$
BEGIN
    UPDATE assessment_invitations 
    SET status = 'expired' 
    WHERE expires_at < NOW() 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Add constraints
ALTER TABLE assessment_invitations 
ADD CONSTRAINT valid_invitation_status 
CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));

-- Add comments for documentation
COMMENT ON TABLE assessment_invitations IS 'Stores email-based invitations to take assessments';
COMMENT ON COLUMN assessment_invitations.invitation_token IS 'Unique token used in invitation URLs';
COMMENT ON COLUMN assessment_invitations.invited_email IS 'Email address of the person being invited';
COMMENT ON COLUMN assessment_invitations.expires_at IS 'When this invitation expires (typically 7-30 days)';
COMMENT ON COLUMN assessment_invitations.used_at IS 'When the invitation was used to start an assessment';
COMMENT ON COLUMN assessment_invitations.status IS 'Current status: pending, accepted, expired, cancelled';
COMMENT ON COLUMN assessment_invitations.invitation_name IS 'Optional name of invitee for personalization'; 