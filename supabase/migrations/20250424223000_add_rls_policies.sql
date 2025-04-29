-- RLS policies for assessment_attempts
CREATE POLICY "Users can view own attempts" ON assessment_attempts 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own attempts" ON assessment_attempts 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts" ON assessment_attempts 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS policies for user_answers  
CREATE POLICY "Users can view own answers" ON user_answers 
  FOR SELECT 
  USING (attempt_id IN (
    SELECT id FROM assessment_attempts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own answers" ON user_answers 
  FOR INSERT 
  WITH CHECK (attempt_id IN (
    SELECT id FROM assessment_attempts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own answers" ON user_answers 
  FOR UPDATE 
  USING (attempt_id IN (
    SELECT id FROM assessment_attempts WHERE user_id = auth.uid()
  )); 