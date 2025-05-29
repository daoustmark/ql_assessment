'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, FileText, Video, Star, BarChart3, AlertCircle, MessageSquare } from 'lucide-react'
import { QuestionScore } from '@/types/scoring'
import { TextFormatter } from '@/components/ui/text-formatter'
import { RubricBreakdownDisplay } from '@/components/ui/rubric-breakdown-display'

interface QuestionDetailsProps {
  questions: QuestionScore[]
}

interface QuestionPart {
  part_id: number
  part_title: string
  part_sequence: number
  questions: QuestionScore[]
  totalPoints: number
  earnedPoints: number
  percentage: number
}

export function QuestionDetailsTabbed({ questions }: QuestionDetailsProps) {
  // Group questions by part
  const questionParts: QuestionPart[] = []
  const partMap = new Map<number, QuestionPart>()

  questions.forEach(question => {
    if (!partMap.has(question.part_id)) {
      const part: QuestionPart = {
        part_id: question.part_id,
        part_title: question.part_title,
        part_sequence: question.part_sequence,
        questions: [],
        totalPoints: 0,
        earnedPoints: 0,
        percentage: 0
      }
      partMap.set(question.part_id, part)
      questionParts.push(part)
    }

    const part = partMap.get(question.part_id)!
    part.questions.push(question)
    part.totalPoints += question.points_possible
    part.earnedPoints += question.points_awarded
  })

  // Calculate percentages and sort parts by sequence
  questionParts.forEach(part => {
    part.percentage = part.totalPoints > 0 ? (part.earnedPoints / part.totalPoints) * 100 : 0
    part.questions.sort((a, b) => a.sequence_order - b.sequence_order)
  })
  questionParts.sort((a, b) => a.part_sequence - b.part_sequence)

  // Summary stats
  const totalQuestions = questions.length
  const totalPoints = questions.reduce((sum, q) => sum + q.points_possible, 0)
  const earnedPoints = questions.reduce((sum, q) => sum + q.points_awarded, 0)
  const overallPercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
  const correctCount = questions.filter(q => q.is_correct).length

  const [activeTab, setActiveTab] = useState('summary')

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
      case 'forced_choice':
      case 'ethical_choice':
        return <BarChart3 className="h-4 w-4" />
      case 'essay':
      case 'email_response':
        return <FileText className="h-4 w-4" />
      case 'video_response':
      case 'timed_video_response':
        return <Video className="h-4 w-4" />
      case 'likert_scale':
        return <Star className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getScoreColor = (isCorrect: boolean | null, pointsAwarded: number, pointsPossible: number) => {
    if (isCorrect === true || pointsAwarded === pointsPossible) {
      return 'border-green-200 bg-green-50'
    } else if (isCorrect === false || pointsAwarded === 0) {
      return 'border-red-200 bg-red-50'
    } else if (pointsAwarded > 0) {
      return 'border-yellow-200 bg-yellow-50'
    }
    return 'border-gray-200 bg-gray-50'
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full overflow-x-auto bg-muted p-1 h-auto min-h-[2.5rem]">
          <TabsTrigger value="summary" className="whitespace-nowrap">
            Summary ({totalQuestions} questions)
          </TabsTrigger>
          {questionParts.map(part => (
            <TabsTrigger key={part.part_id} value={`part-${part.part_id}`} className="whitespace-nowrap flex items-center gap-2">
              <span className="truncate max-w-32">{part.part_title}</span>
              <Badge variant="secondary" className="ml-2">
                {part.earnedPoints}/{part.totalPoints}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnedPoints}/{totalPoints}</div>
                <p className="text-xs text-muted-foreground">
                  {overallPercentage.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{correctCount}/{totalQuestions}</div>
                <p className="text-xs text-muted-foreground">
                  {((correctCount / totalQuestions) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessment Parts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{questionParts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Sections completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                {overallPercentage >= 70 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${overallPercentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallPercentage >= 70 ? 'PASS' : 'FAIL'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {overallPercentage.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Parts Overview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Parts Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionParts.map(part => (
                  <div key={part.part_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{part.part_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {part.questions.length} questions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {part.earnedPoints}/{part.totalPoints} points
                      </div>
                      <div className={`text-sm ${part.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {part.percentage.toFixed(1)}%
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab(`part-${part.part_id}`)}
                      className="ml-4 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Part Tabs */}
        {questionParts.map(part => (
          <TabsContent key={part.part_id} value={`part-${part.part_id}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{part.part_title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={part.percentage >= 70 ? "default" : "destructive"}>
                      {part.earnedPoints}/{part.totalPoints} points ({part.percentage.toFixed(1)}%)
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-[800px] overflow-y-auto">
                  {part.questions.map((question, index) => (
                    <Card key={question.question_id} className={getScoreColor(question.is_correct, question.points_awarded, question.points_possible)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getQuestionTypeIcon(question.question_type)}
                            <span className="text-sm font-medium">
                              Question {index + 1}
                            </span>
                            <Badge variant="outline">
                              {question.question_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {question.is_correct === true && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {question.is_correct === false && (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            {question.points_awarded !== null && (
                              <Badge variant={question.is_correct ? "default" : "secondary"}>
                                {question.points_awarded}/{question.points_possible} pts
                              </Badge>
                            )}
                            {question.points_awarded === null && (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Ungraded
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Question:</h4>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <TextFormatter text={question.question_text} />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* User Answer */}
                          <div>
                            <h4 className="font-medium mb-2">User Answer:</h4>
                            <div className="p-3 bg-white rounded-md border">
                              {question.answer_type === 'mcq' && (
                                <div>
                                  <Badge variant="outline" className="mb-2">Multiple Choice</Badge>
                                  <p>{question.user_answer.mcq_option_text || 'No answer selected'}</p>
                                </div>
                              )}
                              {question.answer_type === 'text' && (
                                <div>
                                  <Badge variant="outline" className="mb-2">Text Response</Badge>
                                  {question.user_answer.text_answer ? (
                                    <TextFormatter text={question.user_answer.text_answer} />
                                  ) : (
                                    <p className="text-gray-500 italic">No answer provided</p>
                                  )}
                                </div>
                              )}
                              {question.answer_type === 'likert' && (
                                <div>
                                  <Badge variant="outline" className="mb-2">Rating Scale</Badge>
                                  <p>Rating: {question.user_answer.likert_rating}/5</p>
                                </div>
                              )}
                              {question.answer_type === 'video' && (
                                <div>
                                  <Badge variant="outline" className="mb-2">Video Response</Badge>
                                  {question.user_answer.video_response_path ? (
                                    <p className="text-green-600">✓ Video uploaded</p>
                                  ) : (
                                    <p className="text-gray-500 italic">No video uploaded</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Correct/Expected Answer */}
                          <div>
                            <h4 className="font-medium mb-2">Expected Answer:</h4>
                            <div className="p-3 bg-green-50 rounded-md border border-green-200">
                              {question.answer_type === 'mcq' && (
                                <div>
                                  <Badge variant="outline" className="mb-2">Correct Option</Badge>
                                  <p>{question.correct_answer.mcq_correct_option_text || 'Answer key not available'}</p>
                                </div>
                              )}
                              {(question.answer_type === 'text' || question.answer_type === 'video') && (
                                <div>
                                  <Badge variant="outline" className="mb-2">Subjective</Badge>
                                  {question.correct_answer.text ? (
                                    <TextFormatter text={question.correct_answer.text} />
                                  ) : (
                                    <p className="text-gray-600 italic">
                                      Requires manual evaluation
                                    </p>
                                  )}
                                </div>
                              )}
                              {question.answer_type === 'likert' && (
                                <div>
                                  <Badge variant="outline" className="mb-2">Likert Scale</Badge>
                                  <p className="text-gray-600 italic">All valid responses (1-5) receive full credit</p>
                                </div>
                              )}
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 