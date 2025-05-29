import type { QuestionWithOptions } from '@/types'

interface TestingUtilityProps {
  currentQuestionIndex: number
  allQuestions: QuestionWithOptions[]
  answers: Map<number, any>
  onQuestionJump: (index: number) => void
  getQuestionDisplayType: (question: QuestionWithOptions) => string
}

export function TestingUtility({
  currentQuestionIndex,
  allQuestions,
  answers,
  onQuestionJump,
  getQuestionDisplayType
}: TestingUtilityProps) {
  // Find first occurrence of each question display type for quick navigation
  const typeIndexes = new Map()
  allQuestions.forEach((q, index) => {
    const displayType = getQuestionDisplayType(q)
    if (!typeIndexes.has(displayType)) {
      typeIndexes.set(displayType, index)
    }
  })

  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-yellow-800">🧪 Testing Tools:</span>
        
        <div className="flex items-center gap-2">
          <span className="text-yellow-700">
            Answered: {answers.size}/{allQuestions.length} 
            ({Math.round((answers.size / allQuestions.length) * 100)}%)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="question-jump" className="text-yellow-700">Jump to:</label>
          <select 
            id="question-jump"
            value={currentQuestionIndex}
            onChange={(e) => onQuestionJump(parseInt(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            {allQuestions.map((question, index) => {
              const isAnswered = answers.has(question.id)
              return (
                <option key={question.id} value={index}>
                  {isAnswered ? '✓' : '○'} Q{index + 1}: {getQuestionDisplayType(question).replace('_', ' ')}
                </option>
              )
            })}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-yellow-700">Quick Jump:</span>
          {Array.from(typeIndexes.entries()).map(([type, index]) => (
            <button
              key={type}
              onClick={() => onQuestionJump(index)}
              className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs"
              title={`Jump to first ${type.replace('_', ' ')} question`}
            >
              {type.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 