'use client'

import { Suspense, lazy } from 'react'
import { Button } from '@/components/ui/button'
import type { QuestionWithOptions } from '@/types'

// Lazy load question components for code splitting
const MultipleChoiceQuestion = lazy(() => import('./questions/MultipleChoiceQuestion'))
const TextQuestion = lazy(() => import('./questions/TextQuestion'))
const LikertScaleQuestion = lazy(() => import('./questions/LikertScaleQuestion'))
const VideoQuestion = lazy(() => import('./questions/VideoQuestion'))

interface QuestionRendererProps {
  question: QuestionWithOptions
  currentAnswer?: any
  onAnswerChange: (questionId: number, answerType: string, value: any) => void
  isEthicalQuestion?: boolean
  isDisabled?: boolean
  
  // Video recording props
  isRecording?: boolean
  recordedVideo?: Blob | null
  recordingTime?: number
  stream?: MediaStream | null
  videoPreviewUrl?: string | null
  saveStatus?: 'saved' | 'saving' | 'unsaved'
  timeExpired?: boolean
  timerActive?: boolean
  selectedVideoDevice?: string | null
  selectedAudioDevice?: string | null
  
  // Video recording functions
  startRecording?: () => Promise<void>
  stopRecording?: () => void
  uploadVideo?: (file: File | Blob) => Promise<void>
  clearVideo?: () => void
  formatTime?: (seconds: number) => string
}

// Loading component for suspense
function QuestionLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading question...</span>
      </div>
    </div>
  )
}

export function QuestionRenderer({
  question,
  currentAnswer,
  onAnswerChange,
  isEthicalQuestion = false,
  isDisabled = false,
  // Video props
  isRecording,
  recordedVideo,
  recordingTime,
  stream,
  videoPreviewUrl,
  saveStatus,
  timeExpired,
  timerActive,
  selectedVideoDevice,
  selectedAudioDevice,
  // Video functions
  startRecording,
  stopRecording,
  uploadVideo,
  clearVideo,
  formatTime
}: QuestionRendererProps) {

  const questionType = isEthicalQuestion ? 'ethical_choice' : question.question_type

  // Render appropriate question component based on type
  const renderQuestionComponent = () => {
    const type = questionType.toLowerCase()
    
    if (type === 'multiple_choice' || type === 'ethical_choice') {
      return (
        <MultipleChoiceQuestion
          question={question}
          currentAnswer={currentAnswer}
          onAnswerChange={onAnswerChange}
          isEthicalQuestion={isEthicalQuestion}
          isDisabled={isDisabled}
        />
      )
    }

    if (type === 'text' || type === 'essay' || type === 'email_response') {
      return (
        <TextQuestion
          question={question}
          currentAnswer={currentAnswer}
          onAnswerChange={onAnswerChange}
          isDisabled={isDisabled}
        />
      )
    }

    if (type === 'likert_scale') {
      return (
        <LikertScaleQuestion
          question={question}
          currentAnswer={currentAnswer}
          onAnswerChange={onAnswerChange}
          isDisabled={isDisabled}
        />
      )
    }

    if (type === 'video' || type === 'video_response' || type === 'timed_video_response') {
      return (
        <VideoQuestion
          question={question}
          currentAnswer={currentAnswer}
          onAnswerChange={onAnswerChange}
          isDisabled={isDisabled}
          // Video props
          isRecording={isRecording}
          recordedVideo={recordedVideo}
          recordingTime={recordingTime}
          stream={stream}
          videoPreviewUrl={videoPreviewUrl}
          saveStatus={saveStatus}
          timeExpired={timeExpired}
          timerActive={timerActive}
          selectedVideoDevice={selectedVideoDevice}
          selectedAudioDevice={selectedAudioDevice}
          // Video functions
          startRecording={startRecording}
          stopRecording={stopRecording}
          uploadVideo={uploadVideo}
          clearVideo={clearVideo}
          formatTime={formatTime}
        />
      )
    }

    // Fallback for unknown question types
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          Unsupported question type: {questionType}
        </p>
        <Button 
          onClick={() => onAnswerChange(question.id, 'essay', 'Unable to answer - unsupported question type')}
          variant="outline"
        >
          Skip Question
        </Button>
      </div>
    )
  }

  return (
    <div className="question-renderer">
      <Suspense fallback={<QuestionLoading />}>
        {renderQuestionComponent()}
      </Suspense>
    </div>
  )
} 