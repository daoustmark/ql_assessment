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
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Assessment Progress</h2>
            <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-yellow-600 font-medium">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && lastSavedAt && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Saved {lastSavedAt.toLocaleTimeString()}</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600 font-medium">Not saved</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </div>
      </div>
    </div>
  )
} 