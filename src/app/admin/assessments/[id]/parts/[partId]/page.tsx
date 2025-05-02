'use client';

import React from 'react';
import BlockList from '@/components/admin/BlockList';

export default function BlocksPage({ 
  params 
}: { 
  params: { id: string; partId: string } 
}) {
  return (
    <div>
      <BlockList partId={params.partId} />
    </div>
  );
} 