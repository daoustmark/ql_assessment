import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { 
  EMAIL_RESPONSE_RUBRIC, 
  VIDEO_RESPONSE_RUBRIC, 
  ETHICAL_SCENARIO_RUBRIC, 
  ESSAY_RESPONSE_RUBRIC, 
  NEGOTIATION_SCENARIO_RUBRIC,
  QuestionRubric 
} from '@/types/scoring'

interface RubricBreakdownDisplayProps {
  questionType: string
  totalPoints: number
  maxPoints: number
  // For now, we'll show the default rubric structure
  // In the future, this could be enhanced to show actual scores from the database
}

const RUBRIC_MAP: { [key: string]: QuestionRubric } = {
  'email_response': EMAIL_RESPONSE_RUBRIC,
  'video_response': VIDEO_RESPONSE_RUBRIC,
  'scenario_response': ETHICAL_SCENARIO_RUBRIC,
  'essay': ESSAY_RESPONSE_RUBRIC,
  'timed_scenario': NEGOTIATION_SCENARIO_RUBRIC
}

export function RubricBreakdownDisplay({ 
  questionType, 
  totalPoints, 
  maxPoints 
}: RubricBreakdownDisplayProps) {
  const rubric = RUBRIC_MAP[questionType]
  
  if (!rubric) {
    return (
      <div className="text-sm text-gray-500 italic">
        No detailed rubric available for this question type
      </div>
    )
  }

  // Calculate estimated breakdown based on total points
  // This is a simplified approach - in the future, actual rubric scores would be fetched from the database
  const pointsPercentage = maxPoints > 0 ? totalPoints / maxPoints : 0
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">Total Score:</span>
        <span className="font-bold">{totalPoints} / {maxPoints} points ({(pointsPercentage * 100).toFixed(1)}%)</span>
      </div>
      
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-800">Scoring Criteria:</h5>
        {rubric.criteria.map((criterion, index) => {
          // Estimate points for this criterion based on overall performance
          const estimatedPoints = Math.round(criterion.max_points * pointsPercentage)
          const criterionPercentage = criterion.max_points > 0 ? estimatedPoints / criterion.max_points * 100 : 0
          
          // Determine the level achieved based on points
          const level = criterion.levels.find(l => l.points === estimatedPoints) || 
                       criterion.levels.reduce((prev, curr) => 
                         Math.abs(curr.points - estimatedPoints) < Math.abs(prev.points - estimatedPoints) ? curr : prev
                       )
          
          return (
            <div key={index} className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h6 className="font-medium text-sm">{criterion.name}</h6>
                  <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-medium">
                    {estimatedPoints} / {criterion.max_points}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      criterionPercentage >= 80 ? 'border-green-500 text-green-700' :
                      criterionPercentage >= 60 ? 'border-blue-500 text-blue-700' :
                      criterionPercentage >= 40 ? 'border-yellow-500 text-yellow-700' :
                      'border-red-500 text-red-700'
                    }`}
                  >
                    {level.label}
                  </Badge>
                </div>
              </div>
              
              <Progress value={criterionPercentage} className="h-1.5" />
              
              <div className="mt-2 text-xs text-gray-600">
                {level.description}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <strong>Note:</strong> This breakdown shows estimated scoring based on the total points awarded. 
            For detailed criterion-by-criterion scoring, the grader would need to use the enhanced rubric scoring interface.
          </div>
        </div>
      </div>
    </div>
  )
} 