import React, { memo } from 'react'
import type { QuestionWithOptions, UserAnswer } from '@/types'

interface MultipleChoiceQuestionProps {
  question: QuestionWithOptions
  currentAnswer?: UserAnswer
  onAnswerChange: (questionId: number, answerType: string, value: any) => void
  onAutoAdvance?: () => Promise<void>
  isDisabled?: boolean
  isEthicalQuestion?: boolean
}

const MultipleChoiceQuestion = memo(function MultipleChoiceQuestion({ 
  question, 
  currentAnswer, 
  onAnswerChange, 
  onAutoAdvance,
  isDisabled = false 
}: MultipleChoiceQuestionProps) {

  const handleOptionSelect = async (optionId: string) => {
    // Save the answer first
    onAnswerChange(question.id, 'mcq', optionId)
    
    // Auto-advance after a short delay to show the selection
    if (onAutoAdvance) {
      setTimeout(async () => {
        await onAutoAdvance()
      }, 500) // 500ms delay to show selection feedback before animation
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Select your answer:</h4>
      {question.mcq_options?.map((option) => (
        <label 
          key={option.id} 
          className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
            currentAnswer?.mcq_option_id === option.id ? 'bg-blue-50 border-blue-300' : ''
          }`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.id}
            checked={currentAnswer?.mcq_option_id === option.id}
            onChange={(e) => handleOptionSelect(e.target.value)}
            className="mt-1"
            disabled={isDisabled}
          />
          <span className="text-gray-800">{option.option_text}</span>
        </label>
      ))}
    </div>
  )
})

export default MultipleChoiceQuestion 