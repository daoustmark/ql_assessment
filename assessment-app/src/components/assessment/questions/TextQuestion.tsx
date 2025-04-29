import React, { useState, useEffect } from 'react';
import { Question, UserAnswer } from '@/types/assessment';

interface TextQuestionProps {
  question: Question;
  answer?: UserAnswer;
  onAnswer: (answer: Partial<UserAnswer>) => void;
}

export function TextQuestion({ question, answer, onAnswer }: TextQuestionProps) {
  const [text, setText] = useState<string>(answer?.text_answer || '');
  const [isFocused, setIsFocused] = useState(false);
  
  // Update text if answer changes externally
  useEffect(() => {
    if (answer?.text_answer !== undefined) {
      setText(answer.text_answer);
    }
  }, [answer?.text_answer]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Save the answer
    onAnswer({
      question_id: question.id,
      text_answer: newText
    });
  };
  
  return (
    <div className="my-6 animate-fade-in">
      <textarea
        className={`
          w-full p-4 border-2 rounded-xl focus:outline-none transition-all duration-200
          min-h-[150px] text-bespoke-navy bg-white
          ${isFocused 
            ? 'border-nomad-blue shadow-md shadow-nomad-blue/10' 
            : 'border-gray-200 shadow-sm'}
        `}
        placeholder="Type your answer here..."
        value={text}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      <div className="flex justify-between mt-2 text-sm">
        {question.is_required && text.trim() === '' && (
          <div className="text-red-500">This question requires an answer</div>
        )}
        
        <div className={`ml-auto ${text.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
          {text.length} characters
        </div>
      </div>
    </div>
  );
} 