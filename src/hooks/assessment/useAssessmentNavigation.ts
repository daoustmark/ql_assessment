import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { updateAssessmentAttemptProgress, completeAssessmentAttempt } from '@/lib/supabase/queries'
import type { AssessmentWithParts, QuestionWithOptions } from '@/types'

interface UseAssessmentNavigationProps {
  attemptId: number
  allQuestions: QuestionWithOptions[]
  assessment: AssessmentWithParts | null
}

interface UseAssessmentNavigationReturn {
  currentQuestionIndex: number
  currentQuestion: QuestionWithOptions | null
  canGoNext: boolean
  canGoPrevious: boolean
  isLastQuestion: boolean
  setCurrentQuestionIndex: (index: number) => void
  handleNext: () => Promise<void>
  handlePrevious: () => void
  handleComplete: () => Promise<void>
  handleSaveAndExit: () => Promise<void>
  getCurrentPartId: () => number | null
}

export function useAssessmentNavigation({ 
  attemptId, 
  allQuestions, 
  assessment 
}: UseAssessmentNavigationProps): UseAssessmentNavigationReturn {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Memoized derived values
  const currentQuestion = useMemo(() => 
    allQuestions.length > 0 ? allQuestions[currentQuestionIndex] : null, 
    [allQuestions, currentQuestionIndex]
  )
  
  const canGoNext = useMemo(() => 
    currentQuestionIndex < allQuestions.length - 1, 
    [currentQuestionIndex, allQuestions.length]
  )
  
  const canGoPrevious = useMemo(() => 
    currentQuestionIndex > 0, 
    [currentQuestionIndex]
  )
  
  const isLastQuestion = useMemo(() => 
    currentQuestionIndex === allQuestions.length - 1, 
    [currentQuestionIndex, allQuestions.length]
  )

  // Memoized navigation handlers
  const handleNext = useCallback(async () => {
    if (canGoNext) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }, [canGoNext, currentQuestionIndex])

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }, [canGoPrevious, currentQuestionIndex])

  const handleComplete = useCallback(async () => {
    await completeAssessmentAttempt(attemptId)
    router.push(`/assessment/${attemptId}/complete`)
  }, [attemptId, router])

  const getCurrentPartId = useCallback(() => {
    if (!assessment || !currentQuestion) return null
    
    for (const part of assessment.parts) {
      for (const block of part.blocks) {
        if (block.questions.some(q => q.id === currentQuestion.id)) {
          return part.id
        }
      }
    }
    return null
  }, [assessment, currentQuestion])

  const handleSaveAndExit = useCallback(async () => {
    try {
      // Update the attempt with current progress
      const partId = getCurrentPartId()
      if (partId) {
        await updateAssessmentAttemptProgress(attemptId, {
          current_part_id: partId
        })
      }
      
      // Show confirmation and redirect
      alert('Your progress has been saved! You can continue later from where you left off.')
      router.push('/')
      
    } catch (error) {
      console.error('Error saving progress:', error)
      alert('Error saving progress. Please try again.')
    }
  }, [attemptId, getCurrentPartId, router])

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    currentQuestionIndex,
    currentQuestion,
    canGoNext,
    canGoPrevious,
    isLastQuestion,
    setCurrentQuestionIndex,
    handleNext,
    handlePrevious,
    handleComplete,
    handleSaveAndExit,
    getCurrentPartId
  }), [
    currentQuestionIndex,
    currentQuestion,
    canGoNext,
    canGoPrevious,
    isLastQuestion,
    handleNext,
    handlePrevious,
    handleComplete,
    handleSaveAndExit,
    getCurrentPartId
  ])
} 