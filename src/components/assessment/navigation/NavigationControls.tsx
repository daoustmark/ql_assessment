import { Button } from '@/components/ui/button'

interface NavigationControlsProps {
  currentQuestionIndex: number
  totalQuestions: number
  canGoNext: boolean
  canGoPrevious: boolean
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
  onSaveAndExit: () => void
  isLoading?: boolean
}

export function NavigationControls({
  currentQuestionIndex,
  totalQuestions,
  canGoNext,
  canGoPrevious,
  onPrevious,
  onNext,
  onComplete,
  onSaveAndExit,
  isLoading = false
}: NavigationControlsProps) {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={!canGoPrevious || isLoading}
      >
        Previous
      </Button>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onSaveAndExit}
          disabled={isLoading}
        >
          Save & Continue Later
        </Button>
        
        {isLastQuestion ? (
          <Button 
            onClick={onComplete}
            disabled={isLoading}
          >
            Complete Assessment
          </Button>
        ) : (
          <Button 
            onClick={onNext}
            disabled={!canGoNext || isLoading}
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  )
} 