const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function analyzeAssessment() {
  console.log('=== ASSESSMENT ANALYSIS ===\n')

  // Get the assessment
  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessments')
    .select('*')

  if (assessmentsError) {
    console.error('Error fetching assessments:', assessmentsError)
    return
  }

  console.log('📋 Assessments:')
  assessments.forEach(assessment => {
    console.log(`- ID: ${assessment.id}, Title: ${assessment.title}`)
  })

  if (assessments.length === 0) {
    console.log('No assessments found')
    return
  }

  const assessmentId = assessments[0].id
  console.log(`\n🔍 Analyzing Assessment ID: ${assessmentId}\n`)

  // Get all questions with their types and current scoring status
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      correct_answer,
      points,
      blocks!inner (
        id,
        title,
        block_type,
        parts!inner (
          assessment_id,
          title
        )
      )
    `)
    .eq('blocks.parts.assessment_id', assessmentId)
    .order('id')

  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
    return
  }

  // Group questions by type
  const questionsByType = {}
  questions.forEach(q => {
    if (!questionsByType[q.question_type]) {
      questionsByType[q.question_type] = []
    }
    questionsByType[q.question_type].push(q)
  })

  console.log('📊 Question Types Distribution:')
  Object.keys(questionsByType).forEach(type => {
    console.log(`- ${type}: ${questionsByType[type].length} questions`)
  })

  // Identify which question types should require manual scoring
  const manualScoringTypes = [
    'essay',
    'email_response', 
    'video_response',
    'timed_video_response',
    'scenario_response'
  ]

  const autoScoringTypes = [
    'multiple_choice',
    'likert_scale',
    'forced_choice',
    'ethical_choice'
  ]

  console.log('\n🎯 Question Types Analysis:')
  console.log('Auto-scoring types:', autoScoringTypes.join(', '))
  console.log('Manual-scoring types:', manualScoringTypes.join(', '))

  // Check if we have any assessment attempts to analyze scoring status
  const { data: attempts, error: attemptsError } = await supabase
    .from('assessment_attempts')
    .select('id, completed_at')
    .eq('assessment_id', assessmentId)
    .not('completed_at', 'is', null)

  if (attemptsError) {
    console.error('Error fetching attempts:', attemptsError)
    return
  }

  console.log(`\n📝 Found ${attempts.length} completed attempts`)

  if (attempts.length > 0) {
    // Analyze the scoring status of the first completed attempt
    const attemptId = attempts[0].id
    console.log(`\n🔍 Analyzing Attempt ID: ${attemptId}`)

    const { data: answers, error: answersError } = await supabase
      .from('user_answers')
      .select(`
        id,
        question_id,
        points_awarded,
        is_correct,
        text_answer,
        video_response_path,
        questions!inner (
          question_type,
          correct_answer,
          points
        )
      `)
      .eq('attempt_id', attemptId)

    if (answersError) {
      console.error('Error fetching answers:', answersError)
      return
    }

    // Analyze scoring status by question type
    const scoringAnalysis = {}
    answers.forEach(answer => {
      const qType = answer.questions.question_type
      if (!scoringAnalysis[qType]) {
        scoringAnalysis[qType] = {
          total: 0,
          scored: 0,
          unscored: 0,
          hasTextResponse: 0,
          hasVideoResponse: 0
        }
      }
      
      const analysis = scoringAnalysis[qType]
      analysis.total++
      
      if (answer.points_awarded !== null && answer.is_correct !== null) {
        analysis.scored++
      } else {
        analysis.unscored++
      }
      
      if (answer.text_answer) {
        analysis.hasTextResponse++
      }
      
      if (answer.video_response_path) {
        analysis.hasVideoResponse++
      }
    })

    console.log('\n📈 Scoring Status by Question Type:')
    Object.keys(scoringAnalysis).forEach(type => {
      const analysis = scoringAnalysis[type]
      const shouldBeManual = manualScoringTypes.includes(type)
      const actuallyScored = analysis.scored > 0
      
      console.log(`\n${type}:`)
      console.log(`  Total: ${analysis.total}`)
      console.log(`  Scored: ${analysis.scored}`)
      console.log(`  Unscored: ${analysis.unscored}`)
      console.log(`  Text responses: ${analysis.hasTextResponse}`)
      console.log(`  Video responses: ${analysis.hasVideoResponse}`)
      console.log(`  Should be manual: ${shouldBeManual}`)
      console.log(`  Currently scored: ${actuallyScored}`)
      
      if (shouldBeManual && actuallyScored) {
        console.log(`  ⚠️  ISSUE: Manual scoring type is showing as scored!`)
      }
    })

    // Check for questions that have correct_answer set but should be manual
    console.log('\n🔍 Questions with Incorrect Scoring Configuration:')
    const problematicQuestions = questions.filter(q => {
      const isManualType = manualScoringTypes.includes(q.question_type)
      const hasCorrectAnswer = q.correct_answer !== null
      return isManualType && hasCorrectAnswer
    })

    if (problematicQuestions.length > 0) {
      console.log('Questions that should be manual but have correct_answer set:')
      problematicQuestions.forEach(q => {
        console.log(`- ID: ${q.id}, Type: ${q.question_type}, Text: ${q.question_text.substring(0, 80)}...`)
      })
    } else {
      console.log('✅ No questions found with incorrect scoring configuration')
    }
  }

  console.log('\n=== ANALYSIS COMPLETE ===')
}

analyzeAssessment().catch(console.error) 