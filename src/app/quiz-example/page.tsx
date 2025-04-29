'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '../../components/assessment/QuizQuestion';

// Sample questions for demonstration
const sampleQuestions = [
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"]
  },
  {
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"]
  },
  {
    question: "Which planet is closest to the Sun?",
    options: ["Mercury", "Venus", "Earth", "Mars"]
  }
];

export default function QuizExamplePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<(string | null)[]>(Array(sampleQuestions.length).fill(null));
  
  const handleSelectOption = (option: string) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = option;
    setSelectedOptions(newSelectedOptions);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      alert('Quiz completed! Your answers: ' + selectedOptions.join(', '));
    }
  };
  
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  
  return (
    <QuizQuestion
      question={currentQuestion.question}
      options={currentQuestion.options}
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={sampleQuestions.length}
      selectedOption={selectedOptions[currentQuestionIndex]}
      onSelectOption={handleSelectOption}
      onNextQuestion={handleNextQuestion}
    />
  );
} 