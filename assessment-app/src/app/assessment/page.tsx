'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AssessmentStart } from '@/components/assessment';

export default function AssessmentsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router, supabase.auth]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <AssessmentStart />
    </div>
  );
} 