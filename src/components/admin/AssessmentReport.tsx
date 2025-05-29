'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { generateAssessmentReport, generateStrengthsWeaknessesAnalysis } from '@/lib/supabase/scoring'
import { AssessmentReport as AssessmentReportType, StrengthsWeaknessesAnalysis, COMPETENCY_DEFINITIONS } from '@/types/scoring'
import { TextFormatter } from '@/components/ui/text-formatter'
import { CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown, FileText, Video, MessageSquare } from 'lucide-react'
import { 
  EnhancedBehavioralScore,
  HonestyAssessment,
  IdentifiedRedFlag
} from '@/types/scoring'
import { 
  calculateEnhancedBehavioralScores,
  calculateHonestyAssessment 
} from '@/lib/supabase/scoring'
import { 
  AlertTriangle, 
  Eye,
  Shield,
  Brain,
  Users,
  Heart,
  Scale,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import { RubricBreakdownDisplay } from '@/components/ui/rubric-breakdown-display'

interface AssessmentReportProps {
  attemptId: number
}

// New interface for detailed breakdown
interface BehavioralBreakdown {
  dimension: string
  likert_details: {
    questions_used: { number: number; text: string; rating: number | null }[]
    total_score: number
    max_score: number
    percentage: number
  }
  ethical_details: {
    scenarios_evaluated: { 
      scenario: string
      expected_choice: string
      actual_choice: string | null
      aligned: boolean
      weight: number
    }[]
    alignment_score: number
  }
  consistency_details: {
    checks_performed: {
      name: string
      description: string
      likert_avg: number
      ethical_avg: number
      expected_correlation: string
      actual_correlation: number
      variance: number
    }[]
    overall_consistency: number
  }
}

export function AssessmentReport({ attemptId }: AssessmentReportProps) {
  const [report, setReport] = useState<AssessmentReportType | null>(null)
  const [analysis, setAnalysis] = useState<StrengthsWeaknessesAnalysis | null>(null)
  const [behavioralBreakdowns, setBehavioralBreakdowns] = useState<BehavioralBreakdown[]>([])
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [attemptId])

  const loadReport = async () => {
    try {
      setLoading(true)
      const [reportData, analysisData] = await Promise.all([
        generateAssessmentReport(attemptId),
        generateStrengthsWeaknessesAnalysis(attemptId)
      ])
      setReport(reportData)
      setAnalysis(analysisData)
      
      // Load detailed breakdowns
      if (reportData.enhanced_behavioral_scores) {
        const breakdowns = await loadBehavioralBreakdowns(attemptId)
        setBehavioralBreakdowns(breakdowns)
      }
    } catch (err) {
      console.error('Error loading assessment report:', err)
      setError('Failed to load assessment report')
    } finally {
      setLoading(false)
    }
  }

  const loadBehavioralBreakdowns = async (attemptId: number): Promise<BehavioralBreakdown[]> => {
    // This function will fetch detailed data about how each score was calculated
    // For now, we'll create a simplified version - in production you'd want to 
    // enhance the scoring functions to return this detailed data
    
    try {
      const { supabase } = await import('@/lib/supabase/client')
      
      // Get all answers for this attempt
      const { data: answers, error } = await supabase
        .from('user_answers')
        .select(`
          question_id,
          likert_rating,
          mcq_option_id,
          questions!inner (
            sequence_order,
            question_type,
            question_text
          ),
          mcq_options (
            option_text,
            sequence_order
          )
        `)
        .eq('attempt_id', attemptId)

      if (error) throw error

      // Map ethical scenarios to their actual question sequence numbers
      // Based on the assessment structure we discovered
      const ethicalScenarioMapping: { [key: string]: number } = {
        'Questionable Discount Program': 1,  // First question about discount program
        'The Overvalued Testimonials': 2,    // Question about testimonials  
        'The Self-Competing Seller': 3,      // Question about competing seller
        'The Review Incentive Program': 4,   // Question about review incentives
        'The Algorithm Insight': 5,          // Question about algorithm insights
        'The Aging Content': 6,              // Question about aging content
        'The Unverifiable Customer List': 7, // Question about customer lists
        'The Keyword Cannibalization': 8,    // Question about keyword issues
        "The Founder's Necessity": 9,        // Question about founder situation
        'The Shifting Compliance Landscape': 10, // Question about compliance
        'Customer Concentration Discrepancy': 11, // Question about customer concentration
        'Multiple Client Conflict': 12       // Question about client conflicts
      }

      // Get ethical choices using the direct mapping
      const ethicalChoices = new Map<string, string>()
      
      Object.entries(ethicalScenarioMapping).forEach(([scenarioName, questionSequence]) => {
        const answer = answers.find(a => 
          ((a.questions as any).sequence_order === questionSequence) && 
          ((a.questions as any).question_type === 'multiple_choice') &&
          a.mcq_option_id !== null
        )
        
        if (answer && answer.mcq_options) {
          const option = answer.mcq_options as any
          const choice = option.sequence_order === 1 ? 'A' : 'B'
          ethicalChoices.set(scenarioName, choice)
        }
      })

      console.log('Ethical choices found:', Object.fromEntries(ethicalChoices))

      // Import BEHAVIORAL_DIMENSIONS
      const { BEHAVIORAL_DIMENSIONS } = await import('@/types/scoring')

      // Build breakdowns for each dimension
      const breakdowns: BehavioralBreakdown[] = []

      for (const dimension of BEHAVIORAL_DIMENSIONS) {
        if (!dimension.likert_question_numbers || !dimension.ethical_scenario_indicators) {
          continue
        }

        // Likert details
        const likertQuestions = dimension.likert_question_numbers.map(questionNum => {
          const answer = answers.find(a => 
            ((a.questions as any).sequence_order === questionNum) && 
            ((a.questions as any).question_type === 'likert_scale')
          )
          return {
            number: questionNum,
            text: answer ? ((answer.questions as any).question_text || '').substring(0, 100) + '...' : 'Question not found',
            rating: answer?.likert_rating || null
          }
        })

        const totalLikertScore = likertQuestions.reduce((sum, q) => sum + (q.rating || 0), 0)
        const maxLikertScore = likertQuestions.length * 5
        const likertPercentage = maxLikertScore > 0 ? (totalLikertScore / maxLikertScore) * 100 : 0

        // Ethical details
        const ethicalScenarios = dimension.ethical_scenario_indicators.map(indicator => {
          const actualChoice = ethicalChoices.get(indicator.scenario_description)
          return {
            scenario: indicator.scenario_description,
            expected_choice: indicator.ethical_choice,
            actual_choice: actualChoice || null,
            aligned: actualChoice === indicator.ethical_choice,
            weight: indicator.weight
          }
        })

        const totalWeight = ethicalScenarios.reduce((sum, s) => sum + s.weight, 0)
        const alignedWeight = ethicalScenarios.reduce((sum, s) => sum + (s.aligned ? s.weight : 0), 0)
        const ethicalAlignment = totalWeight > 0 ? alignedWeight / totalWeight : 1.0

        // Consistency details (simplified)
        const consistencyChecks = (dimension.consistency_checks || []).map(check => {
          const likertAvg = likertQuestions
            .filter(q => check.likert_questions.includes(q.number))
            .reduce((sum, q, _, arr) => sum + (q.rating || 3) / arr.length, 0)

          const ethicalAvg = ethicalScenarios
            .filter(s => check.ethical_scenarios.some(scenario => s.scenario.includes(scenario)))
            .reduce((sum, s, _, arr) => sum + (s.aligned ? 1 : 0) / arr.length, 0)

          const expectedCorr = check.expected_correlation === 'positive' ? 0.7 : -0.7
          const actualCorr = 1 - Math.abs((likertAvg / 5) - ethicalAvg)
          
          return {
            name: check.name,
            description: check.description,
            likert_avg: likertAvg,
            ethical_avg: ethicalAvg,
            expected_correlation: check.expected_correlation,
            actual_correlation: actualCorr,
            variance: Math.abs(actualCorr - Math.abs(expectedCorr))
          }
        })

        const overallConsistency = consistencyChecks.length > 0 
          ? consistencyChecks.reduce((sum, c) => sum + c.actual_correlation, 0) / consistencyChecks.length
          : 1.0

        breakdowns.push({
          dimension: dimension.name,
          likert_details: {
            questions_used: likertQuestions,
            total_score: totalLikertScore,
            max_score: maxLikertScore,
            percentage: likertPercentage
          },
          ethical_details: {
            scenarios_evaluated: ethicalScenarios,
            alignment_score: ethicalAlignment
          },
          consistency_details: {
            checks_performed: consistencyChecks,
            overall_consistency: overallConsistency
          }
        })
      }

      return breakdowns
    } catch (error) {
      console.error('Error loading behavioral breakdowns:', error)
      return []
    }
  }

  const toggleDimensionExpansion = (dimensionName: string) => {
    const newExpanded = new Set(expandedDimensions)
    if (newExpanded.has(dimensionName)) {
      newExpanded.delete(dimensionName)
    } else {
      newExpanded.add(dimensionName)
    }
    setExpandedDimensions(newExpanded)
  }

  const getBehavioralBreakdown = (dimensionName: string): BehavioralBreakdown | null => {
    return behavioralBreakdowns.find(b => b.dimension === dimensionName) || null
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !report) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'No report data available'}</AlertDescription>
      </Alert>
    )
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Hire': return 'bg-green-500'
      case 'Hire': return 'bg-blue-500'
      case 'Consider': return 'bg-yellow-500'
      case 'Do Not Hire': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCompetencyLevelColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Fair': return 'bg-yellow-100 text-yellow-800'
      case 'Needs Development': return 'bg-orange-100 text-orange-800'
      case 'Inadequate': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'low': return <Eye className="h-4 w-4 text-blue-600" />
      default: return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  const getBehavioralIcon = (dimension: string) => {
    switch (dimension) {
      case 'Ethical Orientation': return <Scale className="h-5 w-5" />
      case 'Communication Effectiveness': return <Users className="h-5 w-5" />
      case 'Business Acumen': return <Brain className="h-5 w-5" />
      case 'Self-Management': return <Heart className="h-5 w-5" />
      case 'Conflict Resolution': return <Shield className="h-5 w-5" />
      default: return <CheckCircle className="h-5 w-5" />
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{report.candidate_name}</CardTitle>
              <CardDescription className="text-lg mt-1">
                {report.assessment_title}
              </CardDescription>
              <p className="text-sm text-gray-500 mt-2">
                Completed: {formatDate(report.completed_at)}
              </p>
            </div>
            <Badge className={`${getRecommendationColor(report.overall_recommendation)} text-white text-lg px-4 py-2`}>
              {report.overall_recommendation}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {report.overall_percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
              <div className="text-xs text-gray-500 mt-1">
                {report.total_score} / {report.total_possible} points
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${report.overall_pass ? 'text-green-600' : 'text-red-600'}`}>
                {report.overall_pass ? 'PASS' : 'FAIL'}
              </div>
              <div className="text-sm text-gray-600">Assessment Result</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {report.competency_scores.filter(c => c.is_passing).length} / {report.competency_scores.length}
              </div>
              <div className="text-sm text-gray-600">Competencies Passed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="integrity">Integrity</TabsTrigger>
          <TabsTrigger value="questions">Question Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {report.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No significant strengths identified</p>
                )}
              </CardContent>
            </Card>

            {/* Development Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 text-orange-600 mr-2" />
                  Development Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.development_areas.length > 0 ? (
                  <ul className="space-y-2">
                    {report.development_areas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No significant development areas identified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competencies" className="space-y-4">
          <div className="grid gap-4">
            {report.competency_scores.map((competency) => (
              <Card key={competency.area}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{competency.name}</CardTitle>
                      <CardDescription>
                        {competency.question_count} questions • {competency.points_earned} / {competency.points_possible} points
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getCompetencyLevelColor(competency.level)}>
                        {competency.level}
                      </Badge>
                      {competency.is_passing ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score: {competency.percentage.toFixed(1)}%</span>
                      <span className="text-gray-500">
                        Passing: {COMPETENCY_DEFINITIONS.find(d => d.area === competency.area)?.passing_threshold || 70}%
                      </span>
                    </div>
                    <Progress value={competency.percentage} className="h-2" />
                    {competency.recommendations && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">Recommendations:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {competency.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-4">
          <div className="grid gap-4">
            {report.enhanced_behavioral_scores ? (
              report.enhanced_behavioral_scores.map((behavioral) => {
                const breakdown = getBehavioralBreakdown(behavioral.dimension)
                const isExpanded = expandedDimensions.has(behavioral.dimension)
                
                return (
                  <Card key={behavioral.dimension}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center">
                          {getBehavioralIcon(behavioral.dimension)}
                          <span className="ml-2">{behavioral.dimension}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${
                            behavioral.level === 'high' ? 'bg-green-100 text-green-800' :
                            behavioral.level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {behavioral.level.toUpperCase()}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDimensionExpansion(behavioral.dimension)}
                            className="ml-2"
                          >
                            <Info className="h-4 w-4 mr-1" />
                            {isExpanded ? 'Hide Details' : 'View Details'}
                            {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Summary Scores */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Self-Assessment Score:</span>
                              <span>{behavioral.likert_percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={behavioral.likert_percentage} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Ethical Alignment:</span>
                              <span>{(behavioral.ethical_alignment_score * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={behavioral.ethical_alignment_score * 100} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Consistency:</span>
                              <span>{(behavioral.consistency_score * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={behavioral.consistency_score * 100} className="h-2" />
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">{behavioral.interpretation}</p>

                        {/* Expandable Detailed Breakdown */}
                        {isExpanded && breakdown && (
                          <div className="mt-6 border-t pt-4 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                Detailed Score Breakdown
                              </h4>
                              
                              {/* Likert Score Details */}
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-900 mb-2">Self-Assessment Questions Used:</h5>
                                <div className="space-y-2">
                                  {breakdown.likert_details.questions_used.map((question, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-sm bg-white p-2 rounded">
                                      <span className="flex-1">
                                        <strong>Q{question.number}:</strong> {question.text}
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {question.rating ? `${question.rating}/5` : 'No answer'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-sm">
                                  <strong>Total:</strong> {breakdown.likert_details.total_score} / {breakdown.likert_details.max_score} points 
                                  ({breakdown.likert_details.percentage.toFixed(1)}%)
                                </div>
                              </div>

                              {/* Ethical Alignment Details */}
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-900 mb-2">Ethical Scenarios Evaluated:</h5>
                                <div className="space-y-2">
                                  {breakdown.ethical_details.scenarios_evaluated.map((scenario, idx) => (
                                    <div key={idx} className={`text-sm bg-white p-2 rounded border-l-4 ${
                                      scenario.aligned ? 'border-green-500' : 'border-red-500'
                                    }`}>
                                      <div className="flex justify-between items-start">
                                        <span className="flex-1">
                                          <strong>{scenario.scenario}</strong>
                                        </span>
                                        <div className="ml-2 text-right">
                                          <div>Expected: <strong>{scenario.expected_choice}</strong></div>
                                          <div>Actual: <strong>{scenario.actual_choice || 'No answer'}</strong></div>
                                          <div className={scenario.aligned ? 'text-green-600' : 'text-red-600'}>
                                            {scenario.aligned ? '✓ Aligned' : '✗ Misaligned'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-sm">
                                  <strong>Alignment Score:</strong> {(breakdown.ethical_details.alignment_score * 100).toFixed(1)}%
                                </div>
                              </div>

                              {/* Consistency Analysis Details */}
                              {breakdown.consistency_details.checks_performed.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Consistency Analysis:</h5>
                                  <div className="space-y-2">
                                    {breakdown.consistency_details.checks_performed.map((check, idx) => (
                                      <div key={idx} className="text-sm bg-white p-2 rounded">
                                        <div className="font-medium">{check.name}</div>
                                        <div className="text-gray-600 text-xs mb-1">{check.description}</div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>Likert Average: {check.likert_avg.toFixed(1)}/5</div>
                                          <div>Ethical Average: {(check.ethical_avg * 100).toFixed(1)}%</div>
                                          <div>Expected Correlation: {check.expected_correlation}</div>
                                          <div>Actual Correlation: {(check.actual_correlation * 100).toFixed(1)}%</div>
                                        </div>
                                        <div className={`mt-1 text-xs ${
                                          check.variance < 0.2 ? 'text-green-600' : 
                                          check.variance < 0.4 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                          Variance: {(check.variance * 100).toFixed(1)}% 
                                          {check.variance < 0.2 ? ' (Good consistency)' : 
                                           check.variance < 0.4 ? ' (Moderate consistency)' : ' (Poor consistency)'}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-sm">
                                    <strong>Overall Consistency:</strong> {(breakdown.consistency_details.overall_consistency * 100).toFixed(1)}%
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Red Flags */}
                        {behavioral.red_flags.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-red-700 mb-2">Concerns:</h5>
                            {behavioral.red_flags.map((flag, index) => (
                              <Alert key={index} className="mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>{flag.description}</strong>
                                  {flag.evidence.length > 0 && (
                                    <ul className="mt-1 ml-4 list-disc">
                                      {flag.evidence.map((evidence, i) => (
                                        <li key={i} className="text-xs">{evidence}</li>
                                      ))}
                                    </ul>
                                  )}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        )}

                        {/* Recommendations */}
                        {behavioral.recommendations.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-blue-700 mb-2">Recommendations:</h5>
                            <ul className="space-y-1">
                              {behavioral.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              // Fallback to basic behavioral scores
              report.behavioral_scores.map((behavioral) => (
                <Card key={behavioral.dimension}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{behavioral.dimension}</CardTitle>
                      <Badge className={`${
                        behavioral.level === 'high' ? 'bg-green-100 text-green-800' :
                        behavioral.level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {behavioral.level.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score: {behavioral.score} / {behavioral.max_score}</span>
                        <span>{behavioral.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={behavioral.percentage} className="h-2" />
                      <p className="text-sm text-gray-600 mt-2">{behavioral.interpretation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          {report.honesty_assessment ? (
            <>
              {/* Overall Integrity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    Integrity Assessment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {report.honesty_assessment.overall_integrity_score.toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-600">Integrity Score</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        report.honesty_assessment.social_desirability_bias === 'low' ? 'text-green-600' :
                        report.honesty_assessment.social_desirability_bias === 'high' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {report.honesty_assessment.social_desirability_bias.toUpperCase()}
                      </div>
                      <p className="text-sm text-gray-600">Social Desirability Bias</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        report.honesty_assessment.consistency_rating === 'high' ? 'text-green-600' :
                        report.honesty_assessment.consistency_rating === 'concerning' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {report.honesty_assessment.consistency_rating.toUpperCase()}
                      </div>
                      <p className="text-sm text-gray-600">Consistency Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Red Flags */}
              {report.honesty_assessment.red_flags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Integrity Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.honesty_assessment.red_flags.map((flag, index) => (
                        <div key={index} className="border-l-4 border-red-500 pl-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              {getSeverityIcon(flag.severity)}
                              <h4 className="font-medium ml-2">{flag.category}</h4>
                            </div>
                            <Badge variant="outline" className={`${
                              flag.severity === 'high' ? 'border-red-500 text-red-700' :
                              flag.severity === 'medium' ? 'border-yellow-500 text-yellow-700' :
                              'border-blue-500 text-blue-700'
                            }`}>
                              {flag.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{flag.description}</p>
                          {flag.evidence.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600">Evidence:</p>
                              <ul className="list-disc list-inside ml-2">
                                {flag.evidence.map((evidence, i) => (
                                  <li key={i} className="text-xs text-gray-600">{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-700">
                              <strong>Recommendation:</strong> {flag.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Ethical Consistency */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Ethical Consistency</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">
                          <strong>Pattern Analysis:</strong> {report.honesty_assessment.detailed_analysis.ethical_consistency.scenario_pattern_analysis}
                        </p>
                        <div className="mt-2">
                          <span className="text-sm font-medium">Likert-Ethical Alignment: </span>
                          <span className="text-sm">
                            {(report.honesty_assessment.detailed_analysis.ethical_consistency.likert_ethical_alignment * 100).toFixed(1)}%
                          </span>
                        </div>
                        {report.honesty_assessment.detailed_analysis.ethical_consistency.concerning_disconnects.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-red-700">Concerning Disconnects:</p>
                            <ul className="list-disc list-inside ml-2">
                              {report.honesty_assessment.detailed_analysis.ethical_consistency.concerning_disconnects.map((disconnect, i) => (
                                <li key={i} className="text-sm text-red-600">{disconnect}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Response Patterns */}
                    {report.honesty_assessment.detailed_analysis.likert_patterns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Response Patterns</h4>
                        <div className="space-y-2">
                          {report.honesty_assessment.detailed_analysis.likert_patterns.map((pattern, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{pattern.pattern_type.replace('_', ' ').toUpperCase()}</span>
                                <Badge variant="outline" className={`${
                                  pattern.severity === 'high' ? 'border-red-500 text-red-700' :
                                  pattern.severity === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                  'border-blue-500 text-blue-700'
                                }`}>
                                  {pattern.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Self-Awareness Indicators */}
                    {report.honesty_assessment.detailed_analysis.self_awareness_indicators.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Self-Awareness Indicators</h4>
                        <div className="space-y-2">
                          {report.honesty_assessment.detailed_analysis.self_awareness_indicators.map((indicator, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{indicator.indicator}</span>
                                <Badge variant="outline" className={`${
                                  indicator.rating === 'high' ? 'border-green-500 text-green-700' :
                                  indicator.rating === 'low' ? 'border-red-500 text-red-700' :
                                  'border-yellow-500 text-yellow-700'
                                }`}>
                                  {indicator.rating}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{indicator.evidence}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  Integrity assessment not available for this report.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="grid gap-4">
            {report.question_details.map((question, index) => (
              <Card key={question.question_id} className={`border-l-4 ${question.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">Question {question.sequence_order || index + 1}</span>
                        {question.answer_type === 'mcq' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                        {question.answer_type === 'text' && <FileText className="h-4 w-4 text-green-500" />}
                        {question.answer_type === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                        {question.answer_type === 'likert' && <div className="h-4 w-4 bg-orange-500 rounded-full" />}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {question.question_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {question.points_awarded} / {question.points_possible} points
                        </div>
                        <div className="text-xs text-gray-500">
                          {question.points_possible > 0 ? Math.round((question.points_awarded / question.points_possible) * 100) : 0}%
                        </div>
                      </div>
                      {question.is_correct ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <TextFormatter text={question.question_text} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* User's Answer */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                      <div className={`p-3 rounded-md ${question.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                        {question.user_answer?.mcq_option_text && (
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">Selected:</span>
                            <span>{question.user_answer.mcq_option_text}</span>
                          </div>
                        )}
                        
                        {question.user_answer?.text_answer && (
                          <div>
                            <TextFormatter text={question.user_answer.text_answer} />
                          </div>
                        )}
                        
                        {question.user_answer?.likert_rating && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Rating:</span>
                            <Badge variant="secondary">
                              {question.user_answer.likert_rating}/5
                            </Badge>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <div
                                  key={rating}
                                  className={`w-3 h-3 rounded-full ${
                                    rating <= (question.user_answer?.likert_rating || 0)
                                      ? 'bg-blue-500'
                                      : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {question.user_answer?.video_response_path && (
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4" />
                            <span className="font-medium">Video Response:</span>
                            <Badge variant="secondary">Uploaded</Badge>
                          </div>
                        )}

                        {!question.user_answer?.mcq_option_text && 
                         !question.user_answer?.text_answer && 
                         !question.user_answer?.likert_rating && 
                         !question.user_answer?.video_response_path && (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <XCircle className="h-4 w-4" />
                            <span className="italic">No answer provided</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Expected Answer:</h4>
                      <div className="bg-blue-50 p-3 rounded-md">
                        {question.correct_answer?.mcq_correct_option_text && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Correct:</span>
                            <span>{question.correct_answer.mcq_correct_option_text}</span>
                          </div>
                        )}
                        
                        {question.correct_answer?.text && (
                          <div>
                            <TextFormatter text={question.correct_answer.text} />
                          </div>
                        )}
                        
                        {question.question_type === 'likert_scale' && !question.correct_answer?.text && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="italic">Subjective rating - no specific correct answer</span>
                          </div>
                        )}
                        
                        {(question.question_type === 'video_response' || question.question_type === 'timed_video_response') && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="italic">Subjective response - manually graded</span>
                          </div>
                        )}

                        {!question.correct_answer?.mcq_correct_option_text && 
                         !question.correct_answer?.text && 
                         question.question_type !== 'likert_scale' &&
                         question.question_type !== 'video_response' &&
                         question.question_type !== 'timed_video_response' && (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="italic">No correct answer defined</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Rubric Breakdown for Manual Questions */}
                  {(question.question_type === 'email_response' || 
                    question.question_type === 'video_response' || 
                    question.question_type === 'essay' ||
                    question.question_type === 'scenario_response' ||
                    question.question_type === 'timed_scenario') && 
                    question.points_awarded > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Scoring Breakdown
                      </h4>
                      <RubricBreakdownDisplay 
                        questionType={question.question_type}
                        totalPoints={question.points_awarded}
                        maxPoints={question.points_possible}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {analysis && (
            <>
              {/* Development Priorities */}
              <Card>
                <CardHeader>
                  <CardTitle>Development Priorities</CardTitle>
                  <CardDescription>
                    Action items prioritized by impact on role performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.development_priorities.map((priority, index) => (
                      <div key={index} className="border-l-4 border-l-blue-500 pl-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            priority.priority === 'High' ? 'destructive' :
                            priority.priority === 'Medium' ? 'default' : 'secondary'
                          }>
                            {priority.priority} Priority
                          </Badge>
                          <span className="font-medium">{priority.area}</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {priority.specific_actions.map((action, actionIndex) => (
                            <li key={actionIndex}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <h4 className="font-medium text-green-700">{strength.area}</h4>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {strength.evidence.map((evidence, evidenceIndex) => (
                            <li key={evidenceIndex}>• {evidence}</li>
                          ))}
                        </ul>
                        <p className="text-sm text-green-600 mt-2 italic">{strength.impact}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Weaknesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <h4 className="font-medium text-red-700">{weakness.area}</h4>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {weakness.evidence.map((evidence, evidenceIndex) => (
                            <li key={evidenceIndex}>• {evidence}</li>
                          ))}
                        </ul>
                        <p className="text-sm text-red-600 mt-2 italic">{weakness.impact}</p>
                        {weakness.recommendations.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium">Recommendations:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {weakness.recommendations.map((rec, recIndex) => (
                                <li key={recIndex}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AssessmentReport 