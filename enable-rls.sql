-- Enable RLS on assessment_attempts table
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_attempts
CREATE POLICY "Users can view own attempts" ON assessment_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own attempts" ON assessment_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own attempts" ON assessment_attempts FOR UPDATE USING (user_id = auth.uid()); 