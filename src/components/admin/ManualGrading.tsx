'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getUngradedResponses, getUngradedResponsesForAttempt, updateManualScore } from '@/lib/supabase/scoring'
import { 
  EMAIL_RESPONSE_RUBRIC, 
  VIDEO_RESPONSE_RUBRIC, 
  ESSAY_RESPONSE_RUBRIC, 
  ETHICAL_SCENARIO_RUBRIC,
  NEGOTIATION_SCENARIO_RUBRIC,
  QuestionRubric,
  ScoringCriterion 
} from '@/types/scoring'
import { TextFormatter } from '@/components/ui/text-formatter'
import { FileText, Video, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'

interface ManualGradingProps {
  assessmentId?: number
  attemptId?: number
}

interface UngradedResponse {
  id: number
  text_answer: string | null
  video_response_path: string | null
  attempt_id: number
  questions: {
    id: number
    question_text: string
    question_type: string
    correct_answer: string | null
    points: number
  }
  assessment_attempts: {
    invitee_name: string | null
    invitee_email: string
  }
}

interface CriterionScore {
  criterion_name: string
  points: number
  max_points: number
  notes?: string
}

export function ManualGrading({ assessmentId, attemptId }: ManualGradingProps) {
  const [ungradedResponses, setUngradedResponses] = useState<UngradedResponse[]>([])
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0)
  const [criterionScores, setCriterionScores] = useState<CriterionScore[]>([])
  const [generalNotes, setGeneralNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUngradedResponses()
  }, [assessmentId, attemptId])

  useEffect(() => {
    if (ungradedResponses.length > 0) {
      initializeCriterionScores()
    }
  }, [currentResponseIndex, ungradedResponses])

  const loadUngradedResponses = async () => {
    try {
      setLoading(true)
      let responses
      
      if (attemptId) {
        // If attemptId is provided, get responses for that specific attempt
        responses = await getUngradedResponsesForAttempt(attemptId)
      } else if (assessmentId) {
        // If only assessmentId is provided, get responses for all attempts of that assessment
        responses = await getUngradedResponses(assessmentId)
      } else {
        throw new Error('Either assessmentId or attemptId must be provided')
      }
      
      setUngradedResponses(responses as any) // Type assertion to handle complex nested types from Supabase
    } catch (err) {
      console.error('Error loading ungraded responses:', err)
      setError('Failed to load ungraded responses')
    } finally {
      setLoading(false)
    }
  }

  const getRubricForQuestionType = (questionType: string): QuestionRubric | null => {
    switch (questionType) {
      case 'email_response':
        return EMAIL_RESPONSE_RUBRIC
      case 'video_response':
      case 'timed_video_response':
        return VIDEO_RESPONSE_RUBRIC
      case 'essay':
        return ESSAY_RESPONSE_RUBRIC
      case 'scenario_response':
        return ETHICAL_SCENARIO_RUBRIC
      case 'timed_scenario':
        return NEGOTIATION_SCENARIO_RUBRIC
      default:
        return null
    }
  }

  const initializeCriterionScores = () => {
    if (ungradedResponses.length === 0) return

    const currentResponse = ungradedResponses[currentResponseIndex]
    const rubric = getRubricForQuestionType((currentResponse.questions as any).question_type)
    
    if (rubric) {
      const initialScores = rubric.criteria.map(criterion => ({
        criterion_name: criterion.name,
        points: 0,
        max_points: criterion.max_points,
        notes: ''
      }))
      setCriterionScores(initialScores)
    } else {
      setCriterionScores([])
    }
    setGeneralNotes('')
  }

  const updateCriterionScore = (criterionName: string, points: number) => {
    setCriterionScores(prev => 
      prev.map(score => 
        score.criterion_name === criterionName 
          ? { ...score, points } 
          : score
      )
    )
  }

  const updateCriterionNotes = (criterionName: string, notes: string) => {
    setCriterionScores(prev => 
      prev.map(score => 
        score.criterion_name === criterionName 
          ? { ...score, notes } 
          : score
      )
    )
  }

  const calculateTotalScore = () => {
    return criterionScores.reduce((total, score) => total + score.points, 0)
  }

  const calculateMaxScore = () => {
    return criterionScores.reduce((total, score) => total + score.max_points, 0)
  }

  const submitGrade = async () => {
    if (ungradedResponses.length === 0) return

    try {
      setGrading(true)
      const currentResponse = ungradedResponses[currentResponseIndex]
      const totalScore = calculateTotalScore()
      const maxScore = calculateMaxScore()
      const isCorrect = maxScore > 0 ? (totalScore / maxScore) >= 0.6 : false // 60% threshold

      await updateManualScore(
        currentResponse.id,
        totalScore,
        isCorrect,
        'admin' // In a real app, this would be the current user's ID
      )

      // Remove graded response from list
      const newResponses = ungradedResponses.filter((_, index) => index !== currentResponseIndex)
      setUngradedResponses(newResponses)
      
      // Adjust current index if necessary
      if (currentResponseIndex >= newResponses.length && newResponses.length > 0) {
        setCurrentResponseIndex(newResponses.length - 1)
      } else if (newResponses.length === 0) {
        setCurrentResponseIndex(0)
      }

    } catch (err) {
      console.error('Error submitting grade:', err)
      setError('Failed to submit grade')
    } finally {
      setGrading(false)
    }
  }

  const getQuestionTypeIcon = (questionType: string) => {
    switch (questionType) {
      case 'email_response':
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case 'video_response':
      case 'timed_video_response':
        return <Video className="h-5 w-5 text-purple-500" />
      case 'essay':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'timed_scenario':
        return <Clock className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (ungradedResponses.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            All Responses Graded
          </CardTitle>
          <CardDescription>
            There are no ungraded subjective responses for this assessment.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const currentResponse = ungradedResponses[currentResponseIndex]
  const rubric = getRubricForQuestionType((currentResponse.questions as any).question_type)
  const totalScore = calculateTotalScore()
  const maxScore = calculateMaxScore()
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                {getQuestionTypeIcon((currentResponse.questions as any).question_type)}
                <span className="ml-2">Manual Grading</span>
                {attemptId && (
                  <Badge variant="secondary" className="ml-2">
                    Attempt #{attemptId}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {attemptId ? (
                  <>Response {currentResponseIndex + 1} of {ungradedResponses.length} ungraded for this attempt</>
                ) : (
                  <>Response {currentResponseIndex + 1} of {ungradedResponses.length} ungraded across all attempts</>
                )}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {((currentResponse.questions as any).question_type as string).replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium">Candidate</h4>
              <p className="text-sm text-gray-600">
                {(currentResponse.assessment_attempts as any).invitee_name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">
                {(currentResponse.assessment_attempts as any).invitee_email}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Question Type</h4>
              <p className="text-sm text-gray-600">
                {((currentResponse.questions as any).question_type as string).replace('_', ' ')}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Max Points</h4>
              <p className="text-sm text-gray-600">
                {(currentResponse.questions as any).points} points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question & Response */}
        <Card>
          <CardHeader>
            <CardTitle>Question & Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Question:</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <TextFormatter text={(currentResponse.questions as any).question_text} />
              </div>
            </div>

            {(currentResponse.questions as any).correct_answer && (
              <div>
                <h4 className="font-medium mb-2">Expected Answer/Key Points:</h4>
                <div className="bg-blue-50 p-3 rounded-md">
                  <TextFormatter text={(currentResponse.questions as any).correct_answer} />
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Candidate Response:</h4>
              {currentResponse.text_answer ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <TextFormatter text={currentResponse.text_answer} />
                </div>
              ) : currentResponse.video_response_path ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <video 
                    controls 
                    className="w-full max-w-md mx-auto"
                    src={currentResponse.video_response_path}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No response provided</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grading Rubric */}
        <Card>
          <CardHeader>
            <CardTitle>Grading Rubric</CardTitle>
            <CardDescription>
              Score each criterion based on the response quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rubric ? (
              <div className="space-y-6">
                {rubric.criteria.map((criterion, index) => (
                  <div key={criterion.name} className="border-b pb-4 last:border-b-0">
                    <div className="mb-3">
                      <h4 className="font-medium">{criterion.name}</h4>
                      <p className="text-sm text-gray-600">{criterion.description}</p>
                      <p className="text-xs text-gray-500">Max: {criterion.max_points} points</p>
                    </div>

                    <RadioGroup
                      value={criterionScores[index]?.points.toString() || '0'}
                      onValueChange={(value) => updateCriterionScore(criterion.name, parseInt(value))}
                    >
                      {criterion.levels.map((level) => (
                        <div key={level.points} className="flex items-start space-x-2">
                          <RadioGroupItem value={level.points.toString()} id={`${criterion.name}-${level.points}`} />
                          <Label htmlFor={`${criterion.name}-${level.points}`} className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{level.label}</span>
                              <span className="text-sm text-gray-500">{level.points} pts</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <Textarea
                      placeholder="Notes for this criterion..."
                      value={criterionScores[index]?.notes || ''}
                      onChange={(e) => updateCriterionNotes(criterion.name, e.target.value)}
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                ))}

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">General Notes</h4>
                  <Textarea
                    placeholder="Overall feedback and comments..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Score:</span>
                    <span className="text-lg font-bold">
                      {totalScore} / {maxScore} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No rubric available for this question type. Manual scoring will be required.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation & Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentResponseIndex(Math.max(0, currentResponseIndex - 1))}
                disabled={currentResponseIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentResponseIndex(Math.min(ungradedResponses.length - 1, currentResponseIndex + 1))}
                disabled={currentResponseIndex === ungradedResponses.length - 1}
              >
                Next
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              {currentResponseIndex + 1} of {ungradedResponses.length}
            </div>

            <Button
              onClick={submitGrade}
              disabled={grading || (rubric ? totalScore === 0 : false)}
              className="bg-green-600 hover:bg-green-700"
            >
              {grading ? 'Submitting...' : 'Submit Grade'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ManualGrading 