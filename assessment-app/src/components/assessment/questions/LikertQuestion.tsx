import React, { useState, useEffect } from 'react';
import { Question, LikertStatement, UserAnswer } from '@/types/assessment';

interface LikertQuestionProps {
  question: Question;
  answer?: UserAnswer;
  onAnswer: (answer: Partial<UserAnswer>) => void;
}

export function LikertQuestion({ question, answer, onAnswer }: LikertQuestionProps) {
  const [rating, setRating] = useState<number | undefined>(answer?.likert_value);
  
  // When answer changes externally, update local state
  useEffect(() => {
    setRating(answer?.likert_value);
  }, [answer?.likert_value]);
  
  const handleRatingChange = (value: number) => {
    setRating(value);
    
    onAnswer({
      question_id: question.id,
      likert_value: value
    });
  };
  
  // The scale labels
  const scaleLabels = [
    'Strongly Disagree',
    'Disagree',
    'Neutral',
    'Agree',
    'Strongly Agree'
  ];
  
  return (
    <div className="my-6">
      <h3 className="text-lg font-medium mb-4">{question.question_text}</h3>
      
      {/* Statements */}
      <div className="space-y-6">
        {question.likert_statements?.sort((a, b) => a.sequence_order - b.sequence_order).map((statement) => (
          <div key={statement.id} className="w-full">
            <p className="mb-2">{statement.statement_text}</p>
            
            <div className="flex flex-col sm:flex-row justify-between">
              {/* Rating scale */}
              <div className="grid grid-cols-5 gap-1 w-full max-w-xl">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <button
                      type="button"
                      className={`
                        w-full py-2 border rounded-md transition-colors
                        ${rating === value ? 'bg-primary text-white' : 'hover:bg-base-200'}
                      `}
                      onClick={() => handleRatingChange(value)}
                    >
                      {value}
                    </button>
                    <span className="text-xs mt-1 text-center">{scaleLabels[value - 1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {question.is_required && rating === undefined && (
        <div className="text-error text-sm mt-4">This question requires an answer</div>
      )}
    </div>
  );
} 