'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AssessmentPart } from '@/components/assessment';
import { LoadingSpinner, ProgressBar, Card, ThemeDebugger } from '@/components/ui';

interface PageProps {
  params: {
    attemptId: string;
  };
}

interface Attempt {
  id: number;
  user_id: string;
  assessment_id: number;
  started_at: string;
  completed_at: string | null;
  current_part_id: number | null;
}

interface Assessment {
  id: number;
  title: string;
  description: string;
}

interface Part {
  id: number;
  assessment_id: number;
  title: string;
  description: string;
  sequence_order: number;
}

export default function AssessmentPage({ params }: PageProps) {
  const attemptId = parseInt(params.attemptId);
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Fetch attempt data and associated assessment
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push('/login');
          return;
        }
        
        // Fetch attempt
        const { data: attemptData, error: attemptError } = await supabase
          .from('assessment_attempts')
          .select('*')
          .eq('id', attemptId)
          .single();
        
        if (attemptError) {
          throw new Error(`Failed to load attempt: ${attemptError.message}`);
        }
        
        // Verify this attempt belongs to the current user
        if (attemptData.user_id !== userData.user.id) {
          throw new Error('You do not have permission to access this assessment attempt');
        }
        
        setAttempt(attemptData);
        
        // Fetch assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', attemptData.assessment_id)
          .single();
        
        if (assessmentError) {
          throw new Error(`Failed to load assessment: ${assessmentError.message}`);
        }
        
        setAssessment(assessmentData);
        
        // Fetch assessment parts
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*')
          .eq('assessment_id', assessmentData.id)
          .order('sequence_order');
        
        if (partsError) {
          throw new Error(`Failed to load assessment parts: ${partsError.message}`);
        }
        
        setParts(partsData);
      } catch (err) {
        console.error('Error loading assessment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();

    // Add keyboard shortcut to toggle debugger
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebugger(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [attemptId, router, supabase]);
  
  const handlePartComplete = async () => {
    if (currentPartIndex < parts.length - 1) {
      // Move to next part
      setCurrentPartIndex(currentPartIndex + 1);
      window.scrollTo(0, 0);
    } else {
      // Complete the assessment
      await completeAssessment();
    }
  };
  
  const completeAssessment = async () => {
    try {
      setIsSubmitting(true);
      
      // Update the attempt to completed
      const { error } = await supabase
        .from('assessment_attempts')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);
      
      if (error) {
        throw new Error(`Failed to complete assessment: ${error.message}`);
      }
      
      // Redirect to completion page
      router.push('/assessment/complete');
    } catch (err) {
      console.error('Error completing assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete assessment');
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center assessment-bg">
        <div className="animate-fade-in">
          <LoadingSpinner message="Loading assessment..." />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center assessment-bg p-4">
        <Card colorAccent="blue" className="max-w-lg w-full animate-slide-in-up">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-medium">Error</h2>
          </div>
          <p className="text-bespoke-navy">{error}</p>
        </Card>
      </div>
    );
  }
  
  if (!assessment || !attempt || parts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center assessment-bg p-4">
        <Card colorAccent="blue" className="max-w-lg w-full animate-slide-in-up">
          <div className="flex items-center gap-3 text-nomad-blue mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-medium">Information</h2>
          </div>
          <p className="text-bespoke-navy">Assessment data not found or incomplete.</p>
        </Card>
      </div>
    );
  }
  
  const currentPart = parts[currentPartIndex];
  
  return (
    <>
      {/* Show theme debugger when activated with Ctrl+Shift+D */}
      {showDebugger && <ThemeDebugger />}
      
      <div 
        className="min-h-screen assessment-bg pt-8 pb-16 px-4" 
        data-theme="assessment"
      >
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8">
            <ProgressBar
              current={currentPartIndex + 1}
              total={parts.length}
              className="mb-8"
              variant="gradient"
              showText={true}
              height="h-6"
            />
            <h1 className="text-3xl font-bold text-center mb-10 animate-slide-in-up">
              {assessment.title}
            </h1>
          </div>
          
          <AssessmentPart 
            key={currentPart.id}
            part={currentPart}
            totalParts={parts.length}
            attemptId={String(attemptId)}
            onComplete={handlePartComplete}
          />
        </div>
      </div>
    </>
  );
} 