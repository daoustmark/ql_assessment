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
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { getAllAttempts } from '@/lib/supabase/admin-queries'
import type { AssessmentAttempt } from '@/types/assessment'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default async function AttemptsPage() {
  const attempts = await getAllAttempts()

  // Calculate summary statistics
  const totalAttempts = attempts.length
  const completedAttempts = attempts.filter(a => a.completed_at).length
  const inProgressAttempts = totalAttempts - completedAttempts
  const averageProgress = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.progress?.percentage || 0), 0) / attempts.length)
    : 0

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="Search by user ID..." 
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
                <SelectItem value="abandoned">Abandoned</SelectItem>
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
      {attempts.length === 0 ? (
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
          {attempts.map((attempt: any) => {
            const isCompleted = !!attempt.completed_at
            const startDate = new Date(attempt.started_at)
            const duration = attempt.completed_at 
              ? Math.round((new Date(attempt.completed_at).getTime() - startDate.getTime()) / (1000 * 60))
              : null

            return (
              <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            User {attempt.user_id?.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {attempt.id}
                          </p>
                        </div>
                      </div>
                      
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

                      {duration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">
                              {duration} min
                            </p>
                            <p className="text-xs text-gray-500">
                              Duration
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Progress Information */}
                      {attempt.progress && (
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">
                                {attempt.progress.answered_questions}/{attempt.progress.total_questions}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attempt.progress.percentage}%
                              </p>
                            </div>
                            <Progress 
                              value={attempt.progress.percentage} 
                              className="h-2 w-24"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Questions
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {attempt.assessments?.title || 'Unknown Assessment'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={isCompleted ? "default" : "secondary"}
                            className={isCompleted ? "bg-green-100 text-green-800" : ""}
                          >
                            {isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                          {isCompleted && attempt.progress && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {attempt.progress.answered_questions} answers
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Link href={`/admin/attempts/${attempt.id}`}>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-1" />
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
      {attempts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Showing {attempts.length} attempts</span>
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