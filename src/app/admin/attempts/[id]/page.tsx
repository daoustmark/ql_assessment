'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  User,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Play,
  Pause,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { getAttemptWithDetails } from '@/lib/supabase/admin-queries'
import { scoreObjectiveQuestions, calculateAttemptScore, getAssessmentScoringStatus, generateAssessmentReport } from '@/lib/supabase/scoring'
import { AssessmentReport } from '@/components/admin/AssessmentReport'
import { ManualGrading } from '@/components/admin/ManualGrading'
import { QuestionDetailsTabbed } from '@/components/admin/QuestionDetailsTabbed'
import { TextFormatter } from '@/components/ui/text-formatter'
import { notFound } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function AttemptDetailPage({ params }: PageProps) {
  const [attempt, setAttempt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [scoring, setScoring] = useState(false)
  const [scoringStatus, setScoringStatus] = useState<any>(null)
  const [questionDetails, setQuestionDetails] = useState<any>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'overview')

  useEffect(() => {
    async function loadAttempt() {
      try {
        const { id } = await params
        const attemptId = parseInt(id)
        const attemptData = await getAttemptWithDetails(attemptId)
        
        if (!attemptData) {
          notFound()
        }
        
        setAttempt(attemptData)

        // Load scoring status if completed
        if (attemptData.completed_at) {
          try {
            const status = await getAssessmentScoringStatus(attemptId)
            setScoringStatus(status)
          } catch (error) {
            console.error('Error loading scoring status:', error)
          }
        }
      } catch (error) {
        console.error('Error loading attempt:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAttempt()
  }, [params])

  // Update tab when URL parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleCalculateScores = async () => {
    if (!attempt) return
    
    try {
      setScoring(true)
      await scoreObjectiveQuestions(attempt.id)
      await calculateAttemptScore(attempt.id)
      
      // Reload attempt data to show updated scores
      const attemptData = await getAttemptWithDetails(attempt.id)
      setAttempt(attemptData)

      // Reload scoring status
      const status = await getAssessmentScoringStatus(attempt.id)
      setScoringStatus(status)
      
      // Switch to scoring tab
      setActiveTab('scoring')
    } catch (error) {
      console.error('Error calculating scores:', error)
    } finally {
      setScoring(false)
    }
  }

  const loadQuestionDetails = async () => {
    if (!attempt || questionDetails) return
    
    try {
      setLoadingQuestions(true)
      const report = await generateAssessmentReport(attempt.id)
      setQuestionDetails(report.question_details)
    } catch (error) {
      console.error('Error loading question details:', error)
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Load question details when responses tab is accessed
    if (value === 'responses' && attempt && !questionDetails) {
      loadQuestionDetails()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p>Loading attempt details...</p>
        </div>
      </div>
    )
  }

  if (!attempt) {
    notFound()
  }

  const isCompleted = !!attempt.completed_at
  const startDate = new Date(attempt.started_at)
  const endDate = attempt.completed_at ? new Date(attempt.completed_at) : null
  const duration = endDate 
    ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
    : null

  // Group answers by question for easier display
  const answersByQuestion = attempt.user_answers?.reduce((acc: any, answer: any) => {
    acc[answer.question_id] = answer
    return acc
  }, {}) || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/attempts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Attempts
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attempt Details</h1>
            <p className="text-gray-600 mt-1">
              {attempt.assessments?.title || 'Unknown Assessment'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isCompleted && (
            <Button 
              onClick={handleCalculateScores}
              disabled={scoring}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {scoring ? 'Calculating...' : 'Calculate Scores'}
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Responses
          </Button>
          <Link href={`/assessment?assessmentId=${attempt.assessment_id}`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Attempt Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">User</p>
                <p className="text-lg font-bold truncate">
                  {attempt.invitation?.invitation_name || 
                   attempt.invitee_name || 
                   attempt.invitation?.invited_email ||
                   attempt.invitee_email ||
                   `${attempt.user_id?.slice(0, 12)}...`}
                </p>
                {(attempt.invitation?.invited_email || attempt.invitee_email) && 
                 (attempt.invitation?.invitation_name || attempt.invitee_name) && (
                  <p className="text-xs text-gray-500 truncate">
                    {attempt.invitation?.invited_email || attempt.invitee_email}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Started</p>
                <p className="text-lg font-bold">{startDate.toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{startDate.toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded ${isCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold">
                  {isCompleted ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-lg font-bold">
                  {duration ? `${duration} min` : 'Ongoing'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Report</TabsTrigger>
          <TabsTrigger value="grading">Manual Grading</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Information</CardTitle>
              <CardDescription>Details about the assessment being taken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Assessment Title</h4>
                  <p className="text-gray-700">{attempt.assessments?.title || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">
                    {attempt.assessments?.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Total Responses</h4>
                  <p className="text-gray-700">{attempt.user_answers?.length || 0} answers</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Attempt ID</h4>
                  <p className="text-gray-700 font-mono">{attempt.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Summary (if calculated) */}
          {attempt.score !== null && attempt.percentage !== null && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Score Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {attempt.percentage?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {attempt.passed ? 'PASS' : 'FAIL'}
                    </div>
                    <div className="text-sm text-gray-600">Result</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {attempt.score}
                    </div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          {loadingQuestions ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-40 bg-gray-200 rounded"></div>
                </div>
                <p className="text-gray-500 mt-4">Loading question details...</p>
              </CardContent>
            </Card>
          ) : questionDetails && questionDetails.length > 0 ? (
            <QuestionDetailsTabbed questions={questionDetails} />
          ) : attempt.user_answers && attempt.user_answers.length > 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Score First to View Details</h3>
                <p className="text-gray-600 mb-4">
                  Calculate scores to see detailed question-by-question analysis with answers and correct responses.
                </p>
                <Button 
                  onClick={handleCalculateScores}
                  disabled={scoring}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {scoring ? 'Calculating...' : 'Calculate Scores'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                <p className="text-gray-600">This user hasn't provided any answers to the assessment questions.</p>
              </CardContent>
            </Card>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Assessment Completed</h4>
                    <p className="text-sm text-green-700">
                      Completed on {endDate?.toLocaleDateString()} at {endDate?.toLocaleTimeString()}
                      {duration && ` (${duration} minutes)`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          {attempt.score !== null && attempt.percentage !== null ? (
            <AssessmentReport attemptId={attempt.id} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Scores Not Calculated</h3>
                <p className="text-gray-600 mb-4">
                  Click "Calculate Scores" to generate a comprehensive assessment report.
                </p>
                <Button 
                  onClick={handleCalculateScores}
                  disabled={scoring}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {scoring ? 'Calculating...' : 'Calculate Scores'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="grading" className="space-y-6">
          <ManualGrading attemptId={attempt.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 