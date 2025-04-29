'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Assessment, AssessmentAttempt } from '@/types/assessment';

export function AssessmentStart() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchAssessments() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .order('id');
          
        if (error) {
          throw new Error(error.message);
        }
        
        setAssessments(data || []);
        
        // Select the first assessment by default if available
        if (data && data.length > 0) {
          setSelectedAssessment(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAssessments();
  }, [supabase]);
  
  useEffect(() => {
    async function fetchAttempts() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          console.log('No authenticated user, using test mode');
          // For testing, use empty attempts array
          setAttempts([]);
        } else {
          const { data: attemptData, error: attemptError } = await supabase
            .from('assessment_attempts')
            .select('*')
            .eq('user_id', userData.user.id)
            .order('started_at', { ascending: false });
            
          if (attemptError) throw attemptError;
          setAttempts(attemptData as AssessmentAttempt[]);
        }
      } catch (err) {
        console.error('Error fetching attempts:', err);
        setError('Failed to load attempts');
      }
    }
    
    fetchAttempts();
  }, [supabase]);
  
  const startAssessment = async () => {
    if (!selectedAssessment) return;
    
    try {
      setStarting(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Create a new assessment attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('assessment_attempts')
        .insert({
          user_id: user.id,
          assessment_id: selectedAssessment,
          started_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (attemptError) {
        throw new Error(attemptError.message);
      }
      
      // Redirect to the first part of the assessment
      router.push(`/assessment/${attemptData.id}`);
    } catch (err) {
      console.error('Error starting assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to start assessment');
      setStarting(false);
    }
  };
  
  // Group attempts by assessment
  const attemptsByAssessment = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.assessment_id]) {
      acc[attempt.assessment_id] = [];
    }
    acc[attempt.assessment_id].push(attempt);
    return acc;
  }, {} as Record<number, AssessmentAttempt[]>);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4">Loading assessments...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error: {error}</span>
      </div>
    );
  }
  
  if (assessments.length === 0) {
    return (
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>No assessments are currently available.</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Assessment</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose an assessment to begin:
          </label>
          <select 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
            value={selectedAssessment || ''} 
            onChange={(e) => setSelectedAssessment(Number(e.target.value))}
          >
            {assessments.map(assessment => (
              <option key={assessment.id} value={assessment.id}>
                {assessment.title}
              </option>
            ))}
          </select>
          
          {selectedAssessment && (
            <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {assessments.find(a => a.id === selectedAssessment)?.title}
              </h3>
              <p className="text-gray-700">
                {assessments.find(a => a.id === selectedAssessment)?.description}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button 
            className={`px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors flex items-center ${starting ? 'opacity-75' : ''}`}
            onClick={startAssessment}
            disabled={!selectedAssessment || starting}
          >
            {starting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting...
              </>
            ) : (
              <>
                Start Assessment
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 