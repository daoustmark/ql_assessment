import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface UseVideoRecordingProps {
  attemptId: number
  currentQuestionId: number
  onAnswerSave: (questionId: number, answerType: string, value: any) => void
}

interface UseVideoRecordingReturn {
  // Recording state
  isRecording: boolean
  recordedVideo: Blob | null
  recordingTime: number
  stream: MediaStream | null
  videoPreviewUrl: string | null
  saveStatus: 'saved' | 'saving' | 'unsaved'

  // Device state
  availableVideoDevices: MediaDeviceInfo[]
  availableAudioDevices: MediaDeviceInfo[]
  selectedVideoDevice: string | null
  selectedAudioDevice: string | null
  showDeviceSelection: boolean

  // Recording functions
  startRecording: () => Promise<void>
  stopRecording: () => void
  uploadVideo: (file: File | Blob) => Promise<void>
  clearVideo: () => void

  // Device functions
  enumerateDevices: () => Promise<void>
  setSelectedVideoDevice: (deviceId: string | null) => void
  setSelectedAudioDevice: (deviceId: string | null) => void
  setShowDeviceSelection: (show: boolean) => void

  // Utility functions
  formatTime: (seconds: number) => string
}

export function useVideoRecording({ 
  attemptId, 
  currentQuestionId, 
  onAnswerSave 
}: UseVideoRecordingProps): UseVideoRecordingReturn {
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  // Device state
  const [availableVideoDevices, setAvailableVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [availableAudioDevices, setAvailableAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(null)
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(null)
  const [showDeviceSelection, setShowDeviceSelection] = useState(false)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear video state when question changes
  useEffect(() => {
    if (isRecording) {
      stopRecording()
    }
    clearVideo()
  }, [currentQuestionId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      // Build constraints with selected devices
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm'
      })

      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' })
        setRecordedVideo(videoBlob)
        setVideoPreviewUrl(URL.createObjectURL(videoBlob))
        
        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop())
        setStream(null)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          // Auto-stop at 5 minutes (300 seconds)
          if (newTime >= 300) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      throw new Error('Could not access camera and microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    
    setIsRecording(false)
  }

  const uploadVideo = async (file: File | Blob) => {
    try {
      setSaveStatus('saving')
      
      // Upload to Supabase Storage
      const fileName = `video-response-${attemptId}-${currentQuestionId}-${Date.now()}.webm`
      const filePath = `video-responses/${fileName}`

      const { data, error } = await supabase.storage
        .from('assessment-videos')
        .upload(filePath, file)

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assessment-videos')
        .getPublicUrl(filePath)

      // Save answer with video path
      onAnswerSave(currentQuestionId, 'video', publicUrl)
      
      setSaveStatus('saved')
      
    } catch (error) {
      console.error('Error uploading video:', error)
      setSaveStatus('unsaved')
      throw new Error('Error uploading video. Please try again.')
    }
  }

  const clearVideo = () => {
    setRecordedVideo(null)
    setVideoPreviewUrl(null)
    setRecordingTime(0)
    setSaveStatus('saved')
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const enumerateDevices = async () => {
    try {
      // First request permission to access devices
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      
      const devices = await navigator.mediaDevices.enumerateDevices()
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      const audioDevices = devices.filter(device => device.kind === 'audioinput')
      
      setAvailableVideoDevices(videoDevices)
      setAvailableAudioDevices(audioDevices)
      
      // Set default devices if none selected
      if (!selectedVideoDevice && videoDevices.length > 0) {
        setSelectedVideoDevice(videoDevices[0].deviceId)
      }
      if (!selectedAudioDevice && audioDevices.length > 0) {
        setSelectedAudioDevice(audioDevices[0].deviceId)
      }
      
      setShowDeviceSelection(true)
      
    } catch (error) {
      console.error('Error enumerating devices:', error)
      throw new Error('Could not access media devices. Please check permissions.')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    // Recording state
    isRecording,
    recordedVideo,
    recordingTime,
    stream,
    videoPreviewUrl,
    saveStatus,

    // Device state
    availableVideoDevices,
    availableAudioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    showDeviceSelection,

    // Recording functions
    startRecording,
    stopRecording,
    uploadVideo,
    clearVideo,

    // Device functions
    enumerateDevices,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    setShowDeviceSelection,

    // Utility functions
    formatTime
  }
} 