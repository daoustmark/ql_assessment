import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-renew-mint-25 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-bespoke-navy mb-6 text-center">Assessment App</h1>
        
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-bespoke-navy">Example Pages</h2>
          
          <div className="bg-nomad-blue-25 p-4 rounded-md">
            <h3 className="font-medium text-bespoke-navy mb-2">New Quiz Style</h3>
            <p className="text-bespoke-navy-75 mb-4">View our new modern quiz interface with the updated color palette.</p>
            <Link 
              href="/quiz-example" 
              className="inline-block bg-nomad-blue text-white py-2 px-4 rounded-md hover:bg-nomad-blue-75 transition-colors"
            >
              View Example
            </Link>
          </div>
          
          <div className="bg-nomad-blue-25 p-4 rounded-md">
            <h3 className="font-medium text-bespoke-navy mb-2">Original Assessment</h3>
            <p className="text-bespoke-navy-75 mb-4">Access the main assessment app with all features.</p>
            <Link 
              href="/assessment" 
              className="inline-block bg-nomad-blue text-white py-2 px-4 rounded-md hover:bg-nomad-blue-75 transition-colors"
            >
              Go to Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 