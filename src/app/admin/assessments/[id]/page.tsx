'use client';

import React from 'react';
import AssessmentDetail from '@/components/admin/AssessmentDetail';

export default function AssessmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <AssessmentDetail assessmentId={params.id} />
    </div>
  );
} 