import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Download,
  Calendar
} from 'lucide-react'
import { getAdminDashboardData, getAllAttempts } from '@/lib/supabase/admin-queries'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default async function AnalyticsPage() {
  const dashboardData = await getAdminDashboardData()
  const attempts = await getAllAttempts()

  // Calculate analytics data
  const completionRate = dashboardData.totalAttempts > 0 
    ? Math.round((dashboardData.completedAttempts / dashboardData.totalAttempts) * 100)
    : 0

  const averageTimeToComplete = attempts
    .filter((attempt: any) => attempt.completed_at)
    .reduce((total: number, attempt: any) => {
      const duration = new Date(attempt.completed_at).getTime() - new Date(attempt.started_at).getTime()
      return total + (duration / (1000 * 60)) // Convert to minutes
    }, 0) / (dashboardData.completedAttempts || 1)

  const abandonmentRate = dashboardData.totalAttempts > 0
    ? Math.round(((dashboardData.totalAttempts - dashboardData.completedAttempts) / dashboardData.totalAttempts) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Performance insights and statistics</p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Complete</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageTimeToComplete) || 0}m</div>
            <p className="text-xs text-blue-600 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              -3m from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandonment Rate</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abandonmentRate}%</div>
            <p className="text-xs text-orange-600 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              -1.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeSessions}</div>
            <p className="text-xs text-purple-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Currently taking assessments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
            <CardDescription>Daily completion rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Chart will be rendered here</p>
                <p className="text-sm">Integrate with Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Performance</CardTitle>
            <CardDescription>Performance by assessment type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Performance metrics chart</p>
                <p className="text-sm">Average scores and completion rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing</CardTitle>
            <CardDescription>Assessments with highest completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAssessments.slice(0, 3).map((assessment, index) => (
                <div key={assessment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-green-800">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{assessment.title}</p>
                      <p className="text-xs text-gray-500">
                        {assessment.parts?.length || 0} parts
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">95%</Badge>
                </div>
              ))}
              {dashboardData.recentAssessments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attempts.slice(0, 4).map((attempt: any) => (
                <div key={attempt.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      User {attempt.user_id?.slice(0, 8)}... 
                      {attempt.completed_at ? ' completed' : ' started'} assessment
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(attempt.started_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {attempts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No activity yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Question Insights</CardTitle>
            <CardDescription>Most challenging questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Question analytics will appear here</p>
                <p className="text-xs">Once users start answering questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Download detailed reports and raw data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Assessment Results (CSV)
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              User Responses (JSON)
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Analytics Report (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 