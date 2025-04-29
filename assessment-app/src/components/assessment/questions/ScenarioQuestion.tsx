import React, { useState, useEffect } from 'react';
import { Block, Scenario, ScenarioOption, UserAnswer } from '@/types/assessment';

interface ScenarioQuestionProps {
  block: Block;
  scenario: Scenario;
  answer?: UserAnswer;
  onAnswer: (answer: Partial<UserAnswer>) => void;
}

export function ScenarioQuestion({ block, scenario, answer, onAnswer }: ScenarioQuestionProps) {
  // Get option ID from either field
  const initialOption = answer?.selected_option_id || answer?.scenario_option_id;
  const [selectedOption, setSelectedOption] = useState<number | undefined>(initialOption);
  
  // When answer changes externally, update local state
  useEffect(() => {
    const newOptionId = answer?.selected_option_id || answer?.scenario_option_id;
    if (newOptionId !== selectedOption) {
      setSelectedOption(newOptionId);
    }
  }, [answer, selectedOption]);
  
  // Get related questions for this scenario
  const relatedQuestions = block.questions || [];
  
  // Find the first question related to this scenario
  const question = relatedQuestions.find(q => q.question_type === 'multiple-choice');
  
  if (!question) {
    return <div className="text-error">Error: Question configuration missing</div>;
  }
  
  const handleChange = (optionId: number) => {
    setSelectedOption(optionId);
    
    onAnswer({
      question_id: question.id,
      selected_option_id: optionId,
      scenario_option_id: optionId // Set both fields for compatibility
    });
  };
  
  // Check if scenario has options
  if (!scenario.scenario_options || scenario.scenario_options.length === 0) {
    console.error(`Scenario ${scenario.id} has no options`);
    return (
      <div className="my-6">
        <div className="bg-base-100 p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-2">{block.title}</h3>
          <div className="prose">
            <p>{scenario.scenario_text}</p>
          </div>
        </div>
        
        <h4 className="text-md font-medium mb-4">{question.question_text}</h4>
        
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Error: No options available for this scenario</span>
        </div>
      </div>
    );
  }
  
  // Sort options by sequence_order
  const sortedOptions = [...(scenario.scenario_options || [])].sort(
    (a, b) => a.sequence_order - b.sequence_order
  );
  
  return (
    <div className="my-6">
      <div className="bg-base-100 p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-2">{block.title}</h3>
        <div className="prose">
          <p>{scenario.scenario_text || "No scenario text available"}</p>
        </div>
      </div>
      
      <h4 className="text-md font-medium mb-4">{question.question_text}</h4>
      
      <div className="space-y-3">
        {sortedOptions.map((option) => (
          <label 
            key={option.id} 
            className={`
              flex items-center p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedOption === option.id 
                ? 'bg-primary-100 border-primary-500' 
                : 'hover:bg-base-200'}
            `}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              className="radio radio-primary mr-3"
              checked={selectedOption === option.id}
              onChange={() => handleChange(option.id)}
            />
            <span>{option.option_text}</span>
          </label>
        ))}
      </div>
      
      {question.is_required && !selectedOption && (
        <div className="text-error text-sm mt-2">This question requires an answer</div>
      )}
    </div>
  );
} 