import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { saveUserAnswer } from '@/lib/supabase/queries'
import type { AttemptWithAnswers, UserAnswer } from '@/types'

interface AnswerData {
  mcq_option_id?: number
  text_answer?: string
  likert_rating?: number
  video_response_path?: string
  scenario_id?: number
  scenario_option_id?: number
}

interface UseAnswerPersistenceProps {
  attemptId: number
  attempt: AttemptWithAnswers | null
}

interface UseAnswerPersistenceReturn {
  answers: Map<number, any>
  saveStatus: 'saved' | 'saving' | 'unsaved'
  lastSavedAt: Date | null
  handleAnswerChange: (questionId: number, answerType: string, value: any) => void
  saveAnswer: (questionId: number, answerData: any) => Promise<void>
  getAnswer: (questionId: number) => any
}

export function useAnswerPersistence({ 
  attemptId, 
  attempt 
}: UseAnswerPersistenceProps): UseAnswerPersistenceReturn {
  const [answers, setAnswers] = useState<Map<number, any>>(new Map())
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Save an answer to the database - memoized for performance
  const saveAnswer = useCallback(async (questionId: number, answerData: any) => {
    setSaveStatus('saving')
    
    try {
      const result = await saveUserAnswer(attemptId, questionId, answerData)
      
      if (result) {
        // Update local state
        setAnswers(prev => {
          const newAnswers = new Map(prev)
          newAnswers.set(questionId, answerData)
          return newAnswers
        })
        
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
  }, [attemptId])

  // Handle different types of answer updates - memoized for performance
  const handleAnswerChange = useCallback((questionId: number, answerType: string, value: any) => {
    const answerData: AnswerData = {}
    
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
      case 'scenario':
        answerData.scenario_option_id = parseInt(value)
        break
    }
    
    // Debounce text inputs, immediate save for selections
    if (answerType === 'text' || answerType === 'essay' || answerType === 'email' || answerType === 'email_response') {
      // Update local state immediately for better UX
      setAnswers(prev => {
        const newAnswers = new Map(prev)
        newAnswers.set(questionId, { ...newAnswers.get(questionId), ...answerData })
        return newAnswers
      })
      setSaveStatus('unsaved')
      
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
  }, [saveAnswer])

  // Get answer function - memoized for performance
  const getAnswer = useCallback((questionId: number) => {
    return answers.get(questionId)
  }, [answers])

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    answers,
    saveStatus,
    lastSavedAt,
    handleAnswerChange,
    saveAnswer,
    getAnswer
  }), [answers, saveStatus, lastSavedAt, handleAnswerChange, saveAnswer, getAnswer])
} 