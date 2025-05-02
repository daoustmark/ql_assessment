'use client';

import React from 'react';
import QuestionList from '@/components/admin/QuestionList';

export default function BlockDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div>
      <QuestionList blockId={params.id} />
    </div>
  );
} 