import { Progress } from '@/components/ui/progress'

interface ProgressIndicatorProps {
  currentQuestionIndex: number
  totalQuestions: number
  saveStatus: 'saving' | 'saved' | 'unsaved'
  lastSavedAt: Date | null
  attemptId: number
  assessmentTitle: string
}

export function ProgressIndicator({
  currentQuestionIndex,
  totalQuestions,
  saveStatus,
  lastSavedAt,
  attemptId,
  assessmentTitle
}: ProgressIndicatorProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">{assessmentTitle}</h1>
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-600">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && lastSavedAt && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Saved {lastSavedAt.toLocaleTimeString()}</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600">Not saved</span>
              </>
            )}
          </div>
          <span>Attempt ID: {attemptId}</span>
        </div>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
} 