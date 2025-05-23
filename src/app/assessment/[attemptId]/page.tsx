'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getAssessmentAttempt, getAssessmentById, updateAssessmentAttemptProgress, completeAssessmentAttempt, saveUserAnswer, getUserAnswer } from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'
import type { AssessmentWithParts, AttemptWithAnswers, QuestionWithOptions } from '@/types'

// Custom component for email response scenarios
function EmailResponseScenario({ content }: { content: string }) {
  // Parse the custom format
  const parseEmailScenario = (text: string) => {
    const lines = text.split('\n')
    const parsed: any = {}
    let currentSection = ''
    let currentContent = ''
    
    for (const line of lines) {
      if (line.startsWith('::scenario-type[')) {
        parsed.scenarioType = line.match(/\[([^\]]+)\]/)?.[1]
      } else if (line.startsWith('::character[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.character = { name: parts[0], type: parts[1] }
        }
      } else if (line.startsWith('::business[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.business = {
            type: parts[0],
            product: parts[1],
            revenue: parts[2],
            sde: parts[3]
          }
        }
      } else if (line.startsWith('# ')) {
        parsed.title = line.substring(2)
      } else if (line.startsWith('::background')) {
        currentSection = 'background'
        currentContent = ''
      } else if (line.startsWith('::email[')) {
        currentSection = 'email'
        currentContent = ''
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const params = match[1].split('|')
          parsed.emailMeta = {}
          params.forEach(param => {
            const [key, value] = param.split('=')
            parsed.emailMeta[key] = value
          })
        }
      } else if (line.startsWith('::task[')) {
        currentSection = 'task'
        currentContent = ''
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const params = match[1].split('|')
          parsed.taskMeta = {}
          params.forEach(param => {
            const [key, value] = param.split('=')
            parsed.taskMeta[key] = value
          })
        }
      } else if (line === '::end') {
        if (currentSection) {
          parsed[currentSection] = currentContent.trim()
          currentSection = ''
          currentContent = ''
        }
      } else if (currentSection) {
        currentContent += line + '\n'
      }
    }
    
    return parsed
  }

  const scenario = parseEmailScenario(content)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-900 mb-2">{scenario.title}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Character:</span> {scenario.character?.name} ({scenario.character?.type})
          </div>
          <div>
            <span className="font-medium text-blue-800">Scenario Type:</span> {scenario.scenarioType}
          </div>
        </div>
        {scenario.business && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-blue-800">Business:</span> {scenario.business.type} - {scenario.business.product} | {scenario.business.revenue} | {scenario.business.sde}
          </div>
        )}
      </div>

      {/* Background */}
      {scenario.background && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">📋 Background</h3>
          <p className="text-gray-700 leading-relaxed">{scenario.background}</p>
        </div>
      )}

      {/* Email */}
      {scenario.email && (
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">From:</span> {scenario.emailMeta?.from}
              </div>
              <div className="flex items-center gap-2">
                {scenario.emailMeta?.urgency === 'high' && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">HIGH PRIORITY</span>
                )}
              </div>
            </div>
            <div className="mt-1">
              <span className="font-medium text-sm">Subject:</span> {scenario.emailMeta?.subject}
            </div>
          </div>
          <div className="p-4">
            <div className="whitespace-pre-line text-gray-800 leading-relaxed">
              {scenario.email}
            </div>
          </div>
        </div>
      )}

      {/* Task */}
      {scenario.task && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📝 Your Task</h3>
          <div className="text-sm text-green-800 mb-2">
            <span className="font-medium">Type:</span> {scenario.taskMeta?.type} | 
            <span className="font-medium ml-2">Goal:</span> {scenario.taskMeta?.goal}
          </div>
          <p className="text-green-700 leading-relaxed">{scenario.task}</p>
        </div>
      )}
    </div>
  )
}

// Custom component for video response scenarios
function VideoResponseScenario({ content }: { content: string }) {
  const parseVideoScenario = (text: string) => {
    const lines = text.split('\n')
    const parsed: any = {}
    let currentSection = ''
    let currentContent = ''
    
    for (const line of lines) {
      if (line.startsWith('::scenario-type[')) {
        parsed.scenarioType = line.match(/\[([^\]]+)\]/)?.[1]
      } else if (line.startsWith('::character[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.character = { name: parts[0], type: parts[1] }
        }
      } else if (line.startsWith('::business[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.business = {
            type: parts[0],
            product: parts[1],
            revenue: parts[2],
            sde: parts[3]
          }
        }
      } else if (line.startsWith('::situation[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.situation = {
            type: parts[0],
            context: parts[1]
          }
        }
      } else if (line.startsWith('# ')) {
        parsed.title = line.substring(2)
      } else if (line.startsWith('::background')) {
        currentSection = 'background'
        currentContent = ''
      } else if (line.startsWith('::video_prompt[')) {
        currentSection = 'videoPrompt'
        currentContent = ''
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const params = match[1].split('|')
          parsed.videoMeta = {}
          params.forEach(param => {
            const [key, value] = param.split('=')
            parsed.videoMeta[key] = value
          })
        }
      } else if (line.startsWith('::task[')) {
        currentSection = 'task'
        currentContent = ''
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const params = match[1].split('|')
          parsed.taskMeta = {}
          params.forEach(param => {
            const [key, value] = param.split('=')
            parsed.taskMeta[key] = value
          })
        }
      } else if (line === '::end') {
        if (currentSection) {
          parsed[currentSection] = currentContent.trim()
          currentSection = ''
          currentContent = ''
        }
      } else if (currentSection) {
        currentContent += line + '\n'
      }
    }
    
    return parsed
  }

  const scenario = parseVideoScenario(content)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-purple-900 mb-2">{scenario.title}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-purple-800">Character:</span> {scenario.character?.name} ({scenario.character?.type})
          </div>
          <div>
            <span className="font-medium text-purple-800">Scenario Type:</span> {scenario.scenarioType}
          </div>
        </div>
        {scenario.business && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-purple-800">Business:</span> {scenario.business.type} - {scenario.business.product} | {scenario.business.revenue} | {scenario.business.sde}
          </div>
        )}
        {scenario.situation && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-purple-800">Situation:</span> {scenario.situation.type} - {scenario.situation.context}
          </div>
        )}
      </div>

      {/* Background */}
      {scenario.background && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">📋 Background</h3>
          <p className="text-gray-700 leading-relaxed">{scenario.background}</p>
        </div>
      )}

      {/* Video Prompt */}
      {scenario.videoPrompt && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-red-900">🎬 Video Scenario</h3>
          </div>
          <div className="text-sm text-red-800 mb-2">
            <span className="font-medium">Character:</span> {scenario.videoMeta?.character} | 
            <span className="font-medium ml-2">Tone:</span> {scenario.videoMeta?.tone} | 
            <span className="font-medium ml-2">Duration:</span> {scenario.videoMeta?.duration?.replace('_', ' ')}
          </div>
          <div className="bg-white border border-red-200 rounded p-3">
            <p className="text-red-700 leading-relaxed whitespace-pre-line">{scenario.videoPrompt}</p>
          </div>
        </div>
      )}

      {/* Task */}
      {scenario.task && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📝 Your Task</h3>
          <div className="text-sm text-green-800 mb-2">
            <span className="font-medium">Type:</span> {scenario.taskMeta?.type} | 
            <span className="font-medium ml-2">Duration:</span> {scenario.taskMeta?.duration} |
            <span className="font-medium ml-2">Goal:</span> {scenario.taskMeta?.goal?.replace('_', ' ')}
          </div>
          <p className="text-green-700 leading-relaxed">{scenario.task}</p>
        </div>
      )}
    </div>
  )
}

export default function AssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = parseInt(params.attemptId as string)

  const [attempt, setAttempt] = useState<AttemptWithAnswers | null>(null)
  const [assessment, setAssessment] = useState<AssessmentWithParts | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [allQuestions, setAllQuestions] = useState<QuestionWithOptions[]>([])
  const [ethicalParts, setEthicalParts] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Answer management state
  const [answers, setAnswers] = useState<Map<number, any>>(new Map())
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Video recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)

  // Timer state for video questions
  const [questionTimer, setQuestionTimer] = useState<number>(0) // seconds remaining
  const [timerActive, setTimerActive] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [showTimeWarning, setShowTimeWarning] = useState(false) // New state for warning screen

  // Camera/Microphone test state
  const [showCameraTest, setShowCameraTest] = useState(false)
  const [testStream, setTestStream] = useState<MediaStream | null>(null)
  const [cameraTestPassed, setCameraTestPassed] = useState(false)
  const [micTestPassed, setMicTestPassed] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  // Timer constants
  const VIDEO_QUESTION_TIME_LIMIT = 10 * 60 // 10 minutes in seconds

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const testVideoRef = useRef<HTMLVideoElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Device enumeration state
  const [availableVideoDevices, setAvailableVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [availableAudioDevices, setAvailableAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(null)
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(null)
  const [showDeviceSelection, setShowDeviceSelection] = useState(false)

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

        // Start from the beginning (no current_question_id in schema)
        setCurrentQuestionIndex(0)

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

  // Load existing answers when attempt data changes
  useEffect(() => {
    if (attempt && attempt.user_answers) {
      const answerMap = new Map()
      attempt.user_answers.forEach(answer => {
        answerMap.set(answer.question_id, {
          text_answer: answer.text_answer,
          mcq_option_id: answer.mcq_option_id,
          scenario_id: answer.scenario_id,
          scenario_option_id: answer.scenario_option_id,
          likert_rating: answer.likert_rating,
          video_response_path: answer.video_response_path
        })
      })
      setAnswers(answerMap)
    }
  }, [attempt])

  // Clean up video recording state when question changes
  useEffect(() => {
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording()
    }
    
    // Clear video state
    clearVideo()
  }, [currentQuestionIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      // Stop test stream
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop())
      }
      
      // Clean up audio monitoring
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Clean up blob URLs
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
    }
  }, [])

  // Reset test states when changing questions
  useEffect(() => {
    setCameraTestPassed(false)
    setMicTestPassed(false)
    setShowCameraTest(false)
    setAudioLevel(0)
    
    // Stop any ongoing test
    if (testStream) {
      stopCameraTest()
    }
  }, [currentQuestionIndex])

  // Start timer when entering a video question
  useEffect(() => {
    if (allQuestions.length > 0) {
      const currentQuestion = allQuestions[currentQuestionIndex]
      const isVideoQuestion = currentQuestion.question_type === 'video' || 
                             currentQuestion.question_type === 'timed_video_response' || 
                             currentQuestion.question_type === 'video_response'
      
      if (isVideoQuestion) {
        // Check if answer already exists
        const existingAnswer = answers.get(currentQuestion.id)
        if (existingAnswer?.video_response_path) {
          // Question already answered, don't start timer or show warning
          setTimerActive(false)
          setTimeExpired(false)
          setQuestionTimer(0)
          setShowTimeWarning(false)
        } else {
          // Show time warning instead of starting timer immediately
          setShowTimeWarning(true)
          setTimerActive(false)
          setTimeExpired(false)
          setQuestionTimer(VIDEO_QUESTION_TIME_LIMIT)
        }
      } else {
        // Not a video question, disable timer and warning
        setTimerActive(false)
        setTimeExpired(false)
        setQuestionTimer(0)
        setShowTimeWarning(false)
      }
    }
  }, [currentQuestionIndex, allQuestions, answers])

  // Function to start the timer after user acknowledges warning
  const startQuestionTimer = () => {
    setShowTimeWarning(false)
    setTimerActive(true)
    setQuestionStartTime(new Date())
  }

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || questionTimer <= 0) {
      return
    }

    const interval = setInterval(() => {
      setQuestionTimer(prev => {
        if (prev <= 1) {
          // Time expired
          setTimeExpired(true)
          setTimerActive(false)
          
          // Auto-submit if recording
          if (isRecording) {
            stopRecording()
          }
          
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, questionTimer, isRecording])

  // Force submit when time expires
  useEffect(() => {
    if (timeExpired && recordedVideo) {
      // Auto-submit the recorded video
      uploadVideo(recordedVideo)
    }
  }, [timeExpired, recordedVideo])

  // Save an answer to the database
  const saveAnswer = async (questionId: number, answerData: any) => {
    setSaveStatus('saving')
    
    try {
      const result = await saveUserAnswer(attemptId, questionId, answerData)
      
      if (result) {
        // Update local state
        const newAnswers = new Map(answers)
        newAnswers.set(questionId, answerData)
        setAnswers(newAnswers)
        
        setSaveStatus('saved')
        setLastSavedAt(new Date())
      } else {
        setSaveStatus('unsaved')
        console.error('Failed to save answer')
      }
    } catch (error) {
      setSaveStatus('unsaved')
      console.error('Error saving answer:', error)
    }
  }

  // Handle different types of answer updates
  const handleAnswerChange = (questionId: number, answerType: string, value: any) => {
    const answerData: any = {}
    
    switch (answerType) {
      case 'mcq':
        answerData.mcq_option_id = parseInt(value)
        break
      case 'text':
      case 'essay':
      case 'email':
      case 'email_response':
        answerData.text_answer = value
        break
      case 'likert':
        answerData.likert_rating = parseInt(value)
        break
      case 'video':
      case 'video_response':
        answerData.video_response_path = value
        break
    }
    
    // Debounce text inputs, immediate save for selections
    if (answerType === 'text' || answerType === 'essay' || answerType === 'email' || answerType === 'email_response') {
      // Debounce text input saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveAnswer(questionId, answerData)
      }, 1000)
    } else {
      // Immediate save for selections
      saveAnswer(questionId, answerData)
    }
  }

  const handleNext = async () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleComplete = async () => {
    await completeAssessmentAttempt(attemptId)
    router.push(`/assessment/${attemptId}/complete`)
  }

  const handleSaveAndExit = async () => {
    setSaveStatus('saving')
    
    try {
      // Update the attempt with current progress
      const partId = getCurrentPartId()
      if (partId) {
        await updateAssessmentAttemptProgress(attemptId, {
          current_part_id: partId
        })
      }
      
      setSaveStatus('saved')
      setLastSavedAt(new Date())
      
      // Show confirmation and redirect
      alert('Your progress has been saved! You can continue later from where you left off.')
      router.push('/')
      
    } catch (error) {
      setSaveStatus('unsaved')
      console.error('Error saving progress:', error)
      alert('Error saving progress. Please try again.')
    }
  }

  const getCurrentPartId = () => {
    if (!assessment || !currentQuestion) return null
    
    for (const part of assessment.parts) {
      for (const block of part.blocks) {
        if (block.questions.some(q => q.id === currentQuestion.id)) {
          return part.id
        }
      }
    }
    return null
  }

  // Video recording functions
  const startRecording = async () => {
    try {
      // Build constraints with selected devices (if available)
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

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
      setMediaRecorder(recorder)
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
      alert('Could not access camera and microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
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
      const fileName = `video-response-${attemptId}-${currentQuestion.id}-${Date.now()}.webm`
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
      await handleAnswerChange(currentQuestion.id, 'video', publicUrl)
      
      setSaveStatus('saved')
      setLastSavedAt(new Date())
      
    } catch (error) {
      console.error('Error uploading video:', error)
      setSaveStatus('unsaved')
      alert('Error uploading video. Please try again.')
    }
  }

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

      setRecordedVideo(file)
      setVideoPreviewUrl(URL.createObjectURL(file))
    }
  }

  const clearVideo = () => {
    setRecordedVideo(null)
    setVideoPreviewUrl(null)
    setRecordingTime(0)
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Device enumeration functions
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
      alert('Could not access media devices. Please check permissions.')
    }
  }

  // Camera and Microphone Test Functions
  const startCameraTest = async () => {
    try {
      // Build constraints with selected devices
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setTestStream(mediaStream)
      setShowCameraTest(true)
      
      // Ensure video element is ready and assign stream
      setTimeout(() => {
        if (testVideoRef.current) {
          console.log('Assigning stream to test video element:', mediaStream)
          testVideoRef.current.srcObject = mediaStream
          // Force video to play
          testVideoRef.current.play().catch(err => {
            console.log('Video play failed:', err)
          })
        } else {
          console.log('Test video ref not ready')
        }
      }, 100)

      // Set up audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(mediaStream)
      
      analyser.smoothingTimeConstant = 0.8
      analyser.fftSize = 1024
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Start monitoring audio levels
      monitorAudioLevel()
      
      // Auto-mark camera as passed after a brief delay
      setTimeout(() => {
        setCameraTestPassed(true)
      }, 1000)

    } catch (error) {
      console.error('Error accessing camera/microphone:', error)
      alert('Could not access camera and microphone. Please check permissions and try again.')
    }
  }

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1
    
    setAudioLevel(normalizedLevel)
    
    // Auto-mark mic as passed if we detect sound above threshold
    if (normalizedLevel > 0.1) {
      setMicTestPassed(true)
    }
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
  }

  const stopCameraTest = () => {
    // Stop test stream
    if (testStream) {
      testStream.getTracks().forEach(track => track.stop())
      setTestStream(null)
    }
    
    // Clean up audio monitoring
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    analyserRef.current = null
    setShowCameraTest(false)
    setAudioLevel(0)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading Assessment...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we load your assessment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!assessment || !attempt || allQuestions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Questions Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This assessment appears to have no questions.</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = allQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-600">Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && lastSavedAt && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">Saved {lastSavedAt.toLocaleTimeString()}</span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600">Not saved</span>
                  </>
                )}
              </div>
              <span>Attempt ID: {attemptId}</span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          
          {/* Testing Utility */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-yellow-800">🧪 Testing Tools:</span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-700">
                  Answered: {answers.size}/{allQuestions.length} 
                  ({Math.round((answers.size / allQuestions.length) * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="question-jump" className="text-yellow-700">Jump to:</label>
                <select 
                  id="question-jump"
                  value={currentQuestionIndex}
                  onChange={(e) => setCurrentQuestionIndex(parseInt(e.target.value))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {allQuestions.map((question, index) => {
                    const isAnswered = answers.has(question.id)
                    return (
                      <option key={question.id} value={index}>
                        {isAnswered ? '✓' : '○'} Q{index + 1}: {getQuestionDisplayType(question).replace('_', ' ')}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-700">Quick Jump:</span>
                {(() => {
                  // Find first occurrence of each question display type
                  const typeIndexes = new Map()
                  allQuestions.forEach((q, index) => {
                    const displayType = getQuestionDisplayType(q)
                    if (!typeIndexes.has(displayType)) {
                      typeIndexes.set(displayType, index)
                    }
                  })
                  
                  return Array.from(typeIndexes.entries()).map(([type, index]) => (
                    <button
                      key={type}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs"
                      title={`Jump to first ${type.replace('_', ' ')} question`}
                    >
                      {type.replace('_', ' ').toUpperCase()}
                    </button>
                  ))
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Type: {getQuestionDisplayType(currentQuestion).toUpperCase()}
                {currentQuestion.is_required && <span className="text-red-500 ml-2">*</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Show warning screen for video questions before revealing content */}
            {(currentQuestion.question_type === 'video' || currentQuestion.question_type === 'timed_video_response' || currentQuestion.question_type === 'video_response') && showTimeWarning ? (
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
                        <strong>Preparation:</strong> Make sure you're in a quiet location with good lighting and camera access
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
                    The timer will start immediately when you click "I'm Ready to Begin" and the scenario will be revealed. This tests your ability to think under pressure.
                  </p>
                  <p className="text-red-700 text-xs">
                    Only proceed when you are completely ready to start.
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button 
                    onClick={startQuestionTimer}
                    className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 font-semibold"
                    size="lg"
                  >
                    🚀 I'm Ready to Begin
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
                  
                  {!showCameraTest ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 text-center max-w-md mx-auto">
                        We recommend testing your camera and microphone before starting the timed assessment.
                      </p>
                      
                      {/* Device Selection */}
                      {!showDeviceSelection ? (
                        <div className="flex justify-center">
                          <Button 
                            onClick={enumerateDevices}
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
                                value={selectedVideoDevice || ''}
                                onChange={(e) => setSelectedVideoDevice(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {availableVideoDevices.map((device) => (
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
                                value={selectedAudioDevice || ''}
                                onChange={(e) => setSelectedAudioDevice(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {availableAudioDevices.map((device) => (
                                  <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-center">
                            <Button 
                              onClick={startCameraTest}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              📷 Test Selected Devices
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Quick Test Option */}
                      {showDeviceSelection && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-2">Or use default devices:</p>
                          <Button 
                            onClick={startCameraTest}
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
                          ref={testVideoRef}
                          autoPlay 
                          playsInline
                          muted
                          className="w-full aspect-video object-cover"
                        />
                        
                        {/* Video Loading Indicator */}
                        {!cameraTestPassed && (
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
                            cameraTestPassed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              cameraTestPassed ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <span>Camera {cameraTestPassed ? 'Working' : 'Testing...'}</span>
                          </div>
                          
                          <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium ${
                            micTestPassed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              micTestPassed ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <span>Microphone {micTestPassed ? 'Working' : 'Speak to test'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Audio Level Indicator */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Audio Level:</span>
                          <span className="text-xs text-gray-500">
                            {micTestPassed ? '✓ Microphone detected' : 'Speak into your microphone'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-150 ${
                              audioLevel > 0.5 ? 'bg-green-500' : 
                              audioLevel > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(audioLevel * 100, 5)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Test Instructions */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• You should see yourself in the video preview</p>
                        <p>• Speak normally - the audio level bar should move and turn green</p>
                        <p>• Both indicators should show "Working" when ready</p>
                      </div>

                      {/* Troubleshooting */}
                      {showCameraTest && !cameraTestPassed && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <h5 className="font-medium text-yellow-800 mb-2">Troubleshooting Camera Issues:</h5>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Make sure you've allowed camera permissions in your browser</li>
                            <li>• Check that no other apps are using your camera</li>
                            <li>• Try refreshing the page if the video doesn't appear</li>
                            <li>• Ensure your camera is properly connected</li>
                          </ul>
                        </div>
                      )}

                      {/* Test Controls */}
                      <div className="flex justify-center space-x-3">
                        <Button 
                          onClick={stopCameraTest}
                          variant="outline"
                          size="sm"
                        >
                          Stop Test
                        </Button>
                        <Button 
                          onClick={() => {
                            stopCameraTest()
                            setShowDeviceSelection(false)
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          🔧 Change Devices
                        </Button>
                        {cameraTestPassed && micTestPassed && (
                          <Button 
                            onClick={stopCameraTest}
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
                {(currentQuestion.question_type === 'video' || currentQuestion.question_type === 'timed_video_response' || currentQuestion.question_type === 'video_response') && timerActive && (
                  <div className={`text-center p-4 rounded-lg border-2 ${
                    questionTimer <= 60 ? 'bg-red-50 border-red-300' : 
                    questionTimer <= 300 ? 'bg-yellow-50 border-yellow-300' : 
                    'bg-blue-50 border-blue-300'
                  }`}>
                    <div className="text-2xl font-bold mb-2">
                      ⏰ Time Remaining: {formatTime(questionTimer)}
                    </div>
                    {questionTimer <= 60 && (
                      <div className="text-red-700 font-medium">⚠️ Less than 1 minute remaining!</div>
                    )}
                    {questionTimer <= 300 && questionTimer > 60 && (
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
                    {currentQuestion.question_type === 'multiple_choice' || getQuestionDisplayType(currentQuestion) === 'ethical_choice' ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Select your answer:</h4>
                        {currentQuestion.mcq_options?.map((option) => (
                          <label key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={option.id}
                              checked={answers.get(currentQuestion.id)?.mcq_option_id === option.id}
                              onChange={(e) => handleAnswerChange(currentQuestion.id, 'mcq', e.target.value)}
                              className="mt-1"
                              disabled={timeExpired}
                            />
                            <span className="text-gray-800">{option.option_text}</span>
                          </label>
                        ))}
                      </div>
                    ) : currentQuestion.question_type === 'video' || currentQuestion.question_type === 'timed_video_response' || currentQuestion.question_type === 'video_response' ? (
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
                                      onClick={startRecording}
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
                                      onClick={stopRecording}
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
                                    onClick={() => uploadVideo(recordedVideo)}
                                    disabled={saveStatus === 'saving'}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {saveStatus === 'saving' ? 'Uploading...' : '✓ Submit Video'}
                                  </Button>
                                  <Button 
                                    onClick={clearVideo}
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

                        {/* Show existing video if already submitted */}
                        {answers.get(currentQuestion.id)?.video_response_path && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-900 mb-2">✓ Video Response Submitted</h5>
                            <video 
                              src={answers.get(currentQuestion.id)?.video_response_path || ''}
                              controls
                              className="w-full max-w-md bg-gray-900 rounded"
                            />
                          </div>
                        )}
                      </div>
                    ) : currentQuestion.question_type === 'email_response' || currentQuestion.question_type === 'essay' ? (
                      <div className="space-y-3">
                        <label htmlFor={`answer-${currentQuestion.id}`} className="block font-medium text-gray-900">
                          Your response:
                        </label>
                        <textarea
                          id={`answer-${currentQuestion.id}`}
                          rows={8}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type your response here..."
                          value={answers.get(currentQuestion.id)?.text_answer || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, 'text', e.target.value)}
                        />
                      </div>
                    ) : currentQuestion.question_type === 'likert_scale' ? (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Rate your response (1 = Strongly Disagree, 5 = Strongly Agree):</h4>
                        <div className="flex items-center justify-between max-w-md">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <label key={rating} className="flex flex-col items-center space-y-2">
                              <input
                                type="radio"
                                name={`likert-${currentQuestion.id}`}
                                value={rating}
                                checked={answers.get(currentQuestion.id)?.likert_rating === rating}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, 'likert', e.target.value)}
                                className="scale-150"
                              />
                              <span className="text-sm font-medium">{rating}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 max-w-md">
                          <span>Strongly Disagree</span>
                          <span>Strongly Agree</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        Question type: {currentQuestion.question_type}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSaveAndExit}>Save & Continue Later</Button>
            
            {currentQuestionIndex === allQuestions.length - 1 ? (
              <Button onClick={handleComplete}>
                Complete Assessment
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 