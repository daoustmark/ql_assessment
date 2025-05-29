'use client'

import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAssessmentAttempt, getAssessmentById } from '@/lib/supabase/queries'
import type { AssessmentWithParts, AttemptWithAnswers, QuestionWithOptions } from '@/types'
import { EmailResponseScenario, VideoResponseScenario } from '@/components/assessment/scenarios'
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer'
import { ProgressIndicator, NavigationControls } from '@/components/assessment/navigation'
import { AssessmentErrorBoundary } from '@/components/assessment/error/AssessmentErrorBoundary'
import { AssessmentLoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  useVideoRecording,
  useAnswerPersistence,
  useQuestionTimer,
  useAssessmentNavigation,
  useCameraTest
} from '@/hooks/assessment'

interface AssessmentContainerProps {
  attemptId: number
}

export function AssessmentContainer({ attemptId }: AssessmentContainerProps) {
  const [attempt, setAttempt] = useState<AttemptWithAnswers | null>(null)
  const [assessment, setAssessment] = useState<AssessmentWithParts | null>(null)
  const [allQuestions, setAllQuestions] = useState<QuestionWithOptions[]>([])
  const [ethicalParts, setEthicalParts] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Animation state for question transitions
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<'next' | 'previous' | null>(null)

  // Assessment navigation hook
  const navigation = useAssessmentNavigation({
    attemptId,
    allQuestions,
    assessment
  })

  // Answer persistence hook
  const answerPersistence = useAnswerPersistence({
    attemptId,
    attempt
  })

  // Video recording hook
  const videoRecording = useVideoRecording({
    attemptId,
    currentQuestionId: navigation.currentQuestion?.id || 0,
    onAnswerSave: answerPersistence.handleAnswerChange
  })

  // Question timer hook
  const questionTimer = useQuestionTimer({
    currentQuestion: navigation.currentQuestion,
    answers: answerPersistence.answers,
    onAutoSubmit: () => {
      if (videoRecording.recordedVideo) {
        videoRecording.uploadVideo(videoRecording.recordedVideo)
      }
    }
  })

  // Camera test hook
  const cameraTest = useCameraTest({
    currentQuestionIndex: navigation.currentQuestionIndex
  })

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function loadAssessment() {
      try {
        // Load the assessment attempt
        const attemptData = await getAssessmentAttempt(attemptId)
        if (!attemptData) {
          setError('Assessment attempt not found')
          return
        }
        setAttempt(attemptData)

        // Load the full assessment data
        const assessmentData = await getAssessmentById(attemptData.assessment_id)
        if (!assessmentData) {
          setError('Assessment not found')
          return
        }
        setAssessment(assessmentData)

        // Flatten all questions from all parts and blocks
        const questions: QuestionWithOptions[] = []
        const ethicalPartIds = new Set<number>()
        
        assessmentData.parts.forEach(part => {
          // Check if this part contains ethical content
          if (part.title.toLowerCase().includes('ethical') || part.title.toLowerCase().includes('dilemma')) {
            ethicalPartIds.add(part.id)
          }
          
          part.blocks.forEach(block => {
            questions.push(...block.questions)
          })
        })
        
        setEthicalParts(ethicalPartIds)
        
        // Sort by sequence order
        questions.sort((a, b) => a.sequence_order - b.sequence_order)
        setAllQuestions(questions)

      } catch (err) {
        console.error('Error loading assessment:', err)
        setError('Failed to load assessment')
      } finally {
        setLoading(false)
      }
    }

    if (attemptId) {
      loadAssessment()
    }
  }, [attemptId])

  // Helper function to determine if a question is ethical
  const isEthicalQuestion = (question: QuestionWithOptions) => {
    // Find which part this question belongs to
    for (const part of assessment?.parts || []) {
      for (const block of part.blocks || []) {
        if (block.questions?.some(q => q.id === question.id)) {
          return ethicalParts.has(part.id)
        }
      }
    }
    return false
  }

  // Helper function to get display type for question
  const getQuestionDisplayType = (question: QuestionWithOptions) => {
    if (isEthicalQuestion(question)) {
      return 'ethical_choice'
    }
    return question.question_type
  }

  // Animated navigation functions
  const animatedNext = async () => {
    if (navigation.canGoNext && !isAnimating) {
      setIsAnimating(true)
      setAnimationDirection('next')
      
      // Wait for slide-out animation
      setTimeout(async () => {
        await navigation.handleNext()
        // Wait for slide-in animation to complete
        setTimeout(() => {
          setIsAnimating(false)
          setAnimationDirection(null)
        }, 300)
      }, 300)
    }
  }

  const animatedPrevious = () => {
    if (navigation.canGoPrevious && !isAnimating) {
      setIsAnimating(true)
      setAnimationDirection('previous')
      
      // Wait for slide-out animation
      setTimeout(() => {
        navigation.handlePrevious()
        // Wait for slide-in animation to complete
        setTimeout(() => {
          setIsAnimating(false)
          setAnimationDirection(null)
        }, 300)
      }, 300)
    }
  }

  if (loading) {
    return <AssessmentLoadingSpinner text="Loading your assessment..." />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!assessment || !attempt || allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-6">
              This assessment appears to have no questions or could not be loaded properly.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = navigation.currentQuestion

  if (!currentQuestion) {
    return null
  }

  return (
    <AssessmentErrorBoundary 
      attemptId={attemptId}
      onSaveProgress={navigation.handleSaveAndExit}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Q</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
                    <p className="text-sm text-gray-500">Assessment in Progress</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Attempt ID: {attemptId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <ProgressIndicator
              currentQuestionIndex={navigation.currentQuestionIndex}
              totalQuestions={allQuestions.length}
              saveStatus={answerPersistence.saveStatus}
              lastSavedAt={answerPersistence.lastSavedAt}
              attemptId={attemptId}
              assessmentTitle={assessment.title}
            />
            
            {/* Current Question */}
            <div className="relative overflow-hidden min-h-[400px]">
              <Card className={`mb-6 border-0 shadow-lg transition-all duration-300 ease-in-out ${
                isAnimating 
                  ? animationDirection === 'next' 
                    ? 'transform -translate-x-full opacity-0' 
                    : 'transform translate-x-full opacity-0'
                  : 'transform translate-x-0 opacity-100'
              }`}>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8">
                  <div className="flex items-center justify-between gap-8">
                    <CardTitle className="text-xl font-semibold text-gray-900 leading-relaxed">
                      Question {navigation.currentQuestionIndex + 1} of {allQuestions.length}
                    </CardTitle>
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      {currentQuestion.is_required && (
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-600 font-medium whitespace-nowrap">Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Show warning screen for video questions before revealing content */}
                  {(currentQuestion.question_type === 'video' || currentQuestion.question_type === 'timed_video_response' || currentQuestion.question_type === 'video_response') && questionTimer.showTimeWarning ? (
                    <div className="text-center space-y-6 py-8">
                      {/* Warning Icon */}
                      <div className="flex justify-center">
                        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      </div>

                      {/* Warning Title */}
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-orange-900">⏰ Timed Video Response</h3>
                        <p className="text-lg text-orange-700">
                          This question has a <strong>10-minute time limit</strong>
                        </p>
                      </div>

                      {/* Instructions */}
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
                        <h4 className="font-semibold text-orange-900 mb-4 text-center">📋 Important Instructions</h4>
                        <ul className="space-y-3 text-orange-800">
                          <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-900 mt-0.5">1</div>
                            <div>
                              <strong>Think on Your Feet:</strong> The scenario and question will be revealed when the timer starts
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-900 mt-0.5">2</div>
                            <div>
                              <strong>Total Time:</strong> You have exactly <strong>10 minutes</strong> to read, analyze, and record your response
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-900 mt-0.5">3</div>
                            <div>
                              <strong>Recording Limit:</strong> Your video response can be up to <strong>5 minutes long</strong>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-900 mt-0.5">4</div>
                            <div>
                              <strong>Auto-Submit:</strong> When time expires, any recorded response will be automatically submitted
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-900 mt-0.5">5</div>
                            <div>
                              <strong>Preparation:</strong> Make sure you&apos;re in a quiet location with good lighting and camera access
                            </div>
                          </li>
                        </ul>
                      </div>

                      {/* Ready Check */}
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-red-800 text-sm font-bold">
                            ⚠️ IMPORTANT: You cannot preview the question first!
                          </p>
                        </div>
                        <p className="text-red-700 text-xs mb-3">
                          The timer will start immediately when you click &quot;I&apos;m Ready to Begin&quot; and the scenario will be revealed. This tests your ability to think under pressure.
                        </p>
                        <p className="text-red-700 text-xs">
                          Only proceed when you are completely ready to start.
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4">
                        <Button 
                          onClick={questionTimer.startQuestionTimer}
                          className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 font-semibold"
                          size="lg"
                        >
                          🚀 I&apos;m Ready to Begin
                        </Button>
                      </div>

                      {/* Additional Help */}
                      <div className="text-xs text-gray-500 max-w-md mx-auto">
                        <p>
                          <strong>Need help?</strong> Make sure your camera and microphone permissions are enabled. 
                          The scenario will appear immediately after clicking the button above.
                        </p>
                      </div>

                      {/* Camera and Microphone Test Section */}
                      <div className="mt-8 pt-6 border-t border-gray-300">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">🧪 Test Your Equipment</h4>
                        
                        {!cameraTest.showCameraTest ? (
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600 text-center max-w-md mx-auto">
                              We recommend testing your camera and microphone before starting the timed assessment.
                            </p>
                            
                            {/* Device Selection */}
                            {!videoRecording.showDeviceSelection ? (
                              <div className="flex justify-center">
                                <Button 
                                  onClick={videoRecording.enumerateDevices}
                                  variant="outline"
                                  className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                                >
                                  🔧 Choose Camera & Microphone
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4 max-w-md mx-auto">
                                <div className="grid grid-cols-1 gap-4">
                                  {/* Video Device Selection */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      📹 Camera:
                                    </label>
                                    <select
                                      value={videoRecording.selectedVideoDevice || ''}
                                      onChange={(e) => videoRecording.setSelectedVideoDevice(e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {videoRecording.availableVideoDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                          {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  
                                  {/* Audio Device Selection */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      🎤 Microphone:
                                    </label>
                                    <select
                                      value={videoRecording.selectedAudioDevice || ''}
                                      onChange={(e) => videoRecording.setSelectedAudioDevice(e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {videoRecording.availableAudioDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                
                                <div className="flex justify-center">
                                  <Button 
                                    onClick={() => cameraTest.startCameraTest(videoRecording.selectedVideoDevice || undefined, videoRecording.selectedAudioDevice || undefined)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    📷 Test Selected Devices
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {/* Quick Test Option */}
                            {videoRecording.showDeviceSelection && (
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-2">Or use default devices:</p>
                                <Button 
                                  onClick={() => cameraTest.startCameraTest()}
                                  variant="outline"
                                  size="sm"
                                  className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                                >
                                  📷 Quick Test
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 max-w-lg mx-auto">
                            {/* Test Video Preview */}
                            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-900">
                              <video 
                                ref={cameraTest.testVideoRef}
                                autoPlay 
                                playsInline
                                muted
                                className="w-full aspect-video object-cover"
                              />
                              
                              {/* Video Loading Indicator */}
                              {!cameraTest.cameraTestPassed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                  <div className="text-white text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                    <p className="text-sm">Starting camera...</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Test Status Overlay */}
                              <div className="absolute top-2 left-2 space-y-1">
                                <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium ${
                                  cameraTest.cameraTestPassed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${
                                    cameraTest.cameraTestPassed ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}></div>
                                  <span>Camera {cameraTest.cameraTestPassed ? 'Working' : 'Testing...'}</span>
                                </div>
                                
                                <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium ${
                                  cameraTest.micTestPassed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${
                                    cameraTest.micTestPassed ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}></div>
                                  <span>Microphone {cameraTest.micTestPassed ? 'Working' : 'Speak to test'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Audio Level Indicator */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Audio Level:</span>
                                <span className="text-xs text-gray-500">
                                  {cameraTest.micTestPassed ? '✓ Microphone detected' : 'Speak into your microphone'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-150 ${
                                    cameraTest.audioLevel > 0.5 ? 'bg-green-500' : 
                                    cameraTest.audioLevel > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.max(cameraTest.audioLevel * 100, 5)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Test Instructions */}
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>• You should see yourself in the video preview</p>
                              <p>• Speak normally - the audio level bar should move and turn green</p>
                              <p>• Both indicators should show &quot;Working&quot; when ready</p>
                            </div>

                            {/* Troubleshooting */}
                            {cameraTest.showCameraTest && !cameraTest.cameraTestPassed && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <h5 className="font-medium text-yellow-800 mb-2">Troubleshooting Camera Issues:</h5>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                  <li>• Make sure you&apos;ve allowed camera permissions in your browser</li>
                                  <li>• Check that no other apps are using your camera</li>
                                  <li>• Try refreshing the page if the video doesn&apos;t appear</li>
                                  <li>• Ensure your camera is properly connected</li>
                                </ul>
                              </div>
                            )}

                            {/* Test Controls */}
                            <div className="flex justify-center space-x-3">
                              <Button 
                                onClick={cameraTest.stopCameraTest}
                                variant="outline"
                                size="sm"
                              >
                                Stop Test
                              </Button>
                              <Button 
                                onClick={() => {
                                  cameraTest.stopCameraTest()
                                  videoRecording.setShowDeviceSelection(false)
                                }}
                                variant="outline"
                                size="sm"
                                className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                              >
                                🔧 Change Devices
                              </Button>
                              {cameraTest.cameraTestPassed && cameraTest.micTestPassed && (
                                <Button 
                                  onClick={cameraTest.stopCameraTest}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  size="sm"
                                >
                                  ✓ Test Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Timer Display for Video Questions */}
                      {(currentQuestion.question_type === 'video' || currentQuestion.question_type === 'timed_video_response' || currentQuestion.question_type === 'video_response') && questionTimer.timerActive && (
                        <div className={`text-center p-4 rounded-lg border-2 ${
                          questionTimer.questionTimer <= 60 ? 'bg-red-50 border-red-300' : 
                          questionTimer.questionTimer <= 300 ? 'bg-yellow-50 border-yellow-300' : 
                          'bg-blue-50 border-blue-300'
                        }`}>
                          <div className="text-2xl font-bold mb-2">
                            ⏰ Time Remaining: {questionTimer.formatTime(questionTimer.questionTimer)}
                          </div>
                          {questionTimer.questionTimer <= 60 && (
                            <div className="text-red-700 font-medium">⚠️ Less than 1 minute remaining!</div>
                          )}
                          {questionTimer.questionTimer <= 300 && questionTimer.questionTimer > 60 && (
                            <div className="text-yellow-700 font-medium">⚠️ 5 minutes remaining</div>
                          )}
                        </div>
                      )}

                      {/* Question Content */}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        {/* Question Text */}
                        <div className="p-8">
                          {currentQuestion.question_text.includes('::scenario-type[') ? (
                            currentQuestion.question_type === 'email_response' ? (
                              <EmailResponseScenario content={currentQuestion.question_text} />
                            ) : (
                              <VideoResponseScenario content={currentQuestion.question_text} />
                            )
                          ) : (
                            <div className="prose prose-lg max-w-none">
                              <ReactMarkdown 
                                components={{
                                  h1: ({children}) => (
                                    <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-500">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({children}) => (
                                    <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-300">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({children}) => (
                                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                                      {children}
                                    </h3>
                                  ),
                                  p: ({children}) => (
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                      {children}
                                    </p>
                                  ),
                                  strong: ({children}) => (
                                    <strong className="font-bold text-gray-900 bg-yellow-100 px-1 rounded">
                                      {children}
                                    </strong>
                                  ),
                                  ul: ({children}) => (
                                    <ul className="space-y-2 mb-4 ml-4">
                                      {children}
                                    </ul>
                                  ),
                                  li: ({children}) => (
                                    <li className="flex items-start">
                                      <span className="text-blue-500 mr-2 mt-1 text-sm">•</span>
                                      <span className="text-gray-700">{children}</span>
                                    </li>
                                  ),
                                  hr: () => (
                                    <div className="my-8">
                                      <div className="border-t-2 border-gray-200 relative">
                                        <div className="absolute inset-0 flex justify-center">
                                          <div className="bg-white px-4">
                                            <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                  blockquote: ({children}) => (
                                    <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-6 py-4 my-6 italic text-gray-700">
                                      {children}
                                    </blockquote>
                                  ),
                                  code: ({children}) => (
                                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                                      {children}
                                    </code>
                                  )
                                }}
                              >
                                {currentQuestion.question_text}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Answer Input Based on Question Type */}
                        <div className="border-t bg-gray-50 p-6">
                          <QuestionRenderer
                            question={currentQuestion}
                            currentAnswer={answerPersistence.getAnswer(currentQuestion.id)}
                            onAnswerChange={answerPersistence.handleAnswerChange}
                            onAutoAdvance={animatedNext}
                            isEthicalQuestion={isEthicalQuestion(currentQuestion)}
                            isDisabled={questionTimer.timeExpired}
                            // Video recording props
                            isRecording={videoRecording.isRecording}
                            recordedVideo={videoRecording.recordedVideo}
                            recordingTime={videoRecording.recordingTime}
                            stream={videoRecording.stream}
                            videoPreviewUrl={videoRecording.videoPreviewUrl}
                            saveStatus={videoRecording.saveStatus}
                            timeExpired={questionTimer.timeExpired}
                            timerActive={questionTimer.timerActive}
                            selectedVideoDevice={videoRecording.selectedVideoDevice}
                            selectedAudioDevice={videoRecording.selectedAudioDevice}
                            // Video recording functions
                            startRecording={videoRecording.startRecording}
                            stopRecording={videoRecording.stopRecording}
                            uploadVideo={videoRecording.uploadVideo}
                            clearVideo={videoRecording.clearVideo}
                            formatTime={videoRecording.formatTime}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <NavigationControls
              currentQuestionIndex={navigation.currentQuestionIndex}
              totalQuestions={allQuestions.length}
              canGoNext={navigation.canGoNext}
              canGoPrevious={navigation.canGoPrevious}
              onPrevious={animatedPrevious}
              onNext={animatedNext}
              onComplete={navigation.handleComplete}
              onSaveAndExit={navigation.handleSaveAndExit}
              isLoading={answerPersistence.saveStatus === 'saving'}
            />
          </div>
        </div>
      </div>
    </AssessmentErrorBoundary>
  )
} 