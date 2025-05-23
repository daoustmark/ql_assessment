'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AssessmentCompletePage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-green-600">Assessment Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-lg text-muted-foreground mb-2">
                Congratulations! You have successfully completed the assessment.
              </p>
              <p className="text-sm text-muted-foreground">
                Attempt ID: {attemptId}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Your responses have been saved securely</li>
                <li>• The assessment will be reviewed and scored</li>
                <li>• You will be contacted with results if applicable</li>
                <li>• Thank you for your time and effort</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => router.push('/')}
                className="w-full sm:w-auto"
              >
                Return to Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.print()}
                className="w-full sm:w-auto"
              >
                Print Confirmation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 