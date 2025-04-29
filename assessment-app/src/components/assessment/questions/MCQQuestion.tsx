import React, { useState, useEffect } from 'react';
import { Question, MCQOption, UserAnswer } from '@/types/assessment';

interface MCQQuestionProps {
  question: Question;
  answer?: UserAnswer;
  onAnswer: (answer: Partial<UserAnswer>) => void;
  onNext?: () => void;
}

export function MCQQuestion({ question, answer, onAnswer, onNext }: MCQQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | undefined>(
    answer?.selected_option_id
  );
  
  // When answer changes externally, update local state
  useEffect(() => {
    setSelectedOption(answer?.selected_option_id);
  }, [answer?.selected_option_id]);
  
  const handleChange = (optionId: number) => {
    setSelectedOption(optionId);
    
    // Save answer
    onAnswer({
      question_id: question.id,
      selected_option_id: optionId
    });
    
    // If onNext is provided, automatically move to next question
    if (onNext) {
      // Small delay to allow visual feedback
      setTimeout(onNext, 500);
    }
  };
  
  // Sort options by sequence_order
  const sortedOptions = [...(question.mcq_options || [])].sort(
    (a, b) => a.sequence_order - b.sequence_order
  );
  
  return (
    <div className="animate-fade-in">      
      <div className="space-y-5">
        {sortedOptions.map((option) => (
          <div
            key={option.id}
            className={`
              question-option rounded-lg border-2 
              ${selectedOption === option.id 
                ? 'border-selected bg-hover shadow-card' 
                : 'border-unselected hover:border-primary hover:bg-hover'}
              p-5 pl-6 cursor-pointer flex items-center transition-all duration-base
              hover:shadow-card hover:-translate-y-0.5
            `}
            onClick={() => handleChange(option.id)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedOption === option.id}
            onKeyDown={e => {
              if (e.key === ' ' || e.key === 'Enter') handleChange(option.id);
            }}
          >
            <div className="radio-button__checkmark w-5 h-5 rounded-full mr-4 flex-shrink-0 flex items-center justify-center
              border-2 transition-all duration-base
              ${selectedOption === option.id 
                ? 'border-selected bg-selected' 
                : 'border-unselected bg-card'}
            ">
              {selectedOption === option.id && (
                <div className="w-2 h-2 rounded-full bg-white animate-fade-in"></div>
              )}
            </div>
            
            <span className="flex-1 select-none text-text-body text-option leading-option">
              {option.option_text}
            </span>
          </div>
        ))}
      </div>
      
      {question.is_required && !selectedOption && (
        <div className="text-error text-sm mt-4 font-medium pl-2">
          This question requires an answer
        </div>
      )}
    </div>
  );
} 