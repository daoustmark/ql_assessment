const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Question type classifications (matching the updated scoring.ts)
const AUTO_SCORING_QUESTION_TYPES = [
  'multiple_choice',
  'likert_scale',
  'forced_choice',
  'ethical_choice'
]

const MANUAL_SCORING_QUESTION_TYPES = [
  'essay',
  'email_response',
  'video_response',
  'timed_video_response',
  'scenario_response'
]

async function fixManualScoring() {
  console.log('=== FIXING MANUAL SCORING DATA ===\n')

  try {
    // Step 1: Clear incorrect scores from manual questions
    console.log('🧹 Clearing incorrect scores from manual questions...')
    
    const { data: manualAnswers, error: manualError } = await supabase
      .from('user_answers')
      .select(`
        id,
        attempt_id,
        questions!inner (
          question_type
        )
      `)
      .in('questions.question_type', MANUAL_SCORING_QUESTION_TYPES)
      .not('points_awarded', 'is', null) // Questions that were incorrectly scored

    if (manualError) throw manualError

    console.log(`Found ${manualAnswers.length} manual questions that were incorrectly auto-scored`)

    if (manualAnswers.length > 0) {
      const { error: clearError } = await supabase
        .from('user_answers')
        .update({
          points_awarded: null,
          is_correct: null
        })
        .in('id', manualAnswers.map(a => a.id))

      if (clearError) throw clearError
      console.log(`✅ Cleared scores from ${manualAnswers.length} manual questions`)
    }

    // Step 2: Re-score auto-scoring questions properly
    console.log('\n🎯 Re-scoring auto-scoring questions...')

    // Get all completed attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('assessment_attempts')
      .select('id')
      .not('completed_at', 'is', null)

    if (attemptsError) throw attemptsError

    console.log(`Found ${attempts.length} completed attempts to re-score`)

    for (const attempt of attempts) {
      await scoreObjectiveQuestions(attempt.id)
      await calculateAttemptScore(attempt.id)
    }

    console.log('✅ Re-scoring complete!')

    // Step 3: Generate summary report
    console.log('\n📊 SUMMARY REPORT:')
    
    for (const attempt of attempts) {
      const status = await getAssessmentScoringStatus(attempt.id)
      console.log(`\nAttempt ${attempt.id}:`)
      console.log(`  Total questions: ${status.total_questions}`)
      console.log(`  Auto-scored: ${status.auto_scored}`)
      console.log(`  Manually scored: ${status.manually_scored}`)
      console.log(`  Pending manual: ${status.pending_manual}`)
      console.log(`  Auto scoring complete: ${status.auto_scoring_complete}`)
      console.log(`  Manual scoring complete: ${status.manual_scoring_complete}`)
      console.log(`  Overall complete: ${status.overall_complete}`)
    }

  } catch (error) {
    console.error('Error fixing manual scoring:', error)
  }
}

// Helper functions (copied from the updated scoring.ts)
async function scoreMultipleChoiceQuestion(questionId, selectedOptionId) {
  const { data: option, error } = await supabase
    .from('mcq_options')
    .select('is_correct')
    .eq('id', selectedOptionId)
    .single()

  if (error) throw error

  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('points')
    .eq('id', questionId)
    .single()

  if (questionError) throw questionError

  const points = option.is_correct ? (question.points || 1) : 0
  return { points, isCorrect: option.is_correct }
}

async function scoreLikertScaleQuestion(likertRating) {
  const isValid = likertRating >= 1 && likertRating <= 5
  return { 
    points: isValid ? 1 : 0, 
    isCorrect: isValid 
  }
}

async function scoreScenarioQuestion(scenarioOptionId) {
  const { data: option, error } = await supabase
    .from('scenario_options')
    .select('is_correct, points')
    .eq('id', scenarioOptionId)
    .single()

  if (error) throw error

  const points = option.is_correct ? (option.points || 1) : 0
  return { points, isCorrect: option.is_correct }
}

async function scoreObjectiveQuestions(attemptId) {
  const { data: answers, error } = await supabase
    .from('user_answers')
    .select(`
      id,
      question_id,
      mcq_option_id,
      scenario_option_id,
      likert_rating,
      questions!inner (
        question_type,
        points
      )
    `)
    .eq('attempt_id', attemptId)
    .in('questions.question_type', AUTO_SCORING_QUESTION_TYPES)

  if (error) throw error

  for (const answer of answers) {
    let points = 0
    let isCorrect = false
    const questionType = answer.questions.question_type

    if (questionType === 'multiple_choice' && answer.mcq_option_id) {
      const result = await scoreMultipleChoiceQuestion(answer.question_id, answer.mcq_option_id)
      points = result.points
      isCorrect = result.isCorrect
    } else if (questionType === 'likert_scale' && answer.likert_rating) {
      const result = await scoreLikertScaleQuestion(answer.likert_rating)
      points = result.points
      isCorrect = result.isCorrect
    } else if (answer.scenario_option_id) {
      const result = await scoreScenarioQuestion(answer.scenario_option_id)
      points = result.points
      isCorrect = result.isCorrect
    }

    await supabase
      .from('user_answers')
      .update({
        points_awarded: points,
        is_correct: isCorrect
      })
      .eq('id', answer.id)
  }

  console.log(`  ✅ Auto-scored ${answers.length} objective questions for attempt ${attemptId}`)
}

async function calculateAttemptScore(attemptId) {
  const { data: scoreData, error } = await supabase
    .from('user_answers')
    .select(`
      points_awarded,
      questions!inner (
        question_type,
        points
      )
    `)
    .eq('attempt_id', attemptId)
    .not('points_awarded', 'is', null)

  if (error) throw error

  const totalAwarded = scoreData.reduce((sum, answer) => sum + (answer.points_awarded || 0), 0)
  
  const { data: allAnswers, error: allError } = await supabase
    .from('user_answers')
    .select(`
      questions!inner (
        question_type,
        points
      )
    `)
    .eq('attempt_id', attemptId)

  if (allError) throw allError

  let totalPossible = 0
  allAnswers.forEach(answer => {
    const questionType = answer.questions.question_type
    const questionPoints = answer.questions.points || 1
    
    if (AUTO_SCORING_QUESTION_TYPES.includes(questionType)) {
      totalPossible += questionPoints
    }
  })

  scoreData.forEach(answer => {
    const questionType = answer.questions.question_type
    if (MANUAL_SCORING_QUESTION_TYPES.includes(questionType)) {
      totalPossible += answer.questions.points || 1
    }
  })

  const percentage = totalPossible > 0 ? (totalAwarded / totalPossible) * 100 : 0

  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select(`
      assessment_id,
      assessments!inner (
        passing_score
      )
    `)
    .eq('id', attemptId)
    .single()

  if (attemptError) throw attemptError

  const passed = percentage >= (attempt.assessments.passing_score || 70)

  await supabase
    .from('assessment_attempts')
    .update({
      score: totalAwarded,
      percentage: percentage,
      passed: passed
    })
    .eq('id', attemptId)

  console.log(`  ✅ Updated attempt ${attemptId}: ${totalAwarded}/${totalPossible} points (${percentage.toFixed(1)}%)`)
}

async function getAssessmentScoringStatus(attemptId) {
  const { data: answers, error } = await supabase
    .from('user_answers')
    .select(`
      id,
      points_awarded,
      is_correct,
      questions!inner (
        question_type,
        points
      )
    `)
    .eq('attempt_id', attemptId)

  if (error) throw error

  const summary = {
    total_questions: answers.length,
    auto_scored: 0,
    manually_scored: 0,
    pending_manual: 0,
    auto_scoring_complete: true,
    manual_scoring_complete: true,
    overall_complete: false
  }

  answers.forEach(answer => {
    const questionType = answer.questions.question_type
    const isScored = answer.points_awarded !== null

    if (AUTO_SCORING_QUESTION_TYPES.includes(questionType)) {
      if (isScored) {
        summary.auto_scored++
      } else {
        summary.auto_scoring_complete = false
      }
    } else if (MANUAL_SCORING_QUESTION_TYPES.includes(questionType)) {
      if (isScored) {
        summary.manually_scored++
      } else {
        summary.pending_manual++
        summary.manual_scoring_complete = false
      }
    }
  })

  summary.overall_complete = summary.auto_scoring_complete && summary.manual_scoring_complete

  return summary
}

fixManualScoring().catch(console.error) 