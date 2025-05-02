'use client';

import React from 'react';
import AssessmentForm from '@/components/admin/AssessmentForm';

export default function EditAssessmentPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div>
      <AssessmentForm assessmentId={params.id} />
    </div>
  );
} 