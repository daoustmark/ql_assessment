'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AssessmentPart } from '@/components/assessment';
import { PartTransition } from '@/components/assessment/PartTransition';
import { LoadingSpinner, ProgressBar, Card, ThemeDebugger } from '@/components/ui';
import { StepperProgress } from '@/components/ui/StepperProgress';

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
  const router = useRouter();
  const supabase = createClient();
  
  const [attemptId, setAttemptId] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [isPartTransitioning, setIsPartTransitioning] = useState(false);
  const [showPartTransition, setShowPartTransition] = useState(false);
  const [completedPartIndex, setCompletedPartIndex] = useState<number | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  
  useEffect(() => {
    if (params && params.attemptId) {
      const id = parseInt(params.attemptId);
      if (!isNaN(id)) {
        setAttemptId(id);
      }
    }
  }, [params]);
  
  useEffect(() => {
    if (attemptId <= 0) return;
    
    async function fetchData() {
      try {
        setLoading(true);
        
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push('/login');
          return;
        }
        
        const { data: attemptData, error: attemptError } = await supabase
          .from('assessment_attempts')
          .select('*')
          .eq('id', attemptId)
          .single();
        
        if (attemptError) {
          throw new Error(`Failed to load attempt: ${attemptError.message}`);
        }
        
        if (attemptData.user_id !== userData.user.id) {
          throw new Error('You do not have permission to access this assessment attempt');
        }
        
        setAttempt(attemptData);
        
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', attemptData.assessment_id)
          .single();
        
        if (assessmentError) {
          throw new Error(`Failed to load assessment: ${assessmentError.message}`);
        }
        
        if (assessmentData && assessmentData.title === "Business Valuation Assessment") {
          assessmentData.title = "Quiet Light Advisor Skills Assessment";
        }
        
        setAssessment(assessmentData);
        
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*')
          .eq('assessment_id', assessmentData.id)
          .order('sequence_order');
        
        if (partsError) {
          throw new Error(`Failed to load assessment parts: ${partsError.message}`);
        }
        
        setParts(partsData);
        
        // Fetch blocks for the current part
        if (partsData && partsData.length > 0) {
          const { data: blocksData, error: blocksError } = await supabase
            .from('blocks')
            .select('*')
            .eq('part_id', partsData[0].id)
            .order('sequence_order');
            
          if (blocksError) {
            throw new Error(`Failed to load blocks: ${blocksError.message}`);
          }
          
          setBlocks(blocksData || []);
          setCurrentBlock(blocksData?.[0] || null);
        }
        
        console.log(`[DEBUG-INIT] Loaded ${partsData.length} parts:`, 
          partsData.map(p => ({id: p.id, title: p.title, sequence: p.sequence_order}))
        );
      } catch (err) {
        console.error('Error loading assessment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();

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
  
  // Update blocks when part changes
  useEffect(() => {
    async function fetchBlocks() {
      if (!parts[currentPartIndex]) return;
      
      try {
        const { data: blocksData, error: blocksError } = await supabase
          .from('blocks')
          .select('*')
          .eq('part_id', parts[currentPartIndex].id)
          .order('sequence_order');
          
        if (blocksError) {
          throw new Error(`Failed to load blocks: ${blocksError.message}`);
        }
        
        setBlocks(blocksData || []);
        setCurrentBlock(blocksData?.[0] || null);
        setCurrentBlockIndex(0);
        setCurrentQuestionIndex(0);
      } catch (err) {
        console.error('Error loading blocks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blocks');
      }
    }
    
    fetchBlocks();
  }, [currentPartIndex, parts, supabase]);
  
  const handlePartComplete = async () => {
    console.log("[DEBUG-PAGE] handlePartComplete called");
    console.log(`[DEBUG-PAGE] Current part index: ${currentPartIndex}, Total parts: ${parts.length}`);
    console.log(`[DEBUG-PAGE] Parts array:`, JSON.stringify(parts.map(p => ({id: p.id, title: p.title}))));
    
    if (!Array.isArray(parts) || parts.length === 0) {
      console.error("[DEBUG-PAGE] Parts array is invalid:", parts);
      return;
    }
    
    if (currentPartIndex < parts.length - 1) {
      setCompletedPartIndex(currentPartIndex);
      setShowPartTransition(true);
    } else {
      console.log("[DEBUG-PAGE] This is the final part, completing assessment");
      
      const timeoutId = setTimeout(() => {
        console.warn("[DEBUG-PAGE] Assessment completion timeout - forcing navigation");
        router.push('/assessment/complete');
      }, 8000);
      
      try {
        await completeAssessment();
        clearTimeout(timeoutId);
      } catch (error) {
        console.error("[DEBUG-PAGE] Error in handlePartComplete:", error);
        clearTimeout(timeoutId);
        
        setTimeout(() => {
          console.log("[DEBUG-PAGE] Forcing navigation after error");
          router.push('/assessment/complete');
        }, 2000);
      }
    }
  };
  
  const handleContinueToNextPart = () => {
    setShowPartTransition(false);
    setIsPartTransitioning(true);
    
    setTimeout(() => {
      const nextPartIndex = completedPartIndex !== null ? completedPartIndex + 1 : currentPartIndex + 1;
      setCurrentPartIndex(nextPartIndex);
      window.scrollTo(0, 0);
      
      setTimeout(() => {
        setIsPartTransitioning(false);
      }, 300);
    }, 300);
  };
  
  const completeAssessment = async () => {
    console.log("[DEBUG-PAGE] Starting completeAssessment");
    try {
      setIsSubmitting(true);
      
      console.log("[DEBUG-PAGE] Updating assessment_attempts with completed_at");
      const { error } = await supabase
        .from('assessment_attempts')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);
      
      if (error) {
        console.error("[DEBUG-PAGE] Error updating assessment_attempts:", error);
        throw new Error(`Failed to complete assessment: ${error.message}`);
      }
      
      console.log("[DEBUG-PAGE] Successfully completed assessment, redirecting to completion page");
      router.push('/assessment/complete');
    } catch (err) {
      console.error("[DEBUG-PAGE] Error in completeAssessment:", err);
      setError(err instanceof Error ? err.message : 'Failed to complete assessment');
      
      setTimeout(() => {
        console.log("[DEBUG-PAGE] Forcing navigation after completeAssessment error");
        router.push('/assessment/complete');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBlockChange = (blockIndex: number, questionIndex: number, block: any) => {
    setCurrentBlockIndex(blockIndex);
    setCurrentQuestionIndex(questionIndex);
    setCurrentBlock(block);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center assessment-bg">
        <div className="animate-fade-in">
          <LoadingSpinner size="large" label="Loading assessment..." />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center assessment-bg p-4">
        <Card className="max-w-lg w-full animate-slide-in-up">
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
        <Card className="max-w-lg w-full animate-slide-in-up">
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
  
  if (showPartTransition && completedPartIndex !== null && completedPartIndex + 1 < parts.length) {
    const completedPart = parts[completedPartIndex];
    const nextPart = parts[completedPartIndex + 1];
    
    return (
      <div className="min-h-screen assessment-bg pt-8 pb-16 px-4" data-theme="assessment">
        <PartTransition
          completedPartTitle={completedPart.title}
          completedPartNumber={completedPartIndex + 1}
          nextPartTitle={nextPart.title}
          nextPartNumber={completedPartIndex + 2}
          totalParts={parts.length}
          assessmentTitle={assessment?.title || "Quiet Light Advisor Skills Assessment"}
          onContinue={handleContinueToNextPart}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-bespoke-navy mb-4">
          {assessment?.title}
        </h1>

        {/* Overall Progress - Stepper Style */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <StepperProgress 
            steps={parts.map(part => part.title)}
            currentStep={currentPartIndex}
          />
        </div>

        {/* Part Title - Centered */}
        <h2 className="text-2xl font-semibold text-bespoke-navy mb-4 text-center">
          {parts[currentPartIndex]?.title}
        </h2>

        {/* Side by Side Progress Bars in a Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Block Progress</span>
                <span className="text-sm font-medium">{currentBlockIndex} of {blocks.length}</span>
              </div>
              <ProgressBar
                current={currentBlockIndex}
                total={blocks.length}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Question Progress</span>
                <span className="text-sm font-medium">{currentQuestionIndex} of {currentBlock?.questions?.length || 1}</span>
              </div>
              <ProgressBar
                current={currentQuestionIndex}
                total={currentBlock?.questions?.length || 1}
              />
            </div>
          </div>
        </div>

        {/* Assessment Content */}
        <div className="animate-fade-in">
          <AssessmentPart
            part={parts[currentPartIndex]}
            totalParts={parts.length}
            attemptId={attemptId.toString()}
            onComplete={handlePartComplete}
            onBlockChange={handleBlockChange}
          />
        </div>

        {/* Debugger */}
        {showDebugger && <ThemeDebugger />}
      </div>
    </div>
  );
} 