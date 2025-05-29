import React, { memo } from 'react'
import type { QuestionWithOptions, UserAnswer } from '@/types'

interface LikertScaleQuestionProps {
  question: QuestionWithOptions
  currentAnswer?: UserAnswer
  onAnswerChange: (questionId: number, answerType: string, value: any) => void
  isDisabled?: boolean
}

const LikertScaleQuestion = memo(function LikertScaleQuestion({ 
  question, 
  currentAnswer, 
  onAnswerChange, 
  isDisabled = false 
}: LikertScaleQuestionProps) {
  const scaleOptions = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ]

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Rate your response (1-5):</h4>
      <div className="grid grid-cols-5 gap-2">
        {scaleOptions.map((option) => (
          <label 
            key={option.value}
            className="flex flex-col items-center space-y-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer text-center"
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={currentAnswer?.likert_rating === option.value}
              onChange={(e) => onAnswerChange(question.id, 'likert', parseInt(e.target.value))}
              disabled={isDisabled}
            />
            <span className="text-sm font-medium">{option.value}</span>
            <span className="text-xs text-gray-600">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
})

export default LikertScaleQuestion 