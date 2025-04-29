'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/assessment');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Assessment App</h1>
        <p className="mb-4">Redirecting to assessments...</p>
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    </div>
  );
}
