import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { QuestionContainer } from './QuestionContainer';
import { cn } from '../../utils/cn';

interface Option {
  id: string;
  text: string;
}

interface MultipleChoiceQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: Option[];
  selectedOption?: string;
  onSelect: (optionId: string) => void;
  error?: string;
  className?: string;
}

export function MultipleChoiceQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedOption,
  onSelect,
  error,
  className,
}: MultipleChoiceQuestionProps) {
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
          className="space-y-3"
        >
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <RadioGroupItem value={option.id} id={option.id} />
              <label
                htmlFor={option.id}
                className="text-base text-gray-700 cursor-pointer"
              >
                {option.text}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </QuestionContainer>
  );
} 