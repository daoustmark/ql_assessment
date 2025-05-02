'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AssessmentPart } from '@/components/assessment';
import { PartTransition } from '@/components/assessment/PartTransition';
import { LoadingSpinner, ProgressBar, Card, ThemeDebugger } from '@/components/ui';
import { StepperProgress } from '@/components/ui/StepperProgress';
import { DevMode } from '@/components/assessment/DevMode';

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
          .select(`
            *,
            questions(*),
            scenarios(
              id,
              scenario_text,
              sequence_order,
              scenario_options(*)
            )
          `)
          .eq('part_id', parts[currentPartIndex].id)
          .order('sequence_order');
          
        if (blocksError) {
          throw new Error(`Failed to load blocks: ${blocksError.message}`);
        }
        
        // For blocks with scenario type but missing scenarios, fetch them separately
        const scenarioBlocks = blocksData?.filter(block => 
          (block.block_type === 'scenario' || block.block_type?.includes('scenario')) && 
          (!block.scenarios || block.scenarios.length === 0)
        ) || [];

        // If we have scenario blocks missing scenarios data, fetch them
        if (scenarioBlocks.length > 0) {
          console.log(`[DEBUG] Found ${scenarioBlocks.length} blocks missing scenario data, fetching...`);
          
          // Process blocks one by one to make sure each gets proper scenarios
          for (const block of scenarioBlocks) {
            const { data: scenariosData, error: scenariosError } = await supabase
              .from('scenarios')
              .select(`
                id,
                scenario_text,
                sequence_order,
                scenario_options(*)
              `)
              .eq('block_id', block.id)
              .order('sequence_order');
              
            if (scenariosError) {
              console.error(`Error fetching scenarios for block ${block.id}:`, scenariosError);
              continue;
            }
            
            if (scenariosData && scenariosData.length > 0) {
              // Update this block with the fetched scenarios
              block.scenarios = scenariosData;
              console.log(`[DEBUG] Added ${scenariosData.length} scenarios to block ${block.id}`);
            } else {
              console.warn(`[DEBUG] No scenarios found for block ${block.id}, type: ${block.block_type}`);
            }
          }
        }
        
        console.log(`[DEBUG] Fetched ${blocksData?.length || 0} blocks for part ${parts[currentPartIndex].id}`);
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <LoadingSpinner label="Loading assessment..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <div className="flex items-center gap-2 text-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
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
      <>
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
        
        {parts.length > 0 && (
          <DevMode 
            parts={parts}
            attemptId={attemptId}
            currentPartIndex={currentPartIndex}
            onPartSelect={setCurrentPartIndex}
          />
        )}
      </>
    );
  }
  
  return (
    <>
      <div className="min-h-screen flex flex-col items-center p-4">
        <div className="assessment-container w-full max-w-5xl mx-auto">
          {/* Assessment Header */}
          <div className="assessment-header py-4">
            <h1 className="text-xl md:text-2xl font-bold text-center text-bespoke-navy mb-2">
              {assessment?.title || "Quiet Light Advisor Skills Assessment"}
            </h1>
          </div>
          
          {/* Part Content */}
          <div className={`transition-opacity duration-300 ${isPartTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {parts.length > 0 && (
              <AssessmentPart
                part={parts[currentPartIndex]}
                totalParts={parts.length}
                attemptId={attemptId.toString()}
                onComplete={handlePartComplete}
                onBlockChange={handleBlockChange}
              />
            )}
          </div>
          
          {/* Debugger */}
          {showDebugger && <ThemeDebugger />}
        </div>
      </div>
      
      {parts.length > 0 && (
        <DevMode 
          parts={parts}
          attemptId={attemptId}
          currentPartIndex={currentPartIndex}
          onPartSelect={setCurrentPartIndex}
        />
      )}
    </>
  );
} 