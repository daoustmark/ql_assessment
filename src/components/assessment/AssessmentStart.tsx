const { data: attemptData, error: attemptError } = await supabase
  .from('assessment_attempts')
  .insert({
    user_id: user.id,
    assessment_id: selectedAssessment,
    started_at: new Date().toISOString()
  })
  .select('id')
  .single(); 