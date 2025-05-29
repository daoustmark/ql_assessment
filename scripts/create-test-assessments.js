require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Test user profiles with different completion patterns
const TEST_USERS = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@test.com',
    performanceLevel: 'high', // 85-95% correct answers
    completionPattern: 'complete', // Completes all sections
    responseStyle: 'thorough' // Detailed text responses
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@test.com', 
    performanceLevel: 'medium', // 70-80% correct answers
    completionPattern: 'complete',
    responseStyle: 'concise' // Brief but accurate responses
  },
  {
    name: 'Jennifer Rodriguez',
    email: 'jennifer.rodriguez@test.com',
    performanceLevel: 'high', // 88-92% correct answers
    completionPattern: 'partial', // Stops at Part 4 (timed negotiation)
    responseStyle: 'detailed' // Very thorough responses
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@test.com',
    performanceLevel: 'low', // 60-70% correct answers
    completionPattern: 'complete',
    responseStyle: 'brief' // Minimal responses
  },
  {
    name: 'Lisa Wang',
    email: 'lisa.wang@test.com',
    performanceLevel: 'medium', // 75-82% correct answers
    completionPattern: 'abandoned', // Stops at Part 2
    responseStyle: 'moderate'
  }
]

// Sample text responses based on style
const SAMPLE_RESPONSES = {
  brief: {
    email: "I would email the buyer immediately to address their concerns and schedule a call to discuss the issues in detail.",
    essay: "The key factors to consider are market competition, customer concentration risk, and technical stack sustainability. I would focus on these areas during due diligence.",
    video_path: "test-videos/brief-response-001.mp4"
  },
  concise: {
    email: "Dear Buyer, Thank you for raising these concerns about the acquisition. I'd like to schedule a call this week to address each point systematically and provide the additional data you've requested. I believe we can resolve these issues quickly. Best regards,",
    essay: "When evaluating this SaaS business, the primary considerations include customer retention metrics, product-market fit, and scalability potential. The declining CAC with stable LTV suggests improving efficiency, while the technical debt in the legacy codebase presents a manageable risk if properly documented during transition.",
    video_path: "test-videos/concise-response-002.mp4"
  },
  thorough: {
    email: "Dear [Buyer Name], I hope this email finds you well. Thank you for taking the time to review the due diligence materials and for raising these important concerns. I understand that the recent TOS changes and customer concentration issues require careful consideration, and I appreciate your diligence in this process. I would like to propose scheduling a comprehensive call this week where we can address each of your points in detail. I have prepared additional documentation that I believe will address your concerns about the Amazon FBA regulatory changes and can provide historical data showing how we've navigated similar challenges in the past. Regarding the customer concentration, I have case studies demonstrating the stability and growth trajectory of our key accounts. Would you be available for a 60-minute call this Thursday or Friday afternoon? Best regards,",
    essay: "The evaluation of this SaaS business requires a multi-faceted approach considering both quantitative metrics and qualitative factors. From a financial perspective, the declining customer acquisition cost combined with stable lifetime value indicates improving marketing efficiency and suggests the business is achieving better product-market fit over time. However, this must be balanced against several risk factors that warrant careful examination. The technical infrastructure, particularly the legacy codebase in Perl, represents a significant concern that could impact long-term scalability and maintenance costs. While the current development team has expertise in this language, the declining pool of available developers creates succession planning challenges. The customer concentration risk, with 35% of revenue from the top client, requires analysis of contract terms, relationship stability, and contingency planning for potential churn. The business model's reliance on monthly subscriptions provides predictable revenue streams, but the enterprise vs. SMB mix affects both growth potential and churn patterns. Overall, I would recommend proceeding with the acquisition while implementing specific risk mitigation strategies around technical debt reduction and customer diversification.",
    video_path: "test-videos/detailed-response-003.mp4"
  },
  detailed: {
    email: "Dear Acquisition Team, Thank you for your thorough review of our business and for the detailed questions raised during due diligence. I want to address each of your concerns comprehensively and provide the transparency you need to move forward confidently. Regarding the Amazon TOS changes affecting our ceramic Dutch oven product line: We've been monitoring this development and have already begun implementing mitigation strategies. Our analysis shows that while this will impact approximately 30% of our revenue in the short term, we have alternative product lines ready for launch and have identified operational efficiencies that will offset much of the projected impact. I can provide you with our detailed financial projections and our 90-day action plan for addressing these changes. Concerning customer concentration: While our top 3 customers do represent a significant portion of our revenue, these are stable, long-term relationships with multi-year contracts. I can share the specific contract terms, renewal history, and our diversification strategy that has already begun showing results with 15% quarter-over-quarter growth in our SMB segment. I believe a detailed conversation would be valuable where we can review these materials together and address any additional questions. I'm committed to ensuring you have complete confidence in this acquisition and am happy to provide whatever additional information would be helpful. Please let me know your availability for a comprehensive review session. Sincerely,",
    essay: "The assessment of online business acquisitions requires a sophisticated understanding of multiple interconnected risk factors, financial metrics, and market dynamics. When evaluating a SaaS business, the analysis must begin with a deep dive into unit economics, particularly the relationship between customer acquisition cost (CAC) and lifetime value (LTV). A declining CAC trend with stable LTV is generally positive, indicating improving marketing efficiency or better product-market fit, but this must be contextualized within broader market conditions and competitive dynamics. Customer retention metrics provide crucial insights into product stickiness and market position. Net Revenue Retention (NRR) above 100% suggests that existing customers are expanding their usage, which is a strong indicator of product value and growth potential. However, this must be balanced against new customer acquisition rates and overall market expansion possibilities. Technical infrastructure evaluation is often overlooked but critical for long-term value preservation. Legacy technology stacks, while potentially stable, can create significant risks around developer availability, security updates, and scalability. The assessment should include not just current functionality but future development roadmaps and associated costs. Market position and competitive dynamics require analysis of the business's defensibility, including network effects, switching costs, and unique value propositions. A business with strong fundamentals but weak competitive moats may face margin compression over time. Risk concentration across multiple dimensions - customer concentration, geographic concentration, technology concentration, and key person dependence - must be carefully evaluated and mitigation strategies developed. The most successful acquisitions often involve businesses with diversified risk profiles or clear pathways to diversification. Finally, the human capital and cultural elements significantly impact acquisition success. The transferability of key relationships, institutional knowledge, and operational expertise often determines whether projected synergies can be realized.",
    video_path: "test-videos/comprehensive-response-004.mp4"
  },
  moderate: {
    email: "Hi, Thanks for the follow-up questions about the business. I understand your concerns about the customer concentration and the recent algorithm changes. I think we should set up a call to go through these issues together and I can share some additional data that should help address your concerns. Let me know when works best for you this week. Thanks,",
    essay: "The key considerations for this business acquisition include customer diversification, revenue stability, and operational transferability. The customer concentration presents some risk but this can be mitigated through the existing contract terms and expansion into new segments. The technical aspects look solid overall, though some modernization may be beneficial long-term.",
    video_path: "test-videos/moderate-response-005.mp4"
  }
}

// Sample Likert responses based on performance level
const LIKERT_RESPONSES = {
  high: [4, 5, 4, 5, 5, 4, 4, 5], // Strong performer responses
  medium: [3, 4, 3, 4, 3, 4, 3, 4], // Average performer responses  
  low: [2, 3, 2, 3, 2, 2, 3, 2] // Struggling performer responses
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
    .eq('id', 1) // Quiet Light Assessment
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

function shouldAnswerCorrectly(performanceLevel, questionIndex) {
  const baseAccuracy = {
    high: 0.88, // 88% accuracy
    medium: 0.75, // 75% accuracy
    low: 0.65 // 65% accuracy
  }[performanceLevel]
  
  // Add some randomness and slight fatigue effect (slightly lower accuracy in later questions)
  const fatigueFactor = 1 - (questionIndex * 0.001) // Very slight decline over time
  const randomFactor = 0.8 + (Math.random() * 0.4) // Random factor between 0.8-1.2
  
  const finalAccuracy = baseAccuracy * fatigueFactor * randomFactor
  return Math.random() < finalAccuracy
}

function getTextResponse(questionType, responseStyle, isCorrect) {
  const baseResponse = SAMPLE_RESPONSES[responseStyle]
  
  if (questionType === 'email_response') {
    return baseResponse.email
  } else if (questionType === 'essay') {
    return baseResponse.essay
  } else if (questionType.includes('video')) {
    return baseResponse.video_path
  }
  
  return "Sample response for testing purposes."
}

function getLikertResponse(performanceLevel, questionIndex) {
  const responses = LIKERT_RESPONSES[performanceLevel]
  return responses[questionIndex % responses.length]
}

async function createTestAttempt(user, assessment) {
  console.log(`\n👤 Creating attempt for ${user.name}...`)
  
  // Create the assessment attempt
  const attemptData = {
    assessment_id: assessment.id,
    user_id: `test_user_${user.email.replace('@test.com', '')}`,
    invitee_email: user.email,
    invitee_name: user.name,
    started_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
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

  // Collect all questions from all parts/blocks
  const allQuestions = []
  let partIndex = 0
  
  for (const part of assessment.parts) {
    for (const block of part.blocks) {
      for (const question of block.questions) {
        allQuestions.push({
          ...question,
          partIndex,
          partTitle: part.title
        })
      }
    }
    partIndex++
  }

  // Determine how many questions to answer based on completion pattern
  let questionsToAnswer = allQuestions.length
  if (user.completionPattern === 'partial') {
    questionsToAnswer = Math.floor(allQuestions.length * 0.6) // Answer 60% of questions
  } else if (user.completionPattern === 'abandoned') {
    questionsToAnswer = Math.floor(allQuestions.length * 0.25) // Answer 25% of questions
  }

  console.log(`📝 Answering ${questionsToAnswer} of ${allQuestions.length} questions`)

  const answers = []
  let totalPoints = 0
  let earnedPoints = 0
  let likertQuestionIndex = 0

  for (let i = 0; i < questionsToAnswer; i++) {
    const question = allQuestions[i]
    const questionPoints = question.points || 1
    totalPoints += questionPoints

    let answerData = {
      attempt_id: attempt.id,
      question_id: question.id,
      answered_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() // Answered within last 3 days
    }

    let isCorrect = false
    let pointsAwarded = 0

    // Handle different question types
    if (question.question_type === 'multiple_choice') {
      const correctOptionId = getCorrectAnswerForMCQ(question)
      const shouldBeCorrect = shouldAnswerCorrectly(user.performanceLevel, i)
      
      if (shouldBeCorrect && correctOptionId) {
        answerData.mcq_option_id = correctOptionId
        isCorrect = true
        pointsAwarded = questionPoints
      } else {
        // Pick a random incorrect option
        const incorrectOptions = question.mcq_options.filter(opt => !opt.is_correct)
        if (incorrectOptions.length > 0) {
          const randomIncorrect = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)]
          answerData.mcq_option_id = randomIncorrect.id
        }
        isCorrect = false
        pointsAwarded = 0
      }
    } else if (question.question_type === 'email_response' || question.question_type === 'essay') {
      const shouldBeCorrect = shouldAnswerCorrectly(user.performanceLevel, i)
      answerData.text_answer = getTextResponse(question.question_type, user.responseStyle, shouldBeCorrect)
      
      // For text responses, award partial points based on performance level
      if (shouldBeCorrect) {
        pointsAwarded = questionPoints
        isCorrect = true
      } else {
        pointsAwarded = questionPoints * 0.6 // Partial credit
        isCorrect = false
      }
    } else if (question.question_type.includes('video')) {
      const shouldBeCorrect = shouldAnswerCorrectly(user.performanceLevel, i)
      answerData.video_response_path = getTextResponse(question.question_type, user.responseStyle, shouldBeCorrect)
      
      // Video responses get manual grading simulation
      if (shouldBeCorrect) {
        pointsAwarded = questionPoints
        isCorrect = true
      } else {
        pointsAwarded = questionPoints * 0.7 // Partial credit for effort
        isCorrect = false
      }
    } else if (question.question_type === 'likert_scale') {
      answerData.likert_rating = getLikertResponse(user.performanceLevel, likertQuestionIndex)
      likertQuestionIndex++
      
      // Likert scales often don't have "correct" answers, award full points
      pointsAwarded = questionPoints
      isCorrect = null // Neither correct nor incorrect
    } else {
      // Default handling for other question types
      answerData.text_answer = `Sample response for ${question.question_type} question`
      pointsAwarded = questionPoints * 0.8
      isCorrect = null
    }

    answerData.points_awarded = pointsAwarded
    answerData.is_correct = isCorrect
    earnedPoints += pointsAwarded

    answers.push(answerData)

    // Add small random delay to simulate realistic answering pattern
    if (i % 10 === 0) {
      console.log(`  📝 Processed ${i + 1}/${questionsToAnswer} questions`)
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
  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
  const passed = percentage >= 70 // Assuming 70% passing grade

  const updateData = {
    score: Math.round(earnedPoints),
    percentage: Math.round(percentage * 100) / 100,
    passed: passed
  }

  // Set completion timestamp based on completion pattern
  if (user.completionPattern === 'complete') {
    updateData.completed_at = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() // Completed within last 24 hours
  }

  const { error: updateError } = await supabase
    .from('assessment_attempts')
    .update(updateData)
    .eq('id', attempt.id)

  if (updateError) {
    console.error('Error updating attempt:', updateError)
    throw updateError
  }

  console.log(`✅ ${user.name}: ${earnedPoints}/${totalPoints} points (${percentage.toFixed(1)}%) - ${passed ? 'PASSED' : 'FAILED'}`)
  
  return {
    attempt,
    answers: answers.length,
    score: earnedPoints,
    totalPoints,
    percentage: percentage.toFixed(1),
    passed
  }
}

async function main() {
  console.log('🚀 Creating test assessment attempts...\n')
  
  try {
    // Get the assessment structure
    const assessment = await getAssessmentStructure()
    console.log(`📋 Found assessment: "${assessment.title}" with ${assessment.parts.length} parts`)
    
    const totalQuestions = assessment.parts.reduce((total, part) => 
      total + part.blocks.reduce((blockTotal, block) => 
        blockTotal + block.questions.length, 0), 0)
    
    console.log(`📊 Total questions in assessment: ${totalQuestions}`)

    // Create attempts for each test user
    const results = []
    for (const user of TEST_USERS) {
      const result = await createTestAttempt(user, assessment)
      results.push({ user, ...result })
    }

    // Summary
    console.log('\n📈 Test Data Creation Summary:')
    console.log('=' .repeat(60))
    
    for (const result of results) {
      const status = result.attempt.completed_at ? '✅ Complete' : '⏸️  Partial'
      console.log(`${result.user.name.padEnd(20)} | ${status} | ${result.percentage}% | ${result.passed ? 'PASSED' : 'FAILED'}`)
    }

    console.log('\n🎉 Test assessment attempts created successfully!')
    console.log('\nYou can now:')
    console.log('- View completed assessments in your dashboard')
    console.log('- Test scoring and analytics features')
    console.log('- See different question type responses')
    console.log('- Analyze performance patterns')

  } catch (error) {
    console.error('❌ Error creating test data:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createTestAttempt, getAssessmentStructure } 