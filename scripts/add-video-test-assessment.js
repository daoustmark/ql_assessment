require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Video-focused test user
const VIDEO_TEST_USER = {
  name: 'Alex Rivera',
  email: 'alex.rivera@test.com',
  performanceLevel: 'high',
  completionPattern: 'complete',
  responseStyle: 'video_focused' // Special style for video responses
}

// Enhanced video responses
const VIDEO_RESPONSES = {
  email: "Thank you for your inquiry. I've carefully reviewed your concerns about the business acquisition. Let me address each point systematically: First, regarding the customer concentration risk, our analysis shows that while 35% of revenue comes from the top client, this relationship has been stable for over 5 years with consistent growth. Second, concerning the technical infrastructure, while there are some legacy components, we have a clear modernization roadmap that would actually present opportunities for improvement and cost savings. I'd be happy to schedule a detailed call to walk through our comprehensive due diligence findings and discuss potential mitigation strategies.",
  essay: "Evaluating this SaaS acquisition requires a comprehensive risk-adjusted approach that balances quantitative metrics with qualitative strategic factors. From a financial perspective, the unit economics are compelling: customer acquisition cost has declined 20% year-over-year while lifetime value remains stable, indicating improving marketing efficiency and product-market fit. The 95% net revenue retention suggests strong customer satisfaction and expansion potential. However, several risk factors warrant careful consideration. Customer concentration presents the most significant concern, with 35% of revenue from a single client. While this client has a five-year history and growing usage, contract terms should be examined for renewal risks and pricing power. The technical infrastructure includes some legacy components that, while functional, may require modernization investment. This presents both risk and opportunity - the right acquirer could realize significant value through strategic technology updates. Market position analysis reveals strong competitive moats through network effects and high switching costs. The product serves a critical business function with limited substitutes, supporting pricing power and retention. The management team's domain expertise and customer relationships represent significant intangible assets that must be carefully transitioned. Recommended acquisition approach: Proceed with adjusted valuation reflecting concentration risk, implement customer diversification strategy, and develop technical modernization roadmap with clear ROI projections.",
  video_path: "test-videos/comprehensive-analysis-alex-rivera.mp4",
  timed_video: "test-videos/timed-negotiation-alex-rivera.mp4"
}

async function getAssessmentStructure() {
  console.log('📊 Fetching assessment structure...')
  
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      *,
      parts (
        *,
        blocks (
          *,
          questions (
            *,
            mcq_options (*)
          )
        )
      )
    `)
    .eq('id', 1)
    .order('sequence_order', { foreignTable: 'parts' })
    .order('sequence_order', { foreignTable: 'parts.blocks' })
    .order('sequence_order', { foreignTable: 'parts.blocks.questions' })
    .order('sequence_order', { foreignTable: 'parts.blocks.questions.mcq_options' })
    .single()

  if (error) {
    console.error('Error fetching assessment:', error)
    throw error
  }

  return assessment
}

function getCorrectAnswerForMCQ(question) {
  const correctOption = question.mcq_options?.find(option => option.is_correct)
  return correctOption?.id || null
}

function shouldAnswerCorrectly(questionIndex) {
  // High performer with slight variability
  const baseAccuracy = 0.92
  const randomFactor = 0.9 + (Math.random() * 0.2) // 0.9-1.1
  return Math.random() < (baseAccuracy * randomFactor)
}

function getVideoFocusedResponse(questionType, isCorrect) {
  if (questionType === 'email_response') {
    return VIDEO_RESPONSES.email
  } else if (questionType === 'essay') {
    return VIDEO_RESPONSES.essay
  } else if (questionType === 'video_response') {
    return VIDEO_RESPONSES.video_path
  } else if (questionType === 'timed_video_response') {
    return VIDEO_RESPONSES.timed_video
  }
  
  return "Comprehensive and detailed response demonstrating deep industry knowledge and analytical thinking."
}

async function createVideoTestAttempt() {
  console.log(`\n👤 Creating video-focused test attempt for ${VIDEO_TEST_USER.name}...`)
  
  const assessment = await getAssessmentStructure()
  
  // Create the assessment attempt
  const attemptData = {
    assessment_id: assessment.id,
    user_id: `test_user_${VIDEO_TEST_USER.email.replace('@test.com', '')}`,
    invitee_email: VIDEO_TEST_USER.email,
    invitee_name: VIDEO_TEST_USER.name,
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Started 5 days ago
  }

  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .insert([attemptData])
    .select()
    .single()

  if (attemptError) {
    console.error('Error creating attempt:', attemptError)
    throw attemptError
  }

  console.log(`✅ Created attempt ${attempt.id}`)

  // Collect all questions
  const allQuestions = []
  for (const part of assessment.parts) {
    for (const block of part.blocks) {
      for (const question of block.questions) {
        allQuestions.push(question)
      }
    }
  }

  console.log(`📝 Answering all ${allQuestions.length} questions with video focus...`)

  const answers = []
  let totalPoints = 0
  let earnedPoints = 0
  let likertIndex = 0

  for (let i = 0; i < allQuestions.length; i++) {
    const question = allQuestions[i]
    const questionPoints = question.points || 1
    totalPoints += questionPoints

    let answerData = {
      attempt_id: attempt.id,
      question_id: question.id,
      answered_at: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString()
    }

    let isCorrect = false
    let pointsAwarded = 0

    if (question.question_type === 'multiple_choice') {
      const correctOptionId = getCorrectAnswerForMCQ(question)
      const shouldBeCorrect = shouldAnswerCorrectly(i)
      
      if (shouldBeCorrect && correctOptionId) {
        answerData.mcq_option_id = correctOptionId
        isCorrect = true
        pointsAwarded = questionPoints
      } else {
        const incorrectOptions = question.mcq_options.filter(opt => !opt.is_correct)
        if (incorrectOptions.length > 0) {
          const randomIncorrect = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)]
          answerData.mcq_option_id = randomIncorrect.id
        }
        isCorrect = false
        pointsAwarded = 0
      }
    } else if (question.question_type === 'email_response' || question.question_type === 'essay') {
      const shouldBeCorrect = shouldAnswerCorrectly(i)
      answerData.text_answer = getVideoFocusedResponse(question.question_type, shouldBeCorrect)
      
      // High quality responses get full points
      pointsAwarded = shouldBeCorrect ? questionPoints : questionPoints * 0.85
      isCorrect = shouldBeCorrect
    } else if (question.question_type.includes('video')) {
      const shouldBeCorrect = shouldAnswerCorrectly(i)
      answerData.video_response_path = getVideoFocusedResponse(question.question_type, shouldBeCorrect)
      
      // Video responses are high quality
      pointsAwarded = shouldBeCorrect ? questionPoints : questionPoints * 0.9
      isCorrect = shouldBeCorrect
    } else if (question.question_type === 'likert_scale') {
      // Consistent high performance ratings
      answerData.likert_rating = [4, 5, 5, 4, 5][likertIndex % 5]
      likertIndex++
      pointsAwarded = questionPoints
      isCorrect = null
    } else {
      answerData.text_answer = getVideoFocusedResponse('essay', true)
      pointsAwarded = questionPoints * 0.95
      isCorrect = true
    }

    answerData.points_awarded = pointsAwarded
    answerData.is_correct = isCorrect
    earnedPoints += pointsAwarded

    answers.push(answerData)

    if (i % 20 === 0) {
      console.log(`  📝 Processed ${i + 1}/${allQuestions.length} questions`)
    }
  }

  // Insert all answers
  const { error: answersError } = await supabase
    .from('user_answers')
    .insert(answers)

  if (answersError) {
    console.error('Error inserting answers:', answersError)
    throw answersError
  }

  // Calculate final score and update attempt
  const percentage = (earnedPoints / totalPoints) * 100
  const passed = percentage >= 70

  const updateData = {
    score: Math.round(earnedPoints),
    percentage: Math.round(percentage * 100) / 100,
    passed: passed,
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Completed 2 days ago
  }

  const { error: updateError } = await supabase
    .from('assessment_attempts')
    .update(updateData)
    .eq('id', attempt.id)

  if (updateError) {
    console.error('Error updating attempt:', updateError)
    throw updateError
  }

  console.log(`✅ ${VIDEO_TEST_USER.name}: ${earnedPoints.toFixed(1)}/${totalPoints} points (${percentage.toFixed(1)}%) - ${passed ? 'PASSED' : 'FAILED'}`)
  
  return {
    attempt,
    answers: answers.length,
    score: earnedPoints.toFixed(1),
    totalPoints,
    percentage: percentage.toFixed(1),
    passed
  }
}

async function main() {
  console.log('🎥 Creating video-focused test assessment...\n')
  
  try {
    const result = await createVideoTestAttempt()
    
    console.log('\n🎉 Video-focused test assessment created successfully!')
    console.log(`📊 Final stats: ${result.answers} answers, ${result.percentage}% score`)
    console.log('\nThis assessment emphasizes:')
    console.log('- Detailed video response examples')
    console.log('- High-quality email and essay responses')
    console.log('- Strong performance across all question types')
    console.log('- Realistic completion timestamps')

  } catch (error) {
    console.error('❌ Error creating video test assessment:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createVideoTestAttempt } 