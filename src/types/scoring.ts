// =============================================================================
// COMPREHENSIVE ASSESSMENT SCORING FRAMEWORK
// =============================================================================

export type CompetencyArea = 
  | 'business_valuation'
  | 'industry_knowledge'
  | 'technical_assessment'
  | 'negotiation_skills'
  | 'communication'
  | 'ethical_decision_making'
  | 'problem_solving'
  | 'behavioral_fit'

export type ScoringMethod = 
  | 'objective' // Automatic scoring (MCQ, binary choices)
  | 'subjective' // Human evaluation required
  | 'hybrid' // Combination of automatic + human review

export interface CompetencyDefinition {
  area: CompetencyArea
  name: string
  description: string
  weight: number // Percentage of total score (should sum to 100)
  scoring_method: ScoringMethod
  question_types: string[]
  passing_threshold: number // Minimum percentage to be considered competent
}

export const COMPETENCY_DEFINITIONS: CompetencyDefinition[] = [
  {
    area: 'business_valuation',
    name: 'Business Valuation & Financial Analysis',
    description: 'Understanding of valuation principles, financial metrics, and SDE calculations',
    weight: 25,
    scoring_method: 'objective',
    question_types: ['multiple_choice'],
    passing_threshold: 70
  },
  {
    area: 'industry_knowledge',
    name: 'Industry Knowledge',
    description: 'Knowledge of E-commerce, SaaS, and Content business models',
    weight: 20,
    scoring_method: 'objective',
    question_types: ['multiple_choice'],
    passing_threshold: 65
  },
  {
    area: 'technical_assessment',
    name: 'Technical Assessment',
    description: 'Ability to evaluate technical risks and transferability issues',
    weight: 15,
    scoring_method: 'objective',
    question_types: ['multiple_choice'],
    passing_threshold: 60
  },
  {
    area: 'negotiation_skills',
    name: 'Negotiation & Deal Management',
    description: 'Practical negotiation skills under pressure and complex deal scenarios',
    weight: 15,
    scoring_method: 'subjective',
    question_types: ['video_response', 'email_response', 'timed_scenario'],
    passing_threshold: 70
  },
  {
    area: 'communication',
    name: 'Communication & Client Management',
    description: 'Professional communication skills and relationship management',
    weight: 10,
    scoring_method: 'subjective',
    question_types: ['email_response', 'video_response'],
    passing_threshold: 75
  },
  {
    area: 'ethical_decision_making',
    name: 'Ethical Decision Making',
    description: 'Sound ethical judgment in complex business situations',
    weight: 10,
    scoring_method: 'hybrid',
    question_types: ['forced_choice', 'essay', 'scenario_response'],
    passing_threshold: 80
  },
  {
    area: 'problem_solving',
    name: 'Problem Solving & Critical Thinking',
    description: 'Analytical thinking and creative problem-solving abilities',
    weight: 3,
    scoring_method: 'subjective',
    question_types: ['essay', 'scenario_response'],
    passing_threshold: 65
  },
  {
    area: 'behavioral_fit',
    name: 'Behavioral Fit & Cultural Alignment',
    description: 'Alignment with company values and working style preferences',
    weight: 2,
    scoring_method: 'hybrid',
    question_types: ['likert_scale', 'behavioral_assessment'],
    passing_threshold: 60
  }
]

// =============================================================================
// SCORING RUBRICS FOR SUBJECTIVE QUESTIONS
// =============================================================================

export interface ScoringCriterion {
  name: string
  description: string
  max_points: number
  levels: ScoringLevel[]
}

export interface ScoringLevel {
  points: number
  label: string
  description: string
}

export interface QuestionRubric {
  question_type: string
  criteria: ScoringCriterion[]
  total_points: number
  notes?: string
}

// Email Response Rubric
export const EMAIL_RESPONSE_RUBRIC: QuestionRubric = {
  question_type: 'email_response',
  criteria: [
    {
      name: 'Professional Tone',
      description: 'Appropriate business communication style',
      max_points: 2,
      levels: [
        { points: 2, label: 'Excellent', description: 'Professional, confident, and appropriately formal' },
        { points: 1, label: 'Good', description: 'Generally professional with minor tone issues' },
        { points: 0, label: 'Poor', description: 'Unprofessional, too casual, or inappropriate tone' }
      ]
    },
    {
      name: 'Problem Resolution',
      description: 'Addresses the core issue effectively',
      max_points: 4,
      levels: [
        { points: 4, label: 'Excellent', description: 'Comprehensive solution addressing all key concerns' },
        { points: 3, label: 'Good', description: 'Addresses main issues with minor gaps' },
        { points: 2, label: 'Fair', description: 'Partial solution, misses some important elements' },
        { points: 1, label: 'Poor', description: 'Minimal problem-solving, major gaps' },
        { points: 0, label: 'Inadequate', description: 'Fails to address the core problem' }
      ]
    },
    {
      name: 'Strategic Thinking',
      description: 'Demonstrates understanding of business implications',
      max_points: 3,
      levels: [
        { points: 3, label: 'Excellent', description: 'Shows deep understanding of business context and implications' },
        { points: 2, label: 'Good', description: 'Good business understanding with minor limitations' },
        { points: 1, label: 'Fair', description: 'Basic business understanding, limited strategic insight' },
        { points: 0, label: 'Poor', description: 'Little evidence of business acumen' }
      ]
    },
    {
      name: 'Action Steps',
      description: 'Provides clear, actionable next steps',
      max_points: 2,
      levels: [
        { points: 2, label: 'Excellent', description: 'Clear, specific, and actionable recommendations' },
        { points: 1, label: 'Good', description: 'Generally clear with some vague elements' },
        { points: 0, label: 'Poor', description: 'Vague or missing action steps' }
      ]
    }
  ],
  total_points: 11
}

// Video Response Rubric
export const VIDEO_RESPONSE_RUBRIC: QuestionRubric = {
  question_type: 'video_response',
  criteria: [
    {
      name: 'Communication Clarity',
      description: 'Clear, organized verbal communication',
      max_points: 3,
      levels: [
        { points: 3, label: 'Excellent', description: 'Clear, well-organized, easy to follow' },
        { points: 2, label: 'Good', description: 'Generally clear with minor organizational issues' },
        { points: 1, label: 'Fair', description: 'Somewhat unclear or disorganized' },
        { points: 0, label: 'Poor', description: 'Difficult to understand or follow' }
      ]
    },
    {
      name: 'Professional Presence',
      description: 'Confidence, poise, and professional demeanor',
      max_points: 2,
      levels: [
        { points: 2, label: 'Excellent', description: 'Confident, poised, professional demeanor' },
        { points: 1, label: 'Good', description: 'Generally professional with minor issues' },
        { points: 0, label: 'Poor', description: 'Lacks confidence or professional presence' }
      ]
    },
    {
      name: 'Content Quality',
      description: 'Substance and quality of the response',
      max_points: 4,
      levels: [
        { points: 4, label: 'Excellent', description: 'Comprehensive, insightful, addresses all key points' },
        { points: 3, label: 'Good', description: 'Good content with minor gaps' },
        { points: 2, label: 'Fair', description: 'Adequate content, some important elements missing' },
        { points: 1, label: 'Poor', description: 'Limited content, major gaps' },
        { points: 0, label: 'Inadequate', description: 'Insufficient or irrelevant content' }
      ]
    },
    {
      name: 'Time Management',
      description: 'Effective use of allotted time',
      max_points: 1,
      levels: [
        { points: 1, label: 'Good', description: 'Used time effectively, covered all points' },
        { points: 0, label: 'Poor', description: 'Poor time management, missed key points or went over' }
      ]
    }
  ],
  total_points: 10
}

// Ethical Scenario Rubric
export const ETHICAL_SCENARIO_RUBRIC: QuestionRubric = {
  question_type: 'scenario_response',
  criteria: [
    {
      name: 'Ethical Reasoning',
      description: 'Quality of ethical analysis and reasoning',
      max_points: 4,
      levels: [
        { points: 4, label: 'Excellent', description: 'Clear ethical framework, considers multiple perspectives' },
        { points: 3, label: 'Good', description: 'Good ethical reasoning with minor gaps' },
        { points: 2, label: 'Fair', description: 'Basic ethical consideration, limited depth' },
        { points: 1, label: 'Poor', description: 'Minimal ethical reasoning' },
        { points: 0, label: 'Inadequate', description: 'No clear ethical framework or reasoning' }
      ]
    },
    {
      name: 'Stakeholder Consideration',
      description: 'Recognition and consideration of all affected parties',
      max_points: 3,
      levels: [
        { points: 3, label: 'Excellent', description: 'Considers all relevant stakeholders and their interests' },
        { points: 2, label: 'Good', description: 'Considers most stakeholders, minor omissions' },
        { points: 1, label: 'Fair', description: 'Limited stakeholder consideration' },
        { points: 0, label: 'Poor', description: 'Fails to consider key stakeholders' }
      ]
    },
    {
      name: 'Practical Implementation',
      description: 'Feasibility and practicality of proposed solution',
      max_points: 2,
      levels: [
        { points: 2, label: 'Excellent', description: 'Practical, implementable solution' },
        { points: 1, label: 'Good', description: 'Generally practical with minor concerns' },
        { points: 0, label: 'Poor', description: 'Impractical or unfeasible solution' }
      ]
    },
    {
      name: 'Professional Standards',
      description: 'Alignment with professional standards and integrity',
      max_points: 3,
      levels: [
        { points: 3, label: 'Excellent', description: 'Strongly aligned with professional standards' },
        { points: 2, label: 'Good', description: 'Generally aligned with minor concerns' },
        { points: 1, label: 'Fair', description: 'Some alignment issues' },
        { points: 0, label: 'Poor', description: 'Poor alignment with professional standards' }
      ]
    }
  ],
  total_points: 12
}

// Essay Response Rubric
export const ESSAY_RESPONSE_RUBRIC: QuestionRubric = {
  question_type: 'essay',
  criteria: [
    {
      name: 'Analysis Depth',
      description: 'Depth and quality of analysis',
      max_points: 4,
      levels: [
        { points: 4, label: 'Excellent', description: 'Deep, nuanced analysis with multiple perspectives' },
        { points: 3, label: 'Good', description: 'Good analysis with some depth' },
        { points: 2, label: 'Fair', description: 'Basic analysis, limited depth' },
        { points: 1, label: 'Poor', description: 'Superficial analysis' },
        { points: 0, label: 'Inadequate', description: 'No meaningful analysis' }
      ]
    },
    {
      name: 'Business Judgment',
      description: 'Sound business reasoning and judgment',
      max_points: 3,
      levels: [
        { points: 3, label: 'Excellent', description: 'Excellent business judgment and reasoning' },
        { points: 2, label: 'Good', description: 'Good business sense with minor gaps' },
        { points: 1, label: 'Fair', description: 'Basic business understanding' },
        { points: 0, label: 'Poor', description: 'Poor business judgment' }
      ]
    },
    {
      name: 'Written Communication',
      description: 'Clarity, organization, and professional writing',
      max_points: 2,
      levels: [
        { points: 2, label: 'Excellent', description: 'Clear, well-organized, professional writing' },
        { points: 1, label: 'Good', description: 'Generally clear with minor issues' },
        { points: 0, label: 'Poor', description: 'Unclear or poorly organized writing' }
      ]
    }
  ],
  total_points: 9
}

// Negotiation Scenario Rubric (Timed)
export const NEGOTIATION_SCENARIO_RUBRIC: QuestionRubric = {
  question_type: 'timed_scenario',
  criteria: [
    {
      name: 'Strategic Approach',
      description: 'Quality of negotiation strategy and planning',
      max_points: 4,
      levels: [
        { points: 4, label: 'Excellent', description: 'Clear, well-reasoned strategic approach' },
        { points: 3, label: 'Good', description: 'Good strategy with minor weaknesses' },
        { points: 2, label: 'Fair', description: 'Basic strategy, limited depth' },
        { points: 1, label: 'Poor', description: 'Weak or unclear strategy' },
        { points: 0, label: 'Inadequate', description: 'No clear strategic approach' }
      ]
    },
    {
      name: 'Stakeholder Management',
      description: 'Ability to manage multiple parties and interests',
      max_points: 3,
      levels: [
        { points: 3, label: 'Excellent', description: 'Skillfully manages all stakeholder interests' },
        { points: 2, label: 'Good', description: 'Good stakeholder management with minor gaps' },
        { points: 1, label: 'Fair', description: 'Basic stakeholder consideration' },
        { points: 0, label: 'Poor', description: 'Poor stakeholder management' }
      ]
    },
    {
      name: 'Pressure Management',
      description: 'Performance under time pressure and stress',
      max_points: 2,
      levels: [
        { points: 2, label: 'Excellent', description: 'Excellent performance under pressure' },
        { points: 1, label: 'Good', description: 'Good performance with minor stress indicators' },
        { points: 0, label: 'Poor', description: 'Poor performance under pressure' }
      ]
    },
    {
      name: 'Outcome Focus',
      description: 'Focus on achieving positive outcomes for all parties',
      max_points: 3,
      levels: [
        { points: 3, label: 'Excellent', description: 'Strong focus on win-win outcomes' },
        { points: 2, label: 'Good', description: 'Generally focused on positive outcomes' },
        { points: 1, label: 'Fair', description: 'Some focus on outcomes, limited perspective' },
        { points: 0, label: 'Poor', description: 'Poor outcome focus or zero-sum thinking' }
      ]
    }
  ],
  total_points: 12
}

// =============================================================================
// BEHAVIORAL ASSESSMENT SCORING
// =============================================================================

export interface BehavioralDimension {
  name: string
  description: string
  desired_direction: 'high' | 'low' | 'moderate'
  question_numbers: number[] // Keep for backward compatibility
  likert_question_numbers?: number[] // Enhanced field
  ethical_scenario_indicators?: EthicalIndicator[]
  consistency_checks?: ConsistencyCheck[]
  interpretation: {
    high: string
    moderate: string
    low: string
  }
  red_flags?: RedFlag[]
}

export interface EthicalIndicator {
  scenario_description: string
  ethical_choice: 'A' | 'B'
  weight: number
  rationale: string
}

export interface ConsistencyCheck {
  name: string
  description: string
  likert_questions: number[]
  ethical_scenarios: string[]
  expected_correlation: 'positive' | 'negative'
  tolerance: number
}

export interface RedFlag {
  name: string
  description: string
  trigger_conditions: string[]
  severity: 'low' | 'medium' | 'high'
}

export const BEHAVIORAL_DIMENSIONS: BehavioralDimension[] = [
  {
    name: 'Ethical Orientation',
    description: 'Commitment to ethical behavior and transparency',
    desired_direction: 'high',
    question_numbers: [84, 85, 86, 103, 108],
    likert_question_numbers: [84, 85, 86, 103, 108],
    ethical_scenario_indicators: [
      {
        scenario_description: 'Questionable Discount Program',
        ethical_choice: 'B',
        weight: 1.0,
        rationale: 'Declining misaligned business models shows ethical standards'
      },
      {
        scenario_description: 'The Overvalued Testimonials',
        ethical_choice: 'B',
        weight: 1.0,
        rationale: 'Requiring verified testimonials prioritizes honesty over expedience'
      },
      {
        scenario_description: 'The Unverifiable Customer List',
        ethical_choice: 'B',
        weight: 0.8,
        rationale: 'Transparent revenue categorization shows ethical disclosure'
      },
      {
        scenario_description: 'The Shifting Compliance Landscape',
        ethical_choice: 'B',
        weight: 1.0,
        rationale: 'Proactive disclosure of regulatory risks demonstrates integrity'
      }
    ],
    consistency_checks: [
      {
        name: 'Ethics vs. Outcomes',
        description: 'Checks if candidate prioritizes ethical considerations over financial outcomes',
        likert_questions: [84, 86],
        ethical_scenarios: ['Questionable Discount Program', 'The Overvalued Testimonials'],
        expected_correlation: 'negative',
        tolerance: 0.3
      },
      {
        name: 'Transparency Commitment',
        description: 'Consistency between stated and demonstrated transparency values',
        likert_questions: [85, 103],
        ethical_scenarios: ['The Shifting Compliance Landscape', 'The Unverifiable Customer List'],
        expected_correlation: 'negative',
        tolerance: 0.25
      }
    ],
    interpretation: {
      high: 'Strong ethical foundation and commitment to transparency',
      moderate: 'Generally ethical with some situational flexibility',
      low: 'May prioritize outcomes over ethical considerations'
    },
    red_flags: [
      {
        name: 'Ethics-Outcome Contradiction',
        description: 'Claims high ethical standards but consistently chooses profit over principle',
        trigger_conditions: ['High likert scores (4-5) on ethics questions', 'Consistently chooses less ethical options in scenarios'],
        severity: 'high'
      },
      {
        name: 'Transparency Inconsistency',
        description: 'Claims transparency but avoids disclosure in scenarios',
        trigger_conditions: ['High likert scores on transparency', 'Avoids disclosure in multiple scenarios'],
        severity: 'medium'
      }
    ]
  },
  {
    name: 'Communication Effectiveness',
    description: 'Ability to communicate complex ideas clearly',
    desired_direction: 'high',
    question_numbers: [87, 88, 89, 101],
    likert_question_numbers: [87, 88, 89, 101],
    ethical_scenario_indicators: [
      {
        scenario_description: 'Customer Concentration Discrepancy',
        ethical_choice: 'A',
        weight: 0.7,
        rationale: 'Immediate disclosure shows proactive communication'
      }
    ],
    consistency_checks: [
      {
        name: 'Communication Style',
        description: 'Alignment between self-reported and demonstrated communication approach',
        likert_questions: [87, 89],
        ethical_scenarios: ['Customer Concentration Discrepancy'],
        expected_correlation: 'positive',
        tolerance: 0.4
      }
    ],
    interpretation: {
      high: 'Excellent communication skills and relationship building',
      moderate: 'Good communication with room for improvement',
      low: 'May struggle with complex communication scenarios'
    },
    red_flags: [
      {
        name: 'Communication Avoidance',
        description: 'Claims strong communication but avoids difficult conversations',
        trigger_conditions: ['High communication self-ratings', 'Avoids direct disclosure in scenarios'],
        severity: 'medium'
      }
    ]
  },
  {
    name: 'Business Acumen',
    description: 'Understanding of business dynamics and financial principles',
    desired_direction: 'high',
    question_numbers: [93, 94, 95, 105, 107],
    likert_question_numbers: [93, 94, 95, 105, 107],
    ethical_scenario_indicators: [
      {
        scenario_description: "The Founder's Necessity",
        ethical_choice: 'B',
        weight: 0.6,
        rationale: 'Understanding that market value maximizes seller outcome shows business acumen'
      }
    ],
    consistency_checks: [
      {
        name: 'Financial Priorities',
        description: 'Balance between financial acumen and ethical considerations',
        likert_questions: [94, 107],
        ethical_scenarios: ["The Founder's Necessity"],
        expected_correlation: 'positive',
        tolerance: 0.5
      }
    ],
    interpretation: {
      high: 'Strong business understanding and analytical skills',
      moderate: 'Good business sense with some development needs',
      low: 'Limited business acumen, requires significant development'
    },
    red_flags: []
  },
  {
    name: 'Self-Management',
    description: 'Personal organization and professional standards',
    desired_direction: 'high',
    question_numbers: [96, 97, 102, 104],
    likert_question_numbers: [96, 97, 102, 104],
    ethical_scenario_indicators: [],
    consistency_checks: [
      {
        name: 'Professional Standards',
        description: 'Consistency between claimed and demonstrated professional standards',
        likert_questions: [102, 104],
        ethical_scenarios: ['Multiple scenarios requiring professional judgment'],
        expected_correlation: 'positive',
        tolerance: 0.3
      }
    ],
    interpretation: {
      high: 'Excellent self-management and professional standards',
      moderate: 'Good self-management with minor gaps',
      low: 'May struggle with organization and consistency'
    },
    red_flags: [
      {
        name: 'Standards Inconsistency',
        description: 'Claims high standards but demonstrates lower standards in practice',
        trigger_conditions: ['High self-management scores', 'Poor ethical choices in scenarios'],
        severity: 'medium'
      }
    ]
  },
  {
    name: 'Conflict Resolution',
    description: 'Ability to navigate disagreements and find solutions',
    desired_direction: 'high',
    question_numbers: [99, 100, 92],
    likert_question_numbers: [99, 100, 92],
    ethical_scenario_indicators: [
      {
        scenario_description: 'Multiple Client Conflict',
        ethical_choice: 'B',
        weight: 0.8,
        rationale: 'Presenting both opportunities shows balanced approach to conflicting interests'
      }
    ],
    consistency_checks: [
      {
        name: 'Conflict Approach',
        description: 'Alignment between stated conflict resolution style and scenario choices',
        likert_questions: [99, 100],
        ethical_scenarios: ['Multiple Client Conflict'],
        expected_correlation: 'positive',
        tolerance: 0.4
      }
    ],
    interpretation: {
      high: 'Strong conflict resolution and mediation skills',
      moderate: 'Adequate conflict management abilities',
      low: 'May avoid conflict or handle it poorly'
    },
    red_flags: []
  }
]

// =============================================================================
// HONESTY & INTEGRITY ASSESSMENT
// =============================================================================

export interface HonestyAssessment {
  overall_integrity_score: number
  social_desirability_bias: 'low' | 'moderate' | 'high'
  consistency_rating: 'high' | 'moderate' | 'low' | 'concerning'
  red_flags: IdentifiedRedFlag[]
  detailed_analysis: HonestyAnalysis
}

export interface IdentifiedRedFlag {
  category: string
  description: string
  severity: 'low' | 'medium' | 'high'
  evidence: string[]
  recommendation: string
}

export interface HonestyAnalysis {
  likert_patterns: LikertPattern[]
  ethical_consistency: EthicalConsistency
  self_awareness_indicators: SelfAwarenessIndicator[]
  cross_validation_results: CrossValidationResult[]
}

export interface LikertPattern {
  pattern_type: 'extreme_positive' | 'extreme_negative' | 'mid_point_bias' | 'inconsistent'
  description: string
  questions_affected: number[]
  severity: 'low' | 'medium' | 'high'
}

export interface EthicalConsistency {
  internal_consistency: number // 0-1 score
  likert_ethical_alignment: number // 0-1 score
  scenario_pattern_analysis: string
  concerning_disconnects: string[]
}

export interface SelfAwarenessIndicator {
  indicator: string
  evidence: string
  rating: 'high' | 'moderate' | 'low'
}

export interface CrossValidationResult {
  comparison_type: string
  correlation_strength: number
  expected_correlation: number
  variance_explanation: string
  concern_level: 'none' | 'minor' | 'moderate' | 'significant'
}

// =============================================================================
// ASSESSMENT REPORTS & ANALYTICS
// =============================================================================

export interface CompetencyScore {
  area: CompetencyArea
  name: string
  points_earned: number
  points_possible: number
  percentage: number
  level: 'Excellent' | 'Good' | 'Fair' | 'Needs Development' | 'Inadequate'
  is_passing: boolean
  question_count: number
  recommendations?: string[]
}

export interface BehavioralScore {
  dimension: string
  score: number
  max_score: number
  percentage: number
  level: 'high' | 'moderate' | 'low'
  interpretation: string
}

export interface EnhancedBehavioralScore {
  dimension: string
  likert_score: number
  likert_max_score: number
  likert_percentage: number
  ethical_alignment_score: number
  consistency_score: number
  overall_score: number
  level: 'high' | 'moderate' | 'low'
  interpretation: string
  red_flags: IdentifiedRedFlag[]
  recommendations: string[]
}

export interface AssessmentReport {
  attempt_id: number
  candidate_name: string
  assessment_title: string
  completed_at: string
  
  // Overall Results
  total_score: number
  total_possible: number
  overall_percentage: number
  overall_pass: boolean
  
  // Competency Breakdown
  competency_scores: CompetencyScore[]
  
  // Behavioral Assessment (backward compatible)
  behavioral_scores: BehavioralScore[]
  
  // Enhanced assessment (new)
  enhanced_behavioral_scores?: EnhancedBehavioralScore[]
  honesty_assessment?: HonestyAssessment
  
  // Question-Level Details
  question_details: QuestionScore[]
  
  // Recommendations
  strengths: string[]
  development_areas: string[]
  overall_recommendation: 'Strong Hire' | 'Hire' | 'Consider' | 'Do Not Hire'
  notes?: string
}

export interface StrengthsWeaknessesAnalysis {
  strengths: {
    area: string
    evidence: string[]
    impact: string
  }[]
  
  weaknesses: {
    area: string
    evidence: string[]
    impact: string
    recommendations: string[]
  }[]
  
  development_priorities: {
    priority: 'High' | 'Medium' | 'Low'
    area: string
    specific_actions: string[]
  }[]
}

// =============================================================================
// DETAILED RUBRIC SCORING INTERFACES
// =============================================================================

export interface RubricScore {
  id: number
  user_answer_id: number
  rubric_criterion: string
  max_points: number
  points_awarded: number
  notes: string | null
  graded_by: string
  graded_at: string
}

export interface RubricScoreBreakdown {
  criterion_name: string
  criterion_description: string
  max_points: number
  points_awarded: number
  notes: string | null
  level_achieved: string // e.g., 'Excellent', 'Good', 'Fair', 'Poor'
}

export interface DetailedQuestionScore extends QuestionScore {
  rubric_breakdown?: RubricScoreBreakdown[]
  total_rubric_points?: number
  rubric_percentage?: number
}

// Mapping of question types to their default rubric criteria
export const QUESTION_TYPE_RUBRICS: { [key: string]: ScoringCriterion[] } = {
  'email_response': EMAIL_RESPONSE_RUBRIC.criteria,
  'video_response': VIDEO_RESPONSE_RUBRIC.criteria,
  'scenario_response': ETHICAL_SCENARIO_RUBRIC.criteria,
  'essay': ESSAY_RESPONSE_RUBRIC.criteria,
  'timed_scenario': NEGOTIATION_SCENARIO_RUBRIC.criteria
}

// Helper function to get rubric for a question type
export function getRubricForQuestionType(questionType: string): ScoringCriterion[] {
  return QUESTION_TYPE_RUBRICS[questionType] || []
}

// Helper function to get scoring level for points awarded
export function getScoringLevel(pointsAwarded: number, maxPoints: number, criterion: ScoringCriterion): string {
  const matchingLevel = criterion.levels.find(level => level.points === pointsAwarded)
  return matchingLevel?.label || 'Unknown'
}

// =============================================================================
// HELPER FUNCTIONS FOR SCORING
// =============================================================================

export function getCompetencyLevel(percentage: number): string {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 80) return 'Good'
  if (percentage >= 70) return 'Fair'
  if (percentage >= 60) return 'Needs Development'
  return 'Inadequate'
}

export function getBehavioralLevel(score: number, maxScore: number): 'high' | 'moderate' | 'low' {
  const percentage = (score / maxScore) * 100
  if (percentage >= 70) return 'high'
  if (percentage >= 40) return 'moderate'
  return 'low'
}

export function calculateOverallRecommendation(
  competencyScores: CompetencyScore[],
  behavioralScores: BehavioralScore[]
): 'Strong Hire' | 'Hire' | 'Consider' | 'Do Not Hire' {
  const criticalCompetencies = ['business_valuation', 'ethical_decision_making', 'communication']
  const criticalFails = competencyScores.filter(
    comp => criticalCompetencies.includes(comp.area) && !comp.is_passing
  ).length
  
  const overallPass = competencyScores.filter(comp => comp.is_passing).length / competencyScores.length
  const ethicalScore = behavioralScores.find(bs => bs.dimension === 'Ethical Orientation')
  
  if (criticalFails > 0 || (ethicalScore && ethicalScore.level === 'low')) {
    return 'Do Not Hire'
  }
  
  if (overallPass >= 0.9 && ethicalScore?.level === 'high') {
    return 'Strong Hire'
  }
  
  if (overallPass >= 0.75) {
    return 'Hire'
  }
  
  return 'Consider'
}

export interface QuestionScore {
  question_id: number
  question_text: string
  question_type: string
  sequence_order: number
  points_possible: number
  points_awarded: number
  is_correct: boolean
  answer_type: 'mcq' | 'text' | 'likert' | 'video' | 'scenario'
  
  // Part and block information for organization
  part_id: number
  part_title: string
  part_sequence: number
  block_title: string
  block_type: string
  block_sequence: number
  
  // User's answer details
  user_answer: {
    text_answer: string | null
    mcq_option_text: string | null
    mcq_option_selected: number | null
    likert_rating: number | null
    video_response_path: string | null
  }
  
  // Correct answer details
  correct_answer: {
    text: string | null
    mcq_correct_option_text: string | null
  }
} 