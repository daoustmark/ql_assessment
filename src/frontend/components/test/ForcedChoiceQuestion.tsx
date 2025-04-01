import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { QuestionContainer } from './QuestionContainer';
import { cn } from '../../utils/cn';

interface ForcedChoiceQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  selectedOption?: string;
  onSelect: (option: string) => void;
  error?: string;
  className?: string;
}

export function ForcedChoiceQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedOption,
  onSelect,
  error,
  className,
}: ForcedChoiceQuestionProps) {
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

        <RadioGroup
          value={selectedOption}
          onValueChange={onSelect}
          className="grid grid-cols-2 gap-4"
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors',
                selectedOption === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <label
                htmlFor={`option-${index}`}
                className="ml-2 text-base text-gray-700 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </QuestionContainer>
  );
} 