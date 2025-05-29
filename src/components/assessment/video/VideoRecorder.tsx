import React, { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface VideoRecorderProps {
  selectedVideoDevice: string | null
  selectedAudioDevice: string | null
  isRecording: boolean
  recordedVideo: Blob | null
  recordingTime: number
  stream: MediaStream | null
  videoPreviewUrl: string | null
  saveStatus: 'saved' | 'saving' | 'unsaved'
  timeExpired: boolean
  timerActive: boolean
  onStartRecording: () => Promise<void>
  onStopRecording: () => void
  onUploadVideo: (file: File | Blob) => Promise<void>
  onClearVideo: () => void
  formatTime: (seconds: number) => string
}

export function VideoRecorder({
  selectedVideoDevice,
  selectedAudioDevice,
  isRecording,
  recordedVideo,
  recordingTime,
  stream,
  videoPreviewUrl,
  saveStatus,
  timeExpired,
  timerActive,
  onStartRecording,
  onStopRecording,
  onUploadVideo,
  onClearVideo,
  formatTime
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Assign stream to video element when available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file.')
        return
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('File size must be less than 100MB.')
        return
      }

      onUploadVideo(file)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Record your video response:</h4>
      
      {/* Video Recording Interface */}
      <div className="border-2 border-gray-300 rounded-lg p-4">
        {!recordedVideo ? (
          <div className="space-y-4">
            {!isRecording ? (
              <div className="text-center">
                <video 
                  ref={videoRef}
                  className="w-full max-w-md mx-auto bg-gray-900 rounded"
                  style={{ display: stream ? 'block' : 'none' }}
                />
                <div className="mt-4 space-x-2">
                  <Button 
                    onClick={onStartRecording}
                    disabled={timeExpired || !timerActive}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    🔴 Start Recording
                  </Button>
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-2">Or upload a video file:</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      disabled={timeExpired}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <video 
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full max-w-md mx-auto bg-gray-900 rounded"
                />
                <div className="mt-4 space-y-2">
                  <div className="text-xl font-semibold">
                    🔴 Recording: {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Maximum recording time: 5 minutes
                  </div>
                  <Button 
                    onClick={onStopRecording}
                    variant="outline"
                  >
                    ⏹️ Stop Recording
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <video 
                src={videoPreviewUrl || ''}
                controls
                className="w-full max-w-md mx-auto bg-gray-900 rounded"
              />
              <div className="mt-4 space-x-2">
                <Button 
                  onClick={() => onUploadVideo(recordedVideo)}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {saveStatus === 'saving' ? 'Uploading...' : '✓ Submit Video'}
                </Button>
                <Button 
                  onClick={onClearVideo}
                  variant="outline"
                  disabled={saveStatus === 'saving' || timeExpired}
                >
                  🗑️ Record Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recording Tips */}
      {!isRecording && !recordedVideo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="font-medium text-blue-900 mb-2">💡 Recording Tips:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure you're in a well-lit area</li>
            <li>• Speak clearly and at a normal pace</li>
            <li>• Look at the camera when speaking</li>
            <li>• Keep your response under 5 minutes</li>
          </ul>
        </div>
      )}
    </div>
  )
} 