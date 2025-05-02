import React from 'react';
import { Card } from '../ui/Card';

interface TimedScenarioSplashProps {
  onStart: () => void;
  title?: string;
}

export function TimedScenarioSplash({ onStart, title = "Time Negotiation Challenge" }: TimedScenarioSplashProps) {
  return (
    <Card className="animate-slide-in-up bg-blue-50 max-w-3xl mx-auto">
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-6">{title}</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Timed Response Scenario</h3>
          
          <div className="text-left space-y-4 mb-6">
            <p>On the next screen, you'll be presented with a challenging business scenario that requires a time-sensitive response.</p>
            
            <p><strong>You'll have 5 minutes</strong> to craft your response once you proceed to the next screen. The timer will begin automatically.</p>
            
            <p>This exercise is designed to assess how you handle pressure and make decisions with limited time, similar to real-world business situations.</p>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4">
              <p className="font-medium text-amber-800">Important:</p>
              <ul className="list-disc list-inside text-amber-700 text-sm space-y-1 mt-2">
                <li>The timer cannot be paused once started</li>
                <li>Ensure you're in a distraction-free environment before proceeding</li>
                <li>Have your thoughts organized and be ready to type your response</li>
                <li>You can continue working after time expires, but the 5-minute limit will be noted</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={onStart}
            className="btn btn-primary btn-lg w-full"
          >
            I'm Ready to Begin
          </button>
        </div>
        
        <p className="text-sm text-gray-500">
          Click the button above only when you are fully prepared to start the timed scenario.
        </p>
      </div>
    </Card>
  );
} 