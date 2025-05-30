import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  Plus,
  Eye,
  Mail,
  Send
} from 'lucide-react'
import Link from 'next/link'
import { getAdminDashboardData } from '@/lib/supabase/admin-queries'
import { getInvitationStats } from '@/lib/supabase/invitation-queries'

export default async function AdminDashboard() {
  const [dashboardData, invitationStats] = await Promise.all([
    getAdminDashboardData(),
    getInvitationStats()
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your assessments</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/invitations">
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Manage Invitations
            </Button>
          </Link>
          <Link href="/admin/assessments/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalAssessments}</div>
            <p className="text-xs text-gray-600">
              {dashboardData.activeAssessments} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalAttempts}</div>
            <p className="text-xs text-gray-600">
              {dashboardData.completedAttempts} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations Sent</CardTitle>
            <Mail className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitationStats.total_sent}</div>
            <p className="text-xs text-gray-600">
              {invitationStats.total_accepted} accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalAttempts > 0 
                ? Math.round((dashboardData.completedAttempts / dashboardData.totalAttempts) * 100)
                : 0}%
            </div>
            <p className="text-xs text-gray-600">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeSessions}</div>
            <p className="text-xs text-gray-600">
              Currently taking assessments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invitation Stats Card */}
      {invitationStats.total_sent > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-600" />
              Invitation Overview
            </CardTitle>
            <CardDescription>Assessment invitation statistics and management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{invitationStats.total_pending}</p>
                <p className="text-sm text-blue-800">Pending</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{invitationStats.total_accepted}</p>
                <p className="text-sm text-green-800">Accepted</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{invitationStats.total_expired}</p>
                <p className="text-sm text-gray-800">Expired</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{invitationStats.acceptance_rate}%</p>
                <p className="text-sm text-purple-800">Acceptance Rate</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/admin/invitations">
                <Button variant="outline">
                  View All Invitations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>Your latest created assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                    <p className="text-sm text-gray-600">
                      Created {new Date(assessment.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {assessment.parts?.length || 0} parts
                    </Badge>
                    <Link href={`/admin/assessments/${assessment.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {dashboardData.recentAssessments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No assessments yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
            <CardDescription>Latest user assessment attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {attempt.invitee_email || `User ${attempt.user_id?.slice(0, 8)}...`}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Started {new Date(attempt.started_at).toLocaleDateString()}
                      {attempt.invitee_name && ` • ${attempt.invitee_name}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={attempt.completed_at ? "default" : "secondary"}>
                      {attempt.completed_at ? "Completed" : "In Progress"}
                    </Badge>
                    <Link href={`/admin/attempts/${attempt.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {dashboardData.recentAttempts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No attempts yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 