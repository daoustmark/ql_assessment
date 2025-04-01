import React from 'react';
import { Textarea } from '../ui/Textarea';
import { QuestionContainer } from './QuestionContainer';
import { cn } from '../../utils/cn';

interface TextResponseQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  minLength?: number;
  maxLength?: number;
}

export function TextResponseQuestion({
  questionNumber,
  totalQuestions,
  question,
  placeholder = 'Type your answer here...',
  value,
  onChange,
  error,
  className,
  minLength,
  maxLength,
}: TextResponseQuestionProps) {
  return (
    <QuestionContainer
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      className={className}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg text-gray-900">{question}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            minLength={minLength}
            maxLength={maxLength}
            className="min-h-[200px] resize-y"
          />
          {maxLength && (
            <p className="text-sm text-gray-500 text-right">
              {value?.length || 0}/{maxLength} characters
            </p>
          )}
        </div>
      </div>
    </QuestionContainer>
  );
} 