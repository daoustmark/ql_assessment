import { useState, useEffect } from 'react'
import type { QuestionWithOptions } from '@/types'

interface UseQuestionTimerProps {
  currentQuestion: QuestionWithOptions | null
  answers: Map<number, any>
  onAutoSubmit: () => void
}

interface UseQuestionTimerReturn {
  questionTimer: number
  timerActive: boolean
  timeExpired: boolean
  showTimeWarning: boolean
  startQuestionTimer: () => void
  formatTime: (seconds: number) => string
}

export function useQuestionTimer({ 
  currentQuestion, 
  answers, 
  onAutoSubmit 
}: UseQuestionTimerProps): UseQuestionTimerReturn {
  const [questionTimer, setQuestionTimer] = useState<number>(0)
  const [timerActive, setTimerActive] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)
  const [showTimeWarning, setShowTimeWarning] = useState(false)

  // Timer constants
  const VIDEO_QUESTION_TIME_LIMIT = 10 * 60 // 10 minutes in seconds

  // Start timer when entering a video question
  useEffect(() => {
    if (currentQuestion) {
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
  }, [currentQuestion, answers])

  // Function to start the timer after user acknowledges warning
  const startQuestionTimer = () => {
    setShowTimeWarning(false)
    setTimerActive(true)
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
          
          // Trigger auto-submission
          onAutoSubmit()
          
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, questionTimer, onAutoSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    questionTimer,
    timerActive,
    timeExpired,
    showTimeWarning,
    startQuestionTimer,
    formatTime
  }
} 