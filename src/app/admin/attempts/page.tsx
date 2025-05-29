import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle,
  BarChart3,
  Edit,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { getAllAttempts } from '@/lib/supabase/admin-queries'
import { getAssessmentScoringStatus } from '@/lib/supabase/scoring'
import type { AssessmentAttemptWithProgress } from '@/types'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AttemptWithScoringStatus {
  id: number;
  started_at: string;
  completed_at: string | null;
  invitee_name?: string | null;
  invitee_email?: string | null;
  user_id?: string | null;
  assessments?: { title: string };
  invitation?: any;
  progress?: any;
  scoring_status?: {
    total_questions: number;
    auto_scored: number;
    manually_scored: number;
    pending_manual: number;
    auto_scoring_complete: boolean;
    manual_scoring_complete: boolean;
    overall_complete: boolean;
  };
}

export default async function AttemptsPage() {
  const attempts = await getAllAttempts()

  // Enhance attempts with scoring status for completed attempts
  const attemptsWithScoring: AttemptWithScoringStatus[] = await Promise.all(
    attempts.map(async (attempt) => {
      if (attempt.completed_at) {
        try {
          const scoringStatus = await getAssessmentScoringStatus(attempt.id)
          return { ...attempt, scoring_status: scoringStatus }
        } catch (error) {
          console.error(`Error getting scoring status for attempt ${attempt.id}:`, error)
          return { ...attempt, scoring_status: undefined }
        }
      }
      return { ...attempt, scoring_status: undefined }
    })
  )

  // Calculate summary statistics
  const totalAttempts = attemptsWithScoring.length
  const completedAttempts = attemptsWithScoring.filter(a => a.completed_at).length
  const inProgressAttempts = totalAttempts - completedAttempts
  const needsManualGrading = attemptsWithScoring.filter(a => 
    a.completed_at && a.scoring_status && !a.scoring_status.manual_scoring_complete
  ).length
  const averageProgress = attemptsWithScoring.length > 0 
    ? Math.round(attemptsWithScoring.reduce((sum, attempt) => sum + (attempt.progress?.percentage || 0), 0) / attemptsWithScoring.length)
    : 0

  const getScoringStatusBadge = (scoringStatus: any) => {
    if (!scoringStatus) return null
    
    if (scoringStatus.overall_complete) {
      return <Badge variant="outline" className="text-green-600 border-green-200">Fully Graded</Badge>
    } else if (!scoringStatus.manual_scoring_complete && scoringStatus.pending_manual > 0) {
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Needs Manual Grading</Badge>
    } else if (!scoringStatus.auto_scoring_complete) {
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Needs Auto-scoring</Badge>
    }
    return <Badge variant="outline" className="text-gray-600 border-gray-200">Partial</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Attempts</h1>
          <p className="text-gray-600 mt-1">Monitor and review assessment submissions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Attempts</p>
                <p className="text-2xl font-bold">{totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">{inProgressAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Needs Grading</p>
                <p className="text-2xl font-bold">{needsManualGrading}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Avg Progress</p>
                <p className="text-2xl font-bold">{averageProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input 
                placeholder="Search by name, email, or user ID..." 
                className="max-w-sm"
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attempts</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="needs-grading">Needs Grading</SelectItem>
                <SelectItem value="fully-graded">Fully Graded</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assessment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assessments</SelectItem>
                {/* Add specific assessments here */}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attempts List */}
      {attemptsWithScoring.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attempts yet</h3>
            <p className="text-gray-600 text-center">
              User attempts will appear here once people start taking assessments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attemptsWithScoring.map((attempt) => {
            const isCompleted = !!attempt.completed_at
            const startDate = new Date(attempt.started_at)
            const duration = attempt.completed_at 
              ? Math.round((new Date(attempt.completed_at).getTime() - startDate.getTime()) / (1000 * 60))
              : null

            return (
              <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    {/* User Information */}
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {attempt.invitation?.invitation_name || 
                           attempt.invitee_name || 
                           attempt.invitation?.invited_email || 
                           attempt.invitee_email ||
                           `User ${attempt.id}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {attempt.invitation?.invited_email || 
                           attempt.invitee_email || 
                           `ID: ${attempt.id}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date Information */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">
                          {startDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {startDate.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Information */}
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{attempt.progress?.answered_questions || 0}/{attempt.progress?.total_questions || 0}</span>
                          <span className="text-sm text-gray-500">{attempt.progress?.percentage || 0}%</span>
                        </div>
                        <Progress value={attempt.progress?.percentage || 0} className="h-1" />
                      </div>
                    </div>

                    {/* Assessment Title & Status */}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {attempt.assessments?.title || 'Unknown Assessment'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isCompleted ? 'Completed' : 'In Progress'}
                        {duration && ` (${duration}m)`}
                      </p>
                    </div>

                    {/* Scoring Status */}
                    <div className="min-w-0">
                      {attempt.scoring_status ? (
                        <div className="space-y-1">
                          {getScoringStatusBadge(attempt.scoring_status)}
                          <div className="text-xs text-gray-500">
                            {attempt.scoring_status.auto_scored + attempt.scoring_status.manually_scored}/{attempt.scoring_status.total_questions} scored
                            {attempt.scoring_status.pending_manual > 0 && (
                              <span className="text-orange-600 font-medium"> • {attempt.scoring_status.pending_manual} pending</span>
                            )}
                          </div>
                        </div>
                      ) : isCompleted ? (
                        <Badge variant="outline" className="text-gray-600 border-gray-200">Not Scored</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                      {isCompleted && attempt.scoring_status && !attempt.scoring_status.manual_scoring_complete && (
                        <Link href={`/admin/attempts/${attempt.id}?tab=grading`}>
                          <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                            <Edit className="w-4 h-4 mr-1" />
                            Grade
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/attempts/${attempt.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination would go here */}
      {attemptsWithScoring.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Showing {attemptsWithScoring.length} attempts</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 