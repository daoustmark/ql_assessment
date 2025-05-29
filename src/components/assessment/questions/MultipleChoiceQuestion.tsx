import React, { memo } from 'react'
import type { QuestionWithOptions, UserAnswer } from '@/types'

interface MultipleChoiceQuestionProps {
  question: QuestionWithOptions
  currentAnswer?: UserAnswer
  onAnswerChange: (questionId: number, answerType: string, value: any) => void
  isDisabled?: boolean
  isEthicalQuestion?: boolean
}

const MultipleChoiceQuestion = memo(function MultipleChoiceQuestion({ 
  question, 
  currentAnswer, 
  onAnswerChange, 
  isDisabled = false 
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Select your answer:</h4>
      {question.mcq_options?.map((option) => (
        <label 
          key={option.id} 
          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.id}
            checked={currentAnswer?.mcq_option_id === option.id}
            onChange={(e) => onAnswerChange(question.id, 'mcq', e.target.value)}
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