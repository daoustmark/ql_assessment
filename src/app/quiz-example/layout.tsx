import React from 'react';

export const metadata = {
  title: 'Quiz Example | Assessment App',
  description: 'Example quiz using our custom styling',
};

export default function QuizExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="quiz-example-layout">
      {children}
    </div>
  );
} 