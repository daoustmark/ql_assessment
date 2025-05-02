import React, { useState, useEffect } from 'react';
import { Block, Scenario, ScenarioOption, UserAnswer, Question } from '@/types/assessment';
import { Timer } from '../Timer';
import { TimedScenarioSplash } from '../TimedScenarioSplash';

interface ScenarioQuestionProps {
  block: Block;
  scenario: Scenario;
  answer?: UserAnswer;
  onAnswer: (answer: Partial<UserAnswer>) => void;
  question?: Question;
  onBlockComplete?: () => void;
}

export function ScenarioQuestion({ 
  block, 
  scenario, 
  answer, 
  onAnswer, 
  question,
  onBlockComplete 
}: ScenarioQuestionProps) {
  console.log("[DEBUG] ScenarioQuestion props:", { block, scenario, answer, question });
  
  // Handle different scenario types
  const isTimedResponse = block.block_type === 'scenario' && 
    (block.description?.includes('Timed') || block.description === 'timed-scenario-response');
  console.log("[DEBUG] Is timed response:", isTimedResponse);
  
  const hasOptions = scenario.scenario_options && scenario.scenario_options.length > 0;
  
  // For multiple-choice scenarios
  const initialOption = answer?.selected_option_id || answer?.scenario_option_id;
  const [selectedOption, setSelectedOption] = useState<number | undefined>(initialOption);
  
  // For text response scenarios
  const initialText = answer?.text_answer || '';
  const [textAnswer, setTextAnswer] = useState<string>(initialText);
  
  // State to track if time is up
  const [timeIsUp, setTimeIsUp] = useState(false);
  
  // State to track if the form is submitted
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State to track if the splash screen is shown for timed scenarios
  const [showingSplash, setShowingSplash] = useState(isTimedResponse && !answer?.id);
  
  // When answer changes externally, update local state
  useEffect(() => {
    if (hasOptions) {
      const newOptionId = answer?.selected_option_id || answer?.scenario_option_id;
      if (newOptionId !== selectedOption) {
        setSelectedOption(newOptionId);
      }
    } else {
      const newText = answer?.text_answer || '';
      if (newText !== textAnswer) {
        setTextAnswer(newText);
      }
    }
    
    // If there's already an answer, don't show the splash screen
    if (answer?.id) {
      setShowingSplash(false);
    }
  }, [answer, selectedOption, textAnswer, hasOptions]);
  
  // Get related questions for this scenario if question prop is not provided
  const relatedQuestions = block.questions || [];
  
  // Use the provided question prop if available, otherwise find the first relevant question
  const questionToUse = question || (isTimedResponse 
    ? relatedQuestions.find(q => q.question_type === 'textarea')
    : relatedQuestions.find(q => q.question_type === 'multiple-choice'));
  
  if (!questionToUse) {
    return (
      <div className="text-error">
        <p>Error: Question configuration missing</p>
        <p className="text-sm">Block type: {block.block_type}, Block ID: {block.id}</p>
      </div>
    );
  }
  
  const handleMultipleChoiceChange = (optionId: number) => {
    setSelectedOption(optionId);
    
    onAnswer({
      question_id: questionToUse.id,
      selected_option_id: optionId,
      scenario_option_id: optionId // Set both fields for compatibility
    });
  };
  
  const handleTextChange = (text: string) => {
    // Don't allow changes if time is up or already submitted
    if (timeIsUp || isSubmitted) return;
    
    setTextAnswer(text);
    
    onAnswer({
      question_id: questionToUse.id,
      text_answer: text
    });
  };
  
  // Handle timer completion
  const handleTimeUp = () => {
    setTimeIsUp(true);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Save the final answer if needed
    onAnswer({
      question_id: questionToUse.id,
      text_answer: textAnswer
    });
    
    setIsSubmitted(true);
    
    // Move to the next block if the callback is provided
    if (onBlockComplete) {
      onBlockComplete();
    }
  };
  
  // Handle starting the timed scenario
  const handleStartTimedScenario = () => {
    setShowingSplash(false);
  };
  
  // Format scenario text for display
  const formatScenarioText = (text: string) => {
    if (!text) return "No scenario text available";
    
    // Split text by newlines and wrap with paragraph tags
    return text.split("\n\n").map((paragraph, i) => (
      <p key={i} className="my-3">{paragraph}</p>
    ));
  };
  
  // For timed response scenarios, show splash screen first if needed
  if (isTimedResponse) {
    // Show splash screen if showingSplash is true
    if (showingSplash) {
      return (
        <TimedScenarioSplash 
          onStart={handleStartTimedScenario} 
          title={block.title}
        />
      );
    }
    
    // Otherwise show the actual timed scenario
    return (
      <div className="my-6">
        {/* Timer for timed responses - 5 minutes (300 seconds) */}
        <div className="mb-6">
          <Timer initialTime={300} onTimeUp={handleTimeUp} />
          {timeIsUp && (
            <div className="mt-2 p-2 bg-amber-50 text-amber-700 border border-amber-200 rounded">
              <p className="font-medium">Time's up!</p>
              <p className="text-sm">Your time has expired. Please submit your response now.</p>
            </div>
          )}
        </div>
        
        <div className="bg-base-100 p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-4">{block.title}</h3>
          <div className="prose max-w-none">
            {formatScenarioText(scenario.scenario_text)}
          </div>
        </div>
        
        <h4 className="text-md font-medium mb-4">{questionToUse.question_text || "Respond to this scenario:"}</h4>
        
        {/* Basic WYSIWYG Editor */}
        <div className="border rounded-lg overflow-hidden mb-2">
          <div className={`bg-gray-100 p-2 border-b flex gap-2 ${timeIsUp ? 'opacity-50' : ''}`}>
            <button 
              type="button"
              onClick={() => handleTextChange(textAnswer + '**Bold Text**')}
              className="px-2 py-1 bg-white rounded border hover:bg-gray-50"
              title="Bold"
              disabled={timeIsUp || isSubmitted}
            >
              <strong>B</strong>
            </button>
            <button 
              type="button"
              onClick={() => handleTextChange(textAnswer + '_Italic Text_')}
              className="px-2 py-1 bg-white rounded border hover:bg-gray-50 italic"
              title="Italic"
              disabled={timeIsUp || isSubmitted}
            >
              <em>I</em>
            </button>
            <button 
              type="button"
              onClick={() => handleTextChange(textAnswer + '\n\n• List item')}
              className="px-2 py-1 bg-white rounded border hover:bg-gray-50"
              title="Bullet List"
              disabled={timeIsUp || isSubmitted}
            >
              • List
            </button>
            <button 
              type="button"
              onClick={() => handleTextChange(textAnswer + '\n\n1. Numbered item')}
              className="px-2 py-1 bg-white rounded border hover:bg-gray-50"
              title="Numbered List"
              disabled={timeIsUp || isSubmitted}
            >
              1. List
            </button>
          </div>
          <textarea 
            className="textarea w-full border-none p-3 h-48 focus:outline-none focus:ring-1 focus:ring-primary"
            value={textAnswer}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your response here..."
            disabled={timeIsUp || isSubmitted}
            readOnly={timeIsUp || isSubmitted}
          ></textarea>
        </div>
        
        <div className="text-xs text-gray-500 mb-4">
          {!timeIsUp && !isSubmitted && "You can use markdown formatting: **bold**, _italic_, • bullets, 1. numbered lists"}
          {timeIsUp && !isSubmitted && "Time's up. Please submit your response to continue."}
          {isSubmitted && "Your response has been submitted."}
        </div>
        
        {questionToUse.is_required && !textAnswer && !isSubmitted && (
          <div className="text-error text-sm mt-2 mb-4">This question requires an answer</div>
        )}
        
        {/* Submit button */}
        <div className="mt-6">
          <button 
            onClick={handleSubmit}
            className={`btn ${timeIsUp ? 'btn-error' : 'btn-primary'} ${isSubmitted ? 'btn-disabled' : ''} w-full md:w-auto`}
            disabled={isSubmitted || (questionToUse.is_required && !textAnswer)}
          >
            {isSubmitted ? 'Submitted' : (timeIsUp ? 'Submit Response Now' : 'Submit Response')}
          </button>
          
          {timeIsUp && !isSubmitted && (
            <p className="text-sm text-error mt-2">
              Time has expired. You must submit your response to continue.
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // For scenarios missing options - display error only if it's not a timed response
  if (!hasOptions) {
    console.error(`Scenario ${scenario.id} has no options`);
    return (
      <div className="my-6">
        <div className="bg-base-100 p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-2">{block.title}</h3>
          <div className="prose">
            {formatScenarioText(scenario.scenario_text)}
          </div>
        </div>
        
        <h4 className="text-md font-medium mb-4">{questionToUse.question_text}</h4>
        
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Error: No options available for this scenario</span>
        </div>
      </div>
    );
  }
  
  // For multiple-choice scenarios
  // Sort options by sequence_order
  const sortedOptions = [...(scenario.scenario_options || [])].sort(
    (a, b) => a.sequence_order - b.sequence_order
  );
  
  return (
    <div className="my-6">
      <div className="bg-base-100 p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-2">{block.title}</h3>
        <div className="prose">
          {formatScenarioText(scenario.scenario_text)}
        </div>
      </div>
      
      <h4 className="text-md font-medium mb-4">{questionToUse.question_text}</h4>
      
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
              name={`question-${questionToUse.id}`}
              className="radio radio-primary mr-3"
              checked={selectedOption === option.id}
              onChange={() => handleMultipleChoiceChange(option.id)}
            />
            <span>{option.option_text}</span>
          </label>
        ))}
      </div>
      
      {questionToUse.is_required && !selectedOption && (
        <div className="text-error text-sm mt-2">This question requires an answer</div>
      )}
      
      {/* Submit button for multiple-choice questions */}
      <div className="mt-6">
        <button 
          onClick={handleSubmit}
          className="btn btn-primary w-full md:w-auto"
          disabled={questionToUse.is_required && !selectedOption}
        >
          Submit Response
        </button>
      </div>
    </div>
  );
} 