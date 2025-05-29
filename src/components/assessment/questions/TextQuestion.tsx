import React, { memo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import type { QuestionWithOptions, UserAnswer } from '@/types'

interface TextQuestionProps {
  question: QuestionWithOptions
  currentAnswer?: UserAnswer
  onAnswerChange: (questionId: number, answerType: string, value: any) => void
  isDisabled?: boolean
}

const TextQuestion = memo(function TextQuestion({ 
  question, 
  currentAnswer, 
  onAnswerChange, 
  isDisabled = false 
}: TextQuestionProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Your response:</h4>
      <Textarea
        placeholder="Enter your answer here..."
        value={currentAnswer?.text_answer || ''}
        onChange={(e) => onAnswerChange(question.id, 'text', e.target.value)}
        className="min-h-[150px]"
        disabled={isDisabled}
      />
    </div>
  )
})

export default TextQuestion 