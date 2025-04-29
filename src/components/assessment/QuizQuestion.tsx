import React from 'react';
import { Button } from '../ui/Button';
import { SimpleProgressBar } from './SimpleProgressBar';

interface QuizQuestionProps {
  question: string;
  options: string[];
  currentQuestion: number;
  totalQuestions: number;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  onNextQuestion: () => void;
}

export function QuizQuestion({
  question,
  options,
  currentQuestion,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNextQuestion
}: QuizQuestionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 bg-renew-mint-25 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-bespoke-navy text-center mb-10">Knowledge Assessment</h1>
        
        <SimpleProgressBar
          current={currentQuestion}
          total={totalQuestions}
          className="mb-8"
        />
        
        {/* Question card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-medium text-bespoke-navy mb-8">{question}</h2>
          
          <div className="space-y-4">
            {options.map((option, index) => (
              <label 
                key={index}
                className="flex items-center cursor-pointer group"
              >
                <div className="mr-4 flex items-center justify-center">
                  <input
                    type="radio"
                    name="quiz-option"
                    className="hidden"
                    checked={selectedOption === option}
                    onChange={() => onSelectOption(option)}
                  />
                  <div 
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      selectedOption === option 
                        ? 'border-2 border-nomad-blue'
                        : 'border border-gray-300 group-hover:border-nomad-blue'
                    }`}
                  >
                    {selectedOption === option && (
                      <div className="w-2.5 h-2.5 rounded-full bg-nomad-blue"></div>
                    )}
                  </div>
                </div>
                <span className="text-bespoke-navy">{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Next button */}
        <div className="flex justify-end">
          <Button
            variant="secondary" 
            onClick={onNextQuestion}
            disabled={!selectedOption}
            size="lg"
            className="rounded-lg font-normal px-8 py-3 text-base"
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
} 