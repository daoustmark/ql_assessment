'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Pause
} from 'lucide-react'
import Link from 'next/link'
import { getAttemptWithDetails } from '@/lib/supabase/admin-queries'
import { notFound } from 'next/navigation'
import { useState, useEffect } from 'react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function AttemptDetailPage({ params }: PageProps) {
  const [attempt, setAttempt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)

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
      } catch (error) {
        console.error('Error loading attempt:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAttempt()
  }, [params])

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-lg font-bold">{attempt.user_id?.slice(0, 12)}...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Started</p>
                <p className="text-lg font-bold">{startDate.toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{startDate.toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded ${isCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-lg font-bold">
                  {isCompleted ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-lg font-bold">
                  {duration ? `${duration} min` : 'Ongoing'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* User Responses */}
      <Card>
        <CardHeader>
          <CardTitle>User Responses</CardTitle>
          <CardDescription>
            Detailed view of all answers provided by the user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempt.user_answers && attempt.user_answers.length > 0 ? (
            <div className="space-y-6">
              {attempt.user_answers.map((answer: any, index: number) => (
                <div key={answer.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        Question {index + 1}
                      </Badge>
                      <Badge variant="outline">
                        {answer.questions?.question_type || 'Unknown Type'}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      Answered: {new Date(answer.answered_at || '').toLocaleString()}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                      {answer.questions?.question_text || 'Question text not available'}
                    </p>
                  </div>

                  {/* User's Answer */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">User's Answer:</h4>
                    <div className="bg-blue-50 p-3 rounded">
                      {/* Multiple Choice Answer */}
                      {answer.mcq_option_id && answer.mcq_options && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Selected:</span>
                          <span>{answer.mcq_options.option_text}</span>
                        </div>
                      )}

                      {/* Text Answer */}
                      {answer.text_answer && (
                        <div>
                          <p className="text-gray-800 whitespace-pre-wrap">{answer.text_answer}</p>
                        </div>
                      )}

                      {/* Likert Scale Answer */}
                      {answer.likert_rating && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Rating:</span>
                          <Badge variant="secondary">
                            {answer.likert_rating}/5
                          </Badge>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <div
                                key={rating}
                                className={`w-3 h-3 rounded-full ${
                                  rating <= answer.likert_rating
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Video Response */}
                      {answer.video_response_path && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Video Response:</span>
                            <Badge variant="secondary">File uploaded</Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setExpandedVideo(
                                expandedVideo === answer.video_response_path 
                                  ? null 
                                  : answer.video_response_path
                              )}
                            >
                              {expandedVideo === answer.video_response_path ? (
                                <>
                                  <Eye className="w-4 h-4 mr-1" />
                                  Hide Video
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  View Video
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {/* Video Player */}
                          {expandedVideo === answer.video_response_path && (
                            <div className="mt-3 p-4 bg-black rounded-lg">
                              <video 
                                controls 
                                className="w-full max-w-2xl mx-auto rounded"
                                style={{ maxHeight: '400px' }}
                              >
                                <source src={answer.video_response_path} type="video/webm" />
                                <source src={answer.video_response_path} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              <div className="text-center mt-2">
                                <p className="text-white text-sm">
                                  Video uploaded: {new Date(answer.answered_at || '').toLocaleString()}
                                </p>
                                <p className="text-gray-300 text-xs mt-1">
                                  File: {answer.video_response_path.split('/').pop()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* No Answer */}
                      {!answer.mcq_option_id && 
                       !answer.text_answer && 
                       !answer.likert_rating && 
                       !answer.video_response_path && (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <XCircle className="w-4 h-4" />
                          <span>No answer provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
              <p>This user hasn't provided any answers to the assessment questions.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  )
} 