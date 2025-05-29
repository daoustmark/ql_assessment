'use client'

import { useParams } from 'next/navigation'
import { AssessmentContainer } from '@/components/assessment/AssessmentContainer'

export default function AssessmentPage() {
  const params = useParams()
  const attemptId = parseInt(params.attemptId as string)

  return <AssessmentContainer attemptId={attemptId} />
} 