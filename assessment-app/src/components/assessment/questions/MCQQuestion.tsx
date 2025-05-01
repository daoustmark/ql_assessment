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
              question-option rounded-lg border 
              ${selectedOption === option.id 
                ? 'border-teal-500 bg-teal-50 shadow-sm' 
                : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'}
              p-5 cursor-pointer flex items-start transition-all duration-300
              hover:shadow-sm
            `}
            onClick={() => handleChange(option.id)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedOption === option.id}
            onKeyDown={e => {
              if (e.key === ' ' || e.key === 'Enter') handleChange(option.id);
            }}
          >
            <div className="pt-0.5 flex-shrink-0">
              <div className={`w-5 h-5 rounded-full mr-4 flex items-center justify-center
                border transition-all duration-300
                ${selectedOption === option.id 
                  ? 'border-teal-500 bg-teal-500' 
                  : 'border-gray-400 bg-white'}
              `}>
                {selectedOption === option.id && (
                  <div className="w-2 h-2 rounded-full bg-white animate-fade-in"></div>
                )}
              </div>
            </div>
            
            <span className="flex-1 select-none text-text-body">
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