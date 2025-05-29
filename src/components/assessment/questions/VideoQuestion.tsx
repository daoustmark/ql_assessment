import React, { memo } from 'react'
import { VideoRecorder } from '../video'
import type { QuestionWithOptions, UserAnswer } from '@/types'

interface VideoQuestionProps {
  question: QuestionWithOptions
  currentAnswer?: UserAnswer
  onAnswerChange: (questionId: number, answerType: string, value: any) => void
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

const VideoQuestion = memo(function VideoQuestion({
  question,
  currentAnswer,
  onAnswerChange,
  isDisabled = false,
  // Video props with defaults
  isRecording = false,
  recordedVideo = null,
  recordingTime = 0,
  stream = null,
  videoPreviewUrl = null,
  saveStatus = 'saved',
  timeExpired = false,
  timerActive = false,
  selectedVideoDevice = null,
  selectedAudioDevice = null,
  // Video functions with defaults
  startRecording = async () => {},
  stopRecording = () => {},
  uploadVideo = async () => {},
  clearVideo = () => {},
  formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}: VideoQuestionProps) {
  // Check if video response already exists
  const hasVideoResponse = currentAnswer?.video_response_path
  
  if (hasVideoResponse) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-700 mb-2">
          ✅ Video Response Submitted
        </div>
        <p className="text-sm text-green-600">
          Your video response has been successfully recorded and saved.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Record your video response:</h4>
      
      <VideoRecorder
        selectedVideoDevice={selectedVideoDevice}
        selectedAudioDevice={selectedAudioDevice}
        isRecording={isRecording}
        recordedVideo={recordedVideo}
        recordingTime={recordingTime}
        stream={stream}
        videoPreviewUrl={videoPreviewUrl}
        saveStatus={saveStatus}
        timeExpired={timeExpired}
        timerActive={timerActive}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onUploadVideo={uploadVideo}
        onClearVideo={clearVideo}
        formatTime={formatTime}
      />
    </div>
  )
})

export default VideoQuestion 