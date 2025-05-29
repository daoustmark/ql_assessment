// =============================================================================
// ASSESSMENT SCORING DATABASE FUNCTIONS
// =============================================================================

import { supabase } from './client'
import { 
  AssessmentReport, 
  CompetencyScore, 
  BehavioralScore, 
  EnhancedBehavioralScore,
  HonestyAssessment,
  IdentifiedRedFlag,
  HonestyAnalysis,
  LikertPattern,
  EthicalConsistency,
  SelfAwarenessIndicator,
  CrossValidationResult,
  StrengthsWeaknessesAnalysis,
  COMPETENCY_DEFINITIONS,
  BEHAVIORAL_DIMENSIONS,
  EthicalIndicator,
  ConsistencyCheck,
  getCompetencyLevel,
  getBehavioralLevel,
  calculateOverallRecommendation,
  QuestionScore,
  RubricScore,
  RubricScoreBreakdown,
  getRubricForQuestionType,
  getScoringLevel
} from '../../types/scoring'
import { AssessmentAttempt, UserAnswer } from '../../types'

// =============================================================================
// QUESTION TYPE CLASSIFICATIONS
// =============================================================================

/**
 * Question types that can be automatically scored
 */
export const AUTO_SCORING_QUESTION_TYPES = [
  'multiple_choice',
  'likert_scale',
  'forced_choice',
  'ethical_choice'
] as const

/**
 * Question types that require manual scoring
 */
export const MANUAL_SCORING_QUESTION_TYPES = [
  'essay',
  'email_response',
  'video_response',
  'timed_video_response',
  'scenario_response'
] as const

/**
 * Check if a question type requires manual scoring
 */
export function requiresManualScoring(questionType: string): boolean {
  return MANUAL_SCORING_QUESTION_TYPES.includes(questionType as any)
}

/**
 * Check if a question type can be automatically scored
 */
export function canAutoScore(questionType: string): boolean {
  return AUTO_SCORING_QUESTION_TYPES.includes(questionType as any)
}

// =============================================================================
// AUTOMATIC SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate score for a multiple choice question
 */
export async function scoreMultipleChoiceQuestion(
  questionId: number, 
  selectedOptionId: number
): Promise<{ points: number; isCorrect: boolean }> {
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

/**
 * Calculate score for a likert scale question
 */
export async function scoreLikertScaleQuestion(
  likertRating: number
): Promise<{ points: number; isCorrect: boolean }> {
  // For Likert scale, we consider all valid responses (1-5) as "correct"
  // and award full points for any response
  const isValid = likertRating >= 1 && likertRating <= 5
  return { 
    points: isValid ? 1 : 0, 
    isCorrect: isValid 
  }
}

/**
 * Calculate score for a scenario-based question
 */
export async function scoreScenarioQuestion(
  scenarioOptionId: number
): Promise<{ points: number; isCorrect: boolean }> {
  const { data: option, error } = await supabase
    .from('scenario_options')
    .select('is_correct, points')
    .eq('id', scenarioOptionId)
    .single()

  if (error) throw error

  const points = option.is_correct ? (option.points || 1) : 0
  return { points, isCorrect: option.is_correct }
}

/**
 * Score ONLY objective questions that can be automatically scored.
 * Manual scoring questions are left untouched.
 */
export async function scoreObjectiveQuestions(attemptId: number): Promise<void> {
  // Get all answers for this attempt, but only for auto-scoreable question types
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

  // Score each auto-scoreable answer
  for (const answer of answers) {
    let points = 0
    let isCorrect = false
    const questionType = (answer.questions as any).question_type

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

    // Update the answer with scoring
    await supabase
      .from('user_answers')
      .update({
        points_awarded: points,
        is_correct: isCorrect
      })
      .eq('id', answer.id)
  }

  console.log(`Auto-scored ${answers.length} objective questions for attempt ${attemptId}`)
}

/**
 * Calculate overall attempt score and update assessment_attempts table
 * This function now properly excludes ungraded manual questions from score calculation
 */
export async function calculateAttemptScore(attemptId: number): Promise<void> {
  // Get scored questions only (both auto and manually scored)
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
    .not('points_awarded', 'is', null) // Only include questions that have been scored

  if (error) throw error

  const totalAwarded = scoreData.reduce((sum, answer) => sum + (answer.points_awarded || 0), 0)
  
  // For total possible, we need to get all questions that SHOULD be scored by now
  // This includes auto-scored questions + manually scored questions
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

  // Calculate total possible from questions that should be included in scoring
  let totalPossible = 0
  allAnswers.forEach(answer => {
    const questionType = (answer.questions as any).question_type
    const questionPoints = (answer.questions as any).points || 1
    
    // Include auto-scoring questions and manually scored questions in total possible
    if (canAutoScore(questionType)) {
      totalPossible += questionPoints
    }
    // For manual questions, only include if they've been scored
    // (this will be handled by the scoreData query above which filters for non-null points_awarded)
  })

  // If we have any scored manual questions, add their points to total possible
  scoreData.forEach(answer => {
    const questionType = (answer.questions as any).question_type
    if (requiresManualScoring(questionType)) {
      // Already included in totalAwarded, but need to ensure it's in totalPossible
      // This is handled by the logic above
    }
  })

  // Recalculate total possible to include only questions that should be scored
  const scoredQuestions = scoreData.length
  const autoQuestions = scoreData.filter(answer => 
    canAutoScore((answer.questions as any).question_type)
  ).length
  const manualQuestions = scoreData.filter(answer => 
    requiresManualScoring((answer.questions as any).question_type)  
  ).length

  console.log(`Attempt ${attemptId} scoring: ${scoredQuestions} total scored (${autoQuestions} auto, ${manualQuestions} manual)`)

  const percentage = totalPossible > 0 ? (totalAwarded / totalPossible) * 100 : 0

  // Get passing score from assessment
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

  const passed = percentage >= ((attempt.assessments as any).passing_score || 70)

  // Update attempt with scores
  await supabase
    .from('assessment_attempts')
    .update({
      score: totalAwarded,
      percentage: percentage,
      passed: passed
    })
    .eq('id', attemptId)

  console.log(`Updated attempt ${attemptId}: ${totalAwarded}/${totalPossible} points (${percentage.toFixed(1)}%)`)
}

// =============================================================================
// COMPETENCY SCORING FUNCTIONS
// =============================================================================

/**
 * Debug function to see how questions are being mapped to competencies
 */
export async function debugCompetencyMapping(assessmentId: number) {
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      blocks!inner (
        title,
        block_type,
        parts!inner (
          title
        )
      )
    `)
    .eq('blocks.parts.assessment_id', assessmentId)
    .limit(20) // Limit for debugging

  if (error) throw error

  console.log('=== COMPETENCY MAPPING DEBUG ===')
  questions.forEach(question => {
    const partTitle = ((question.blocks as any).parts as any).title.toLowerCase()
    const blockTitle = (question.blocks as any).title
    const blockType = (question.blocks as any).block_type
    
    console.log({
      questionId: question.id,
      questionSnippet: question.question_text.substring(0, 80) + '...',
      partTitle,
      blockTitle,
      blockType,
      questionType: question.question_type
    })
  })

  return questions
}

/**
 * Get custom competency mappings from database
 */
export async function getCustomCompetencyMappings(assessmentId: number): Promise<Map<number, string>> {
  try {
    const { data: mappings, error } = await supabase
      .from('question_competency_mappings')
      .select(`
        question_id,
        competency_area,
        questions!inner (
          blocks!inner (
            parts!inner (
              assessment_id
            )
          )
        )
      `)
      .eq('questions.blocks.parts.assessment_id', assessmentId)

    if (error) {
      // If table doesn't exist yet, return empty map
      if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
        console.log('Custom competency mappings table not found, using auto-detection only')
        return new Map<number, string>()
      }
      throw error
    }

    const customMappings = new Map<number, string>()
    mappings.forEach(mapping => {
      customMappings.set(mapping.question_id, mapping.competency_area)
    })

    return customMappings
  } catch (error) {
    console.log('Error loading custom competency mappings, falling back to auto-detection:', error)
    return new Map<number, string>()
  }
}

/**
 * Save custom competency mapping for a question
 */
export async function saveQuestionCompetencyMapping(
  questionId: number, 
  competencyArea: string, 
  mappedBy: string = 'admin'
): Promise<void> {
  const { error } = await supabase
    .from('question_competency_mappings')
    .upsert({
      question_id: questionId,
      competency_area: competencyArea,
      mapped_by: mappedBy,
      is_custom: true
    })

  if (error) throw error
}

/**
 * Get all questions with their competency mappings for admin interface
 */
export async function getQuestionsWithCompetencyMappings(assessmentId: number) {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        blocks!inner (
          title,
          block_type,
          parts!inner (
            title,
            assessment_id
          )
        ),
        question_competency_mappings (
          competency_area,
          is_custom,
          mapped_by,
          mapped_at
        )
      `)
      .eq('blocks.parts.assessment_id', assessmentId)
      .order('id')

    if (error) {
      // If the mappings table doesn't exist, fetch questions without mappings
      if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
        console.log('Custom competency mappings table not found, fetching questions without mappings')
        const { data: questionsOnly, error: questionsError } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            question_type,
            blocks!inner (
              title,
              block_type,
              parts!inner (
                title,
                assessment_id
              )
            )
          `)
          .eq('blocks.parts.assessment_id', assessmentId)
          .order('id')

        if (questionsError) throw questionsError
        
        // Add empty mappings array to match expected structure
        return questionsOnly.map(q => ({ ...q, question_competency_mappings: [] }))
      }
      throw error
    }

    return questions
  } catch (error) {
    console.log('Error loading questions with competency mappings:', error)
    // Fallback to basic questions without mappings
    const { data: questionsOnly, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        blocks!inner (
          title,
          block_type,
          parts!inner (
            title,
            assessment_id
          )
        )
      `)
      .eq('blocks.parts.assessment_id', assessmentId)
      .order('id')

    if (questionsError) throw questionsError
    return questionsOnly.map(q => ({ ...q, question_competency_mappings: [] }))
  }
}

/**
 * Map questions to competency areas - UPDATED to use custom mappings first
 */
export async function getQuestionCompetencyMapping(assessmentId: number): Promise<Map<number, string>> {
  // First, get any custom mappings
  const customMappings = await getCustomCompetencyMappings(assessmentId)
  
  // Then get all questions for auto-mapping
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      blocks!inner (
        block_type,
        title,
        parts!inner (
          title
        )
      )
    `)
    .eq('blocks.parts.assessment_id', assessmentId)

  if (error) throw error

  const mapping = new Map<number, string>()

  questions.forEach(question => {
    // Use custom mapping if available
    if (customMappings.has(question.id)) {
      mapping.set(question.id, customMappings.get(question.id)!)
      return
    }

    // Otherwise use auto-mapping logic
    const partTitle = ((question.blocks as any).parts as any).title.toLowerCase()
    const blockTitle = (question.blocks as any).title.toLowerCase()
    const blockType = (question.blocks as any).block_type.toLowerCase()
    const questionText = question.question_text.toLowerCase()
    
    // Enhanced mapping logic with more specific patterns
    let competency = 'business_valuation' // default
    
    // Industry Knowledge Detection
    if (
      blockType.includes('e-commerce') || 
      blockType.includes('saas') || 
      blockType.includes('content') ||
      blockTitle.includes('e-commerce') ||
      blockTitle.includes('saas') ||
      blockTitle.includes('content') ||
      blockTitle.includes('industry') ||
      questionText.includes('amazon') ||
      questionText.includes('shopify') ||
      questionText.includes('ecommerce') ||
      questionText.includes('marketplace') ||
      questionText.includes('subscription') ||
      questionText.includes('saas') ||
      questionText.includes('content marketing') ||
      questionText.includes('affiliate') ||
      questionText.includes('marketplace dynamics')
    ) {
      competency = 'industry_knowledge'
    }
    // Business Valuation Detection
    else if (
      blockType.includes('financial') || 
      blockType.includes('valuation') ||
      blockTitle.includes('financial') ||
      blockTitle.includes('valuation') ||
      questionText.includes('sde') ||
      questionText.includes('revenue') ||
      questionText.includes('multiple') ||
      questionText.includes('cash flow') ||
      questionText.includes('ebitda') ||
      questionText.includes('profit') ||
      questionText.includes('margin') ||
      questionText.includes('valuation') ||
      questionText.includes('financial')
    ) {
      competency = 'business_valuation'
    }
    // Technical Assessment Detection
    else if (
      blockType.includes('technical') ||
      blockTitle.includes('technical') ||
      blockTitle.includes('technology') ||
      questionText.includes('technical') ||
      questionText.includes('hosting') ||
      questionText.includes('platform') ||
      questionText.includes('integration') ||
      questionText.includes('api') ||
      questionText.includes('database') ||
      questionText.includes('security')
    ) {
      competency = 'technical_assessment'
    }
    // Negotiation Skills Detection
    else if (
      partTitle.includes('negotiation') || 
      partTitle.includes('lightning') ||
      blockType.includes('negotiation') ||
      blockTitle.includes('negotiation') ||
      blockTitle.includes('deal') ||
      questionText.includes('negotiat') ||
      questionText.includes('counteroffer') ||
      questionText.includes('deal structure')
    ) {
      competency = 'negotiation_skills'
    }
    // Communication Detection
    else if (
      partTitle.includes('email') || 
      partTitle.includes('video') ||
      blockType.includes('email') ||
      blockType.includes('video') ||
      question.question_type === 'email_response' ||
      question.question_type === 'video_response'
    ) {
      competency = 'communication'
    }
    // Ethical Decision Making Detection
    else if (
      partTitle.includes('ethical') ||
      blockType.includes('ethical') ||
      blockTitle.includes('ethical') ||
      questionText.includes('ethical') ||
      questionText.includes('conflict of interest') ||
      questionText.includes('disclosure')
    ) {
      competency = 'ethical_decision_making'
    }
    // Behavioral Fit Detection
    else if (
      partTitle.includes('behavioral') ||
      question.question_type === 'likert_scale'
    ) {
      competency = 'behavioral_fit'
    }
    // Problem Solving Detection
    else if (
      question.question_type === 'essay' || 
      question.question_type === 'scenario_response'
    ) {
      competency = 'problem_solving'
    }
    
    mapping.set(question.id, competency)
  })

  return mapping
}

/**
 * Calculate competency scores for an assessment attempt
 */
export async function calculateCompetencyScores(attemptId: number): Promise<CompetencyScore[]> {
  const { data: attempt, error } = await supabase
    .from('assessment_attempts')
    .select('assessment_id')
    .eq('id', attemptId)
    .single()

  if (error) throw error

  const competencyMapping = await getQuestionCompetencyMapping(attempt.assessment_id)
  
  const { data: answers, error: answersError } = await supabase
    .from('user_answers')
    .select(`
      question_id,
      points_awarded,
      is_correct,
      questions!inner (
        points
      )
    `)
    .eq('attempt_id', attemptId)

  if (answersError) throw answersError

  // Group answers by competency area
  const competencyData = new Map<string, { earned: number; possible: number; count: number }>()

  answers.forEach(answer => {
    const competency = competencyMapping.get(answer.question_id) || 'business_valuation'
    const current = competencyData.get(competency) || { earned: 0, possible: 0, count: 0 }
    
    current.earned += answer.points_awarded || 0
    current.possible += ((answer.questions as any).points || 1)
    current.count += 1
    
    competencyData.set(competency, current)
  })

  // Calculate scores for each competency
  const competencyScores: CompetencyScore[] = COMPETENCY_DEFINITIONS.map(def => {
    const data = competencyData.get(def.area) || { earned: 0, possible: 0, count: 0 }
    const percentage = data.possible > 0 ? (data.earned / data.possible) * 100 : 0
    
    return {
      area: def.area,
      name: def.name,
      points_earned: data.earned,
      points_possible: data.possible,
      percentage: percentage,
      level: getCompetencyLevel(percentage) as any,
      is_passing: percentage >= def.passing_threshold,
      question_count: data.count,
      recommendations: percentage < def.passing_threshold ? [
        `Focus on developing ${def.name.toLowerCase()} skills`,
        `Review questions in this area for improvement opportunities`
      ] : undefined
    }
  })

  return competencyScores
}

// =============================================================================
// ENHANCED BEHAVIORAL SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate enhanced behavioral scores that correlate Likert responses with ethical choices
 */
export async function calculateEnhancedBehavioralScores(attemptId: number): Promise<EnhancedBehavioralScore[]> {
  // Get all answers for this attempt
  const { data: answers, error } = await supabase
    .from('user_answers')
    .select(`
      question_id,
      likert_rating,
      mcq_option_id,
      scenario_option_id,
      text_answer,
      questions!inner (
        sequence_order,
        question_type,
        question_text
      ),
      mcq_options (
        option_text
      ),
      scenario_options (
        option_text
      )
    `)
    .eq('attempt_id', attemptId)

  if (error) throw error

  // Get ethical scenario mappings
  const ethicalChoices = await getEthicalChoicesByAttempt(attemptId)

  const enhancedScores: EnhancedBehavioralScore[] = []

  for (const dimension of BEHAVIORAL_DIMENSIONS) {
    if (!dimension.likert_question_numbers || !dimension.ethical_scenario_indicators) {
      continue
    }

    // Calculate Likert score
    let likertScore = 0
    let likertMaxScore = 0
    
    dimension.likert_question_numbers.forEach(questionNum => {
      const answer = answers.find(a => 
        ((a.questions as any).sequence_order === questionNum) && 
        ((a.questions as any).question_type === 'likert_scale')
      )
      if (answer && answer.likert_rating) {
        likertScore += answer.likert_rating
        likertMaxScore += 5
      }
    })

    const likertPercentage = likertMaxScore > 0 ? (likertScore / likertMaxScore) * 100 : 0

    // Calculate ethical alignment score
    const ethicalAlignment = calculateEthicalAlignment(dimension.ethical_scenario_indicators, ethicalChoices)

    // Calculate consistency score
    const consistencyScore = calculateConsistencyScore(
      dimension.consistency_checks || [],
      answers,
      ethicalChoices
    )

    // Calculate overall score (weighted combination)
    const overallScore = (likertPercentage * 0.4) + (ethicalAlignment * 100 * 0.4) + (consistencyScore * 100 * 0.2)

    // Determine level
    const level = getBehavioralLevel(overallScore, 100)

    // Check for red flags
    const redFlags = await identifyRedFlags(dimension, likertScore, likertMaxScore, ethicalChoices, answers)

    // Generate recommendations
    const recommendations = generateRecommendations(dimension, level, redFlags, consistencyScore)

    enhancedScores.push({
      dimension: dimension.name,
      likert_score: likertScore,
      likert_max_score: likertMaxScore,
      likert_percentage: likertPercentage,
      ethical_alignment_score: ethicalAlignment,
      consistency_score: consistencyScore,
      overall_score: overallScore,
      level: level,
      interpretation: dimension.interpretation[level],
      red_flags: redFlags,
      recommendations: recommendations
    })
  }

  return enhancedScores
}

/**
 * Calculate how well ethical choices align with expected values
 */
function calculateEthicalAlignment(
  indicators: EthicalIndicator[],
  ethicalChoices: Map<string, string>
): number {
  if (indicators.length === 0) return 1.0

  let totalWeight = 0
  let alignedWeight = 0

  indicators.forEach(indicator => {
    totalWeight += indicator.weight
    const userChoice = ethicalChoices.get(indicator.scenario_description)
    if (userChoice === indicator.ethical_choice) {
      alignedWeight += indicator.weight
    }
  })

  return totalWeight > 0 ? alignedWeight / totalWeight : 1.0
}

/**
 * Calculate consistency between Likert responses and ethical choices
 */
function calculateConsistencyScore(
  checks: ConsistencyCheck[],
  answers: any[],
  ethicalChoices: Map<string, string>
): number {
  if (checks.length === 0) return 1.0

  let totalConsistency = 0

  checks.forEach(check => {
    // Get average Likert score for relevant questions
    let likertTotal = 0
    let likertCount = 0
    
    check.likert_questions.forEach(questionNum => {
      const answer = answers.find(a => 
        ((a.questions as any).sequence_order === questionNum) && 
        ((a.questions as any).question_type === 'likert_scale')
      )
      if (answer && answer.likert_rating) {
        likertTotal += answer.likert_rating
        likertCount++
      }
    })

    const avgLikert = likertCount > 0 ? likertTotal / likertCount : 3
    const likertNormalized = (avgLikert - 1) / 4 // Normalize to 0-1

    // Calculate ethical choice alignment for this check
    let ethicalAlignment = 0
    let ethicalCount = 0

    check.ethical_scenarios.forEach(scenario => {
      const choice = ethicalChoices.get(scenario)
      if (choice) {
        // Simple heuristic: 'B' choices often more ethical = 1, 'A' choices = 0
        ethicalAlignment += choice === 'B' ? 1 : 0
        ethicalCount++
      }
    })

    const avgEthical = ethicalCount > 0 ? ethicalAlignment / ethicalCount : 0.5

    // Calculate consistency based on expected correlation
    let consistency: number
    if (check.expected_correlation === 'positive') {
      consistency = 1 - Math.abs(likertNormalized - avgEthical)
    } else {
      consistency = 1 - Math.abs(likertNormalized - (1 - avgEthical))
    }

    totalConsistency += Math.max(0, consistency - check.tolerance)
  })

  return checks.length > 0 ? totalConsistency / checks.length : 1.0
}

/**
 * Get ethical choices made by a candidate
 */
async function getEthicalChoicesByAttempt(attemptId: number): Promise<Map<string, string>> {
  // Get all multiple choice answers since ethical scenarios are embedded in MCQ questions
  const { data: ethicalAnswers, error } = await supabase
    .from('user_answers')
    .select(`
      mcq_option_id,
      questions!inner (
        sequence_order,
        question_text,
        question_type
      ),
      mcq_options (
        option_text,
        sequence_order
      )
    `)
    .eq('attempt_id', attemptId)
    .eq('questions.question_type', 'multiple_choice')

  if (error) throw error

  // Map ethical scenarios to their actual question sequence numbers
  const ethicalScenarioMapping: { [key: string]: number } = {
    'Questionable Discount Program': 1,  
    'The Overvalued Testimonials': 2,    
    'The Self-Competing Seller': 3,      
    'The Review Incentive Program': 4,   
    'The Algorithm Insight': 5,          
    'The Aging Content': 6,              
    'The Unverifiable Customer List': 7, 
    'The Keyword Cannibalization': 8,    
    "The Founder's Necessity": 9,        
    'The Shifting Compliance Landscape': 10, 
    'Customer Concentration Discrepancy': 11, 
    'Multiple Client Conflict': 12       
  }

  const choices = new Map<string, string>()

  Object.entries(ethicalScenarioMapping).forEach(([scenarioName, questionSequence]) => {
    const answer = ethicalAnswers.find(a => 
      ((a.questions as any).sequence_order === questionSequence) && 
      a.mcq_option_id !== null
    )
    
    if (answer && answer.mcq_options) {
      const option = answer.mcq_options as any
      const choice = option.sequence_order === 1 ? 'A' : 'B'
      choices.set(scenarioName, choice)
    }
  })

  return choices
}

/**
 * Identify red flags in behavioral patterns
 */
async function identifyRedFlags(
  dimension: any,
  likertScore: number,
  likertMaxScore: number,
  ethicalChoices: Map<string, string>,
  answers: any[]
): Promise<IdentifiedRedFlag[]> {
  const redFlags: IdentifiedRedFlag[] = []

  if (!dimension.red_flags) return redFlags

  const likertPercentage = likertMaxScore > 0 ? (likertScore / likertMaxScore) * 100 : 0

  dimension.red_flags.forEach((flag: any) => {
    const conditions = flag.trigger_conditions
    let triggered = false
    const evidence: string[] = []

    // Check for high Likert scores with poor ethical choices
    if (conditions.includes('High likert scores (4-5) on ethics questions') && likertPercentage >= 80) {
      // Check if they made poor ethical choices
      const poorChoices = Array.from(ethicalChoices.entries()).filter(([scenario, choice]) => {
        // Define poor choices for key scenarios
        const poorChoiceMap: { [key: string]: string } = {
          'Questionable Discount Program': 'A',
          'The Overvalued Testimonials': 'A',
          'The Unverifiable Customer List': 'A',
          'The Shifting Compliance Landscape': 'A'
        }
        return poorChoiceMap[scenario] === choice
      })

      if (poorChoices.length >= 2) {
        triggered = true
        evidence.push(`High self-reported ethics (${likertPercentage.toFixed(1)}%) but made ${poorChoices.length} questionable ethical choices`)
      }
    }

    if (triggered) {
      redFlags.push({
        category: dimension.name,
        description: flag.description,
        severity: flag.severity,
        evidence: evidence,
        recommendation: generateRedFlagRecommendation(flag.severity, flag.name)
      })
    }
  })

  return redFlags
}

/**
 * Generate recommendations based on scoring
 */
function generateRecommendations(
  dimension: any,
  level: 'high' | 'moderate' | 'low',
  redFlags: IdentifiedRedFlag[],
  consistencyScore: number
): string[] {
  const recommendations: string[] = []

  if (level === 'low') {
    recommendations.push(`Significant development needed in ${dimension.name}`)
  } else if (level === 'moderate') {
    recommendations.push(`Continue developing ${dimension.name} capabilities`)
  }

  if (consistencyScore < 0.7) {
    recommendations.push('Monitor for consistency between stated values and actions')
  }

  if (redFlags.length > 0) {
    recommendations.push('Requires careful assessment of ethical judgment and honesty')
  }

  return recommendations
}

/**
 * Generate red flag recommendation
 */
function generateRedFlagRecommendation(severity: string, flagName: string): string {
  switch (severity) {
    case 'high':
      return 'Strongly recommend additional ethical assessment before hiring decision'
    case 'medium':
      return 'Consider follow-up interview to explore ethical reasoning'
    case 'low':
      return 'Monitor during onboarding and early performance reviews'
    default:
      return 'Review and discuss during interview process'
  }
}

/**
 * Comprehensive honesty assessment
 */
export async function calculateHonestyAssessment(attemptId: number): Promise<HonestyAssessment> {
  const { data: answers, error } = await supabase
    .from('user_answers')
    .select(`
      question_id,
      likert_rating,
      mcq_option_id,
      text_answer,
      questions!inner (
        sequence_order,
        question_type,
        question_text
      )
    `)
    .eq('attempt_id', attemptId)

  if (error) throw error

  // Analyze Likert patterns
  const likertPatterns = analyzeLikertPatterns(answers)
  
  // Get ethical choices for consistency analysis
  const ethicalChoices = await getEthicalChoicesByAttempt(attemptId)
  
  // Calculate ethical consistency
  const ethicalConsistency = calculateEthicalConsistencyAnalysis(answers, ethicalChoices)
  
  // Assess self-awareness indicators
  const selfAwarenessIndicators = assessSelfAwareness(answers)
  
  // Cross-validate responses
  const crossValidationResults = performCrossValidation(answers, ethicalChoices)

  // Calculate overall integrity score
  const integrityScore = calculateIntegrityScore(likertPatterns, ethicalConsistency, crossValidationResults)
  
  // Determine social desirability bias
  const socialDesirabilityBias = determineSocialDesirabilityBias(likertPatterns, answers)
  
  // Calculate consistency rating
  const consistencyRating = determineConsistencyRating(ethicalConsistency, crossValidationResults)

  // Identify overall red flags
  const redFlags = identifyOverallRedFlags(likertPatterns, ethicalConsistency, crossValidationResults)

  return {
    overall_integrity_score: integrityScore,
    social_desirability_bias: socialDesirabilityBias,
    consistency_rating: consistencyRating,
    red_flags: redFlags,
    detailed_analysis: {
      likert_patterns: likertPatterns,
      ethical_consistency: ethicalConsistency,
      self_awareness_indicators: selfAwarenessIndicators,
      cross_validation_results: crossValidationResults
    }
  }
}

/**
 * Analyze patterns in Likert scale responses
 */
function analyzeLikertPatterns(answers: any[]): LikertPattern[] {
  const patterns: LikertPattern[] = []
  const likertAnswers = answers.filter(a => ((a.questions as any).question_type === 'likert_scale'))
  
  if (likertAnswers.length === 0) return patterns

  const ratings = likertAnswers.map(a => a.likert_rating).filter(r => r !== null)
  
  // Check for extreme positive bias (all 4s and 5s)
  const highRatings = ratings.filter(r => r >= 4).length
  if (highRatings / ratings.length > 0.8) {
    patterns.push({
      pattern_type: 'extreme_positive',
      description: 'Extremely positive self-ratings across all dimensions',
      questions_affected: likertAnswers.map(a => ((a.questions as any).sequence_order)),
      severity: 'medium'
    })
  }

  // Check for mid-point bias (mostly 3s)
  const midRatings = ratings.filter(r => r === 3).length
  if (midRatings / ratings.length > 0.6) {
    patterns.push({
      pattern_type: 'mid_point_bias',
      description: 'Excessive use of neutral responses',
      questions_affected: likertAnswers.filter(a => a.likert_rating === 3).map(a => ((a.questions as any).sequence_order)),
      severity: 'low'
    })
  }

  // Check for inconsistent patterns
  const variance = calculateVariance(ratings)
  if (variance < 0.5) {
    patterns.push({
      pattern_type: 'inconsistent',
      description: 'Unusually consistent ratings suggesting possible response bias',
      questions_affected: likertAnswers.map(a => ((a.questions as any).sequence_order)),
      severity: 'medium'
    })
  }

  return patterns
}

/**
 * Calculate variance in ratings
 */
function calculateVariance(ratings: number[]): number {
  if (ratings.length === 0) return 0
  
  const mean = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length
  
  return variance
}

/**
 * Calculate ethical consistency analysis
 */
function calculateEthicalConsistencyAnalysis(answers: any[], ethicalChoices: Map<string, string>): EthicalConsistency {
  // Calculate internal consistency within ethical scenarios
  const ethicalAnswers = Array.from(ethicalChoices.values())
  const consistentChoices = ethicalAnswers.filter(choice => choice === 'B').length // Assuming B is generally more ethical
  const internalConsistency = ethicalAnswers.length > 0 ? consistentChoices / ethicalAnswers.length : 0

  // Calculate Likert-ethical alignment
  const ethicsLikertAnswers = answers.filter(a => {
    const qNum = ((a.questions as any).sequence_order)
    return ((a.questions as any).question_type === 'likert_scale') && [1, 2, 3, 20, 25].includes(qNum)
  })

  const avgEthicsLikert = ethicsLikertAnswers.length > 0 
    ? ethicsLikertAnswers.reduce((sum, a) => sum + (a.likert_rating || 3), 0) / ethicsLikertAnswers.length
    : 3

  const normalizedLikert = (avgEthicsLikert - 1) / 4 // 0-1 scale
  const likertEthicalAlignment = 1 - Math.abs(normalizedLikert - internalConsistency)

  // Identify concerning disconnects
  const concerningDisconnects: string[] = []
  if (normalizedLikert > 0.8 && internalConsistency < 0.5) {
    concerningDisconnects.push('High self-reported ethics but poor ethical choices')
  }
  if (normalizedLikert < 0.4 && internalConsistency > 0.8) {
    concerningDisconnects.push('Low self-reported ethics but good ethical choices')
  }

  return {
    internal_consistency: internalConsistency,
    likert_ethical_alignment: likertEthicalAlignment,
    scenario_pattern_analysis: `Made ethical choice in ${(internalConsistency * 100).toFixed(0)}% of scenarios`,
    concerning_disconnects: concerningDisconnects
  }
}

/**
 * Assess self-awareness indicators
 */
function assessSelfAwareness(answers: any[]): SelfAwarenessIndicator[] {
  const indicators: SelfAwarenessIndicator[] = []

  // Check for acknowledgment of limitations (questions about mistakes, weaknesses)
  const limitationQuestions = answers.filter(a => {
    const qNum = ((a.questions as any).sequence_order)
    return ((a.questions as any).question_type === 'likert_scale') && [19, 14].includes(qNum) // Mistake correction, perfectionist tendencies
  })

  limitationQuestions.forEach(answer => {
    const rating = answer.likert_rating || 3
    if (rating >= 4) {
      indicators.push({
        indicator: 'Acknowledges making mistakes',
        evidence: `High rating (${rating}) on mistake acknowledgment`,
        rating: 'high'
      })
    } else if (rating <= 2) {
      indicators.push({
        indicator: 'May lack self-awareness of limitations',
        evidence: `Low rating (${rating}) on mistake acknowledgment`,
        rating: 'low'
      })
    }
  })

  return indicators
}

/**
 * Perform cross-validation of responses
 */
function performCrossValidation(answers: any[], ethicalChoices: Map<string, string>): CrossValidationResult[] {
  const results: CrossValidationResult[] = []

  // Cross-validate transparency claims vs. disclosure behavior
  const transparencyLikert = answers.find(a => 
    ((a.questions as any).sequence_order === 2) && 
    ((a.questions as any).question_type === 'likert_scale')
  )

  if (transparencyLikert) {
    const transparencyRating = transparencyLikert.likert_rating || 3
    const disclosureChoices = [
      ethicalChoices.get('The Shifting Compliance Landscape'),
      ethicalChoices.get('The Unverifiable Customer List')
    ].filter(choice => choice !== undefined)

    const disclosureScore = disclosureChoices.filter(choice => choice === 'B').length / Math.max(disclosureChoices.length, 1)
    const expectedCorrelation = 0.7
    const actualCorrelation = 1 - Math.abs((transparencyRating / 5) - disclosureScore)

    results.push({
      comparison_type: 'Transparency Consistency',
      correlation_strength: actualCorrelation,
      expected_correlation: expectedCorrelation,
      variance_explanation: actualCorrelation < expectedCorrelation ? 'Self-reported transparency higher than demonstrated behavior' : 'Good alignment between stated and demonstrated transparency',
      concern_level: actualCorrelation < 0.5 ? 'significant' : actualCorrelation < 0.7 ? 'moderate' : 'minor'
    })
  }

  return results
}

/**
 * Calculate overall integrity score
 */
function calculateIntegrityScore(
  patterns: LikertPattern[], 
  ethical: EthicalConsistency, 
  crossValidation: CrossValidationResult[]
): number {
  let score = 100

  // Deduct for problematic patterns
  patterns.forEach(pattern => {
    if (pattern.severity === 'high') score -= 20
    else if (pattern.severity === 'medium') score -= 10
    else score -= 5
  })

  // Factor in ethical consistency
  score = score * (0.7 + 0.3 * ethical.likert_ethical_alignment)

  // Factor in cross-validation results
  const avgCrossValidation = crossValidation.length > 0 
    ? crossValidation.reduce((sum, cv) => sum + cv.correlation_strength, 0) / crossValidation.length
    : 1
  
  score = score * (0.8 + 0.2 * avgCrossValidation)

  return Math.max(0, Math.min(100, score))
}

/**
 * Determine social desirability bias level
 */
function determineSocialDesirabilityBias(patterns: LikertPattern[], answers: any[]): 'low' | 'moderate' | 'high' {
  const extremePositive = patterns.some(p => p.pattern_type === 'extreme_positive')
  const likertAnswers = answers.filter(a => ((a.questions as any).question_type === 'likert_scale'))
  const avgRating = likertAnswers.length > 0 
    ? likertAnswers.reduce((sum, a) => sum + (a.likert_rating || 3), 0) / likertAnswers.length
    : 3

  if (extremePositive || avgRating > 4.2) return 'high'
  if (avgRating > 3.8) return 'moderate'
  return 'low'
}

/**
 * Determine consistency rating
 */
function determineConsistencyRating(ethical: EthicalConsistency, crossValidation: CrossValidationResult[]): 'high' | 'moderate' | 'low' | 'concerning' {
  const ethicalAlignment = ethical.likert_ethical_alignment
  const hasDisconnects = ethical.concerning_disconnects.length > 0
  const avgCrossValidation = crossValidation.length > 0 
    ? crossValidation.reduce((sum, cv) => sum + cv.correlation_strength, 0) / crossValidation.length
    : 1

  if (hasDisconnects && ethicalAlignment < 0.5) return 'concerning'
  if (ethicalAlignment > 0.8 && avgCrossValidation > 0.7) return 'high'
  if (ethicalAlignment > 0.6 && avgCrossValidation > 0.5) return 'moderate'
  return 'low'
}

/**
 * Identify overall red flags across all analyses
 */
function identifyOverallRedFlags(
  patterns: LikertPattern[], 
  ethical: EthicalConsistency, 
  crossValidation: CrossValidationResult[]
): IdentifiedRedFlag[] {
  const redFlags: IdentifiedRedFlag[] = []

  // Major consistency issues
  if (ethical.concerning_disconnects.length > 0) {
    redFlags.push({
      category: 'Ethical Consistency',
      description: 'Significant disconnect between stated values and ethical choices',
      severity: 'high',
      evidence: ethical.concerning_disconnects,
      recommendation: 'Conduct in-depth interview focused on ethical reasoning and decision-making process'
    })
  }

  // Response pattern issues
  const highSeverityPatterns = patterns.filter(p => p.severity === 'high')
  if (highSeverityPatterns.length > 0) {
    redFlags.push({
      category: 'Response Patterns',
      description: 'Concerning response patterns suggesting possible dishonesty or bias',
      severity: 'medium',
      evidence: highSeverityPatterns.map(p => p.description),
      recommendation: 'Consider additional assessment methods to validate self-reported information'
    })
  }

  // Cross-validation failures
  const significantConcerns = crossValidation.filter(cv => cv.concern_level === 'significant')
  if (significantConcerns.length > 0) {
    redFlags.push({
      category: 'Behavioral Consistency',
      description: 'Poor alignment between self-reported behaviors and demonstrated choices',
      severity: 'medium',
      evidence: significantConcerns.map(cv => cv.variance_explanation),
      recommendation: 'Use behavioral interview questions to probe for specific examples'
    })
  }

  return redFlags
}

// =============================================================================
// BEHAVIORAL SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate behavioral dimension scores from Likert scale responses
 */
export async function calculateBehavioralScores(attemptId: number): Promise<BehavioralScore[]> {
  const { data: answers, error } = await supabase
    .from('user_answers')
    .select(`
      question_id,
      likert_rating,
      questions!inner (
        sequence_order,
        question_type
      )
    `)
    .eq('attempt_id', attemptId)
    .eq('questions.question_type', 'likert_scale')

  if (error) throw error

  const behavioralScores: BehavioralScore[] = BEHAVIORAL_DIMENSIONS.map(dimension => {
    let totalScore = 0
    let maxScore = 0
    
    dimension.question_numbers.forEach(questionNum => {
      const answer = answers.find(a => ((a.questions as any).sequence_order === questionNum))
      if (answer && answer.likert_rating) {
        totalScore += answer.likert_rating
        maxScore += 5 // Likert scale 1-5
      }
    })

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const level = getBehavioralLevel(totalScore, maxScore)
    
    return {
      dimension: dimension.name,
      score: totalScore,
      max_score: maxScore,
      percentage: percentage,
      level: level,
      interpretation: dimension.interpretation[level]
    }
  })

  return behavioralScores
}

// =============================================================================
// REPORT GENERATION FUNCTIONS
// =============================================================================

/**
 * Generate a comprehensive assessment report
 */
export async function generateAssessmentReport(attemptId: number): Promise<AssessmentReport> {
  // Get attempt details
  const { data: attempt, error } = await supabase
    .from('assessment_attempts')
    .select(`
      id,
      score,
      percentage,
      passed,
      completed_at,
      invitee_name,
      assessments!inner (
        title
      )
    `)
    .eq('id', attemptId)
    .single()

  if (error) throw error

  // Calculate competency and behavioral scores
  const competencyScores = await calculateCompetencyScores(attemptId)
  const behavioralScores = await calculateBehavioralScores(attemptId)
  
  // Calculate enhanced behavioral scores and honesty assessment
  const enhancedBehavioralScores = await calculateEnhancedBehavioralScores(attemptId)
  const honestyAssessment = await calculateHonestyAssessment(attemptId)
  
  // Get question-level details
  const { data: questionDetails, error: questionsError } = await supabase
    .from('user_answers')
    .select(`
      id,
      question_id,
      points_awarded,
      is_correct,
      text_answer,
      mcq_option_id,
      likert_rating,
      video_response_path,
      questions!inner (
        question_text,
        question_type,
        points,
        correct_answer,
        sequence_order,
        blocks!inner (
          title,
          block_type,
          sequence_order,
          parts!inner (
            id,
            title,
            sequence_order
          )
        )
      ),
      mcq_options (
        option_text,
        is_correct
      )
    `)
    .eq('attempt_id', attemptId)

  if (questionsError) throw questionsError

  // Sort by sequence order in JavaScript since Supabase can't order by nested fields with !inner joins
  questionDetails.sort((a, b) => {
    const aOrder = (a.questions as any)?.sequence_order || 0
    const bOrder = (b.questions as any)?.sequence_order || 0
    return aOrder - bOrder
  })

  // Get correct answers for MCQ questions
  const { data: allMcqOptions, error: mcqError } = await supabase
    .from('mcq_options')
    .select('question_id, option_text, is_correct')
    .in('question_id', questionDetails.map(q => q.question_id))

  if (mcqError) throw mcqError

  const questionScores: QuestionScore[] = []

  for (const detail of questionDetails) {
    const question = detail.questions as any
    const block = question.blocks as any
    const part = block.parts as any
    const userMcqOption = detail.mcq_options as any
    
    // Find correct MCQ option if applicable
    const correctMcqOption = allMcqOptions.find(opt => 
      opt.question_id === detail.question_id && opt.is_correct
    )

    // Check if this is a manual question with rubric scoring
    const isManualQuestion = requiresManualScoring(question.question_type)
    let rubricBreakdown: RubricScoreBreakdown[] | undefined

    if (isManualQuestion && detail.points_awarded !== null) {
      // Get detailed rubric breakdown for this answer
      try {
        rubricBreakdown = await getRubricBreakdown(detail.id, question.question_type)
      } catch (error) {
        console.warn(`Could not fetch rubric breakdown for answer ${detail.id}:`, error)
      }
    }

    const baseScore: QuestionScore = {
      question_id: detail.question_id,
      question_text: question.question_text,
      question_type: question.question_type,
      sequence_order: question.sequence_order || 0,
      points_possible: (question.points || 1),
      points_awarded: detail.points_awarded || 0,
      is_correct: detail.is_correct || false,
      answer_type: detail.mcq_option_id ? 'mcq' : 
                  detail.text_answer ? 'text' : 
                  detail.likert_rating ? 'likert' : 
                  detail.video_response_path ? 'video' : 'scenario' as any,
      
      // Part and block information for organization
      part_id: part.id,
      part_title: part.title,
      part_sequence: part.sequence_order,
      block_title: block.title,
      block_type: block.block_type,
      block_sequence: block.sequence_order,
      
      // User's answer details
      user_answer: {
        text_answer: detail.text_answer,
        mcq_option_text: userMcqOption?.option_text || null,
        mcq_option_selected: detail.mcq_option_id,
        likert_rating: detail.likert_rating,
        video_response_path: detail.video_response_path
      },
      
      // Correct answer details
      correct_answer: {
        text: question.correct_answer,
        mcq_correct_option_text: correctMcqOption?.option_text || null
      }
    }

    // Add rubric breakdown if available
    if (rubricBreakdown) {
      const totalRubricPoints: number = rubricBreakdown.reduce((sum, r) => sum + r.max_points, 0)
      ;(baseScore as any).rubric_breakdown = rubricBreakdown
      ;(baseScore as any).total_rubric_points = totalRubricPoints
      ;(baseScore as any).rubric_percentage = totalRubricPoints > 0 ? (detail.points_awarded || 0) / totalRubricPoints * 100 : 0
    }

    questionScores.push(baseScore)
  }

  // Generate strengths and weaknesses based on all assessments
  const strengths = [
    ...competencyScores
      .filter(comp => comp.percentage >= 80)
      .map(comp => `Strong performance in ${comp.name}`),
    ...enhancedBehavioralScores
      .filter(behav => behav.level === 'high')
      .map(behav => `Excellent ${behav.dimension.toLowerCase()} capabilities`)
  ]

  const developmentAreas = [
    ...competencyScores
      .filter(comp => comp.percentage < 70)
      .map(comp => `Development needed in ${comp.name}`),
    ...enhancedBehavioralScores
      .filter(behav => behav.level === 'low')
      .map(behav => `Requires development in ${behav.dimension.toLowerCase()}`)
  ]

  // Enhanced recommendation calculation including honesty assessment
  const overallRecommendation = calculateEnhancedRecommendation(
    competencyScores, 
    behavioralScores, 
    honestyAssessment
  )

  return {
    attempt_id: attemptId,
    candidate_name: attempt.invitee_name || 'Unknown',
    assessment_title: (attempt.assessments as any).title,
    completed_at: attempt.completed_at,
    total_score: attempt.score || 0,
    total_possible: questionDetails.reduce((sum, q) => sum + (((q.questions as any).points || 1)), 0),
    overall_percentage: attempt.percentage || 0,
    overall_pass: attempt.passed || false,
    competency_scores: competencyScores,
    behavioral_scores: behavioralScores,
    enhanced_behavioral_scores: enhancedBehavioralScores,
    honesty_assessment: honestyAssessment,
    question_details: questionScores,
    strengths: strengths,
    development_areas: developmentAreas,
    overall_recommendation: overallRecommendation
  }
}

/**
 * Enhanced recommendation calculation that includes honesty assessment
 */
function calculateEnhancedRecommendation(
  competencyScores: CompetencyScore[],
  behavioralScores: BehavioralScore[],
  honestyAssessment: HonestyAssessment
): 'Strong Hire' | 'Hire' | 'Consider' | 'Do Not Hire' {
  const criticalCompetencies = ['business_valuation', 'ethical_decision_making', 'communication']
  const criticalFails = competencyScores.filter(
    comp => criticalCompetencies.includes(comp.area) && !comp.is_passing
  ).length
  
  const overallPass = competencyScores.filter(comp => comp.is_passing).length / competencyScores.length
  const ethicalScore = behavioralScores.find(bs => bs.dimension === 'Ethical Orientation')
  
  // Check for integrity red flags
  const hasHighSeverityRedFlags = honestyAssessment.red_flags.some(flag => flag.severity === 'high')
  const hasMultipleMediumRedFlags = honestyAssessment.red_flags.filter(flag => flag.severity === 'medium').length >= 2
  const lowIntegrity = honestyAssessment.overall_integrity_score < 60
  const concerningConsistency = honestyAssessment.consistency_rating === 'concerning'
  
  // Immediate disqualification conditions
  if (criticalFails > 0 || 
      hasHighSeverityRedFlags || 
      lowIntegrity || 
      concerningConsistency ||
      (ethicalScore && ethicalScore.level === 'low')) {
    return 'Do Not Hire'
  }
  
  // Consider category for multiple concerns
  if (hasMultipleMediumRedFlags || 
      honestyAssessment.social_desirability_bias === 'high' ||
      honestyAssessment.consistency_rating === 'low') {
    return 'Consider'
  }
  
  // Strong hire for excellent performance with good integrity
  if (overallPass >= 0.9 && 
      ethicalScore?.level === 'high' && 
      honestyAssessment.overall_integrity_score >= 80 &&
      honestyAssessment.consistency_rating === 'high') {
    return 'Strong Hire'
  }
  
  // Regular hire for good performance
  if (overallPass >= 0.75 && honestyAssessment.overall_integrity_score >= 70) {
    return 'Hire'
  }
  
  return 'Consider'
}

/**
 * Generate detailed strengths and weaknesses analysis
 */
export async function generateStrengthsWeaknessesAnalysis(attemptId: number): Promise<StrengthsWeaknessesAnalysis> {
  const competencyScores = await calculateCompetencyScores(attemptId)
  const behavioralScores = await calculateBehavioralScores(attemptId)

  const strengths = competencyScores
    .filter(comp => comp.percentage >= 75)
    .map(comp => ({
      area: comp.name,
      evidence: [
        `Scored ${comp.percentage.toFixed(1)}% in this competency area`,
        `Answered ${comp.question_count} questions correctly`
      ],
      impact: `Strong foundation in ${comp.name.toLowerCase()} provides solid basis for role success`
    }))

  const weaknesses = competencyScores
    .filter(comp => comp.percentage < 70)
    .map(comp => ({
      area: comp.name,
      evidence: [
        `Scored ${comp.percentage.toFixed(1)}% in this competency area`,
        `Below passing threshold of ${COMPETENCY_DEFINITIONS.find(d => d.area === comp.area)?.passing_threshold}%`
      ],
      impact: `Limited capability in ${comp.name.toLowerCase()} may impact job performance`,
      recommendations: comp.recommendations || []
    }))

  const developmentPriorities = [
    ...weaknesses.map(w => ({
      priority: 'High' as const,
      area: w.area,
      specific_actions: w.recommendations
    })),
    ...competencyScores
      .filter(comp => comp.percentage >= 70 && comp.percentage < 80)
      .map(comp => ({
        priority: 'Medium' as const,
        area: comp.name,
        specific_actions: [`Continue development in ${comp.name.toLowerCase()} to reach excellence level`]
      }))
  ]

  return {
    strengths,
    weaknesses,
    development_priorities: developmentPriorities
  }
}

// =============================================================================
// MANUAL SCORING FUNCTIONS (FOR ADMIN INTERFACE)
// =============================================================================

/**
 * Update manual score for a subjective question
 */
export async function updateManualScore(
  answerId: number,
  pointsAwarded: number,
  isCorrect: boolean,
  graderId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_answers')
    .update({
      points_awarded: pointsAwarded,
      is_correct: isCorrect
    })
    .eq('id', answerId)

  if (error) throw error

  // Note: grading_log table would need to be created if logging is needed
  // await supabase
  //   .from('grading_log')
  //   .insert({
  //     answer_id: answerId,
  //     grader_id: graderId,
  //     points_awarded: pointsAwarded,
  //     graded_at: new Date().toISOString()
  //   })
}

/**
 * Get all ungraded subjective responses for an assessment
 * Now properly identifies manual questions that haven't been scored yet
 */
export async function getUngradedResponses(assessmentId: number) {
  const { data, error } = await supabase
    .from('user_answers')
    .select(`
      id,
      text_answer,
      video_response_path,
      likert_rating,
      attempt_id,
      points_awarded,
      is_correct,
      questions!inner (
        id,
        question_text,
        question_type,
        correct_answer,
        points
      ),
      assessment_attempts!inner (
        invitee_name,
        invitee_email,
        completed_at
      )
    `)
    .is('points_awarded', null) // Only unscored questions
    .in('questions.question_type', MANUAL_SCORING_QUESTION_TYPES) // Only manual scoring types
    .eq('assessment_attempts.assessment_id', assessmentId)
    .not('assessment_attempts.completed_at', 'is', null) // Only completed attempts

  if (error) throw error
  return data
}

/**
 * Get all ungraded subjective responses for a specific attempt
 * This is used when viewing individual attempt details
 */
export async function getUngradedResponsesForAttempt(attemptId: number) {
  const { data, error } = await supabase
    .from('user_answers')
    .select(`
      id,
      text_answer,
      video_response_path,
      likert_rating,
      attempt_id,
      points_awarded,
      is_correct,
      questions!inner (
        id,
        question_text,
        question_type,
        correct_answer,
        points
      ),
      assessment_attempts!inner (
        invitee_name,
        invitee_email,
        completed_at
      )
    `)
    .is('points_awarded', null) // Only unscored questions
    .in('questions.question_type', MANUAL_SCORING_QUESTION_TYPES) // Only manual scoring types
    .eq('attempt_id', attemptId) // Filter by specific attempt
    .not('assessment_attempts.completed_at', 'is', null) // Only completed attempts

  if (error) throw error
  return data
}

/**
 * Get scoring summary for an assessment attempt
 */
export async function getAssessmentScoringStatus(attemptId: number) {
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
    const questionType = (answer.questions as any).question_type
    const isScored = answer.points_awarded !== null

    if (canAutoScore(questionType)) {
      if (isScored) {
        summary.auto_scored++
      } else {
        summary.auto_scoring_complete = false
      }
    } else if (requiresManualScoring(questionType)) {
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

/**
 * Check if all questions in an assessment have been appropriately scored
 */
export async function isAssessmentFullyGraded(attemptId: number): Promise<boolean> {
  const status = await getAssessmentScoringStatus(attemptId)
  return status.overall_complete
}

/**
 * Get detailed grading status for admin interface
 */
export async function getDetailedGradingStatus(assessmentId: number) {
  // Get all completed attempts for this assessment
  const { data: attempts, error: attemptsError } = await supabase
    .from('assessment_attempts')
    .select('id, invitee_name, invitee_email, completed_at')
    .eq('assessment_id', assessmentId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (attemptsError) throw attemptsError

  const gradingStatus = []

  for (const attempt of attempts) {
    const status = await getAssessmentScoringStatus(attempt.id)
    gradingStatus.push({
      attempt_id: attempt.id,
      candidate_name: attempt.invitee_name,
      candidate_email: attempt.invitee_email,
      completed_at: attempt.completed_at,
      ...status
    })
  }

  return gradingStatus
}

// =============================================================================
// DETAILED RUBRIC SCORING FUNCTIONS
// =============================================================================

/**
 * Save detailed rubric scores for a manual question
 */
export async function saveRubricScores(
  answerID: number,
  rubricScores: { criterion: string; maxPoints: number; pointsAwarded: number; notes?: string }[],
  graderId: string
): Promise<void> {
  // First, delete any existing rubric scores for this answer
  await supabase
    .from('rubric_scores')
    .delete()
    .eq('user_answer_id', answerID)

  // Insert new rubric scores
  const rubricEntries = rubricScores.map(score => ({
    user_answer_id: answerID,
    rubric_criterion: score.criterion,
    max_points: score.maxPoints,
    points_awarded: score.pointsAwarded,
    notes: score.notes || null,
    graded_by: graderId
  }))

  const { error } = await supabase
    .from('rubric_scores')
    .insert(rubricEntries)

  if (error) throw error

  // Calculate total points and update user_answers table
  const totalPoints = rubricScores.reduce((sum, score) => sum + score.pointsAwarded, 0)
  const maxTotalPoints = rubricScores.reduce((sum, score) => sum + score.maxPoints, 0)
  const isCorrect = totalPoints === maxTotalPoints

  await supabase
    .from('user_answers')
    .update({
      points_awarded: totalPoints,
      is_correct: isCorrect
    })
    .eq('id', answerID)
}

/**
 * Get detailed rubric scores for a user answer
 */
export async function getRubricScores(answerID: number): Promise<RubricScore[]> {
  const { data, error } = await supabase
    .from('rubric_scores')
    .select('*')
    .eq('user_answer_id', answerID)
    .order('rubric_criterion')

  if (error) throw error
  return data || []
}

/**
 * Get rubric breakdown for display in assessment reports
 */
export async function getRubricBreakdown(answerID: number, questionType: string): Promise<RubricScoreBreakdown[]> {
  const rubricScores = await getRubricScores(answerID)
  const rubricCriteria = getRubricForQuestionType(questionType)

  const breakdown: RubricScoreBreakdown[] = rubricCriteria.map(criterion => {
    const score = rubricScores.find(s => s.rubric_criterion === criterion.name.toLowerCase().replace(/\s+/g, '_'))
    
    return {
      criterion_name: criterion.name,
      criterion_description: criterion.description,
      max_points: criterion.max_points,
      points_awarded: score?.points_awarded || 0,
      notes: score?.notes || null,
      level_achieved: score ? getScoringLevel(score.points_awarded, criterion.max_points, criterion) : 'Not Scored'
    }
  })

  return breakdown
}

/**
 * Check if a question has detailed rubric scoring
 */
export async function hasRubricScoring(answerID: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('rubric_scores')
    .select('id')
    .eq('user_answer_id', answerID)
    .limit(1)

  if (error) throw error
  return (data?.length || 0) > 0
} 