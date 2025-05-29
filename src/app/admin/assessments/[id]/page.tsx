import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Edit,
  Plus,
  Trash2,
  Eye,
  Settings,
  Users,
  BarChart3,
  ArrowLeft,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { getAssessmentById } from '@/lib/supabase/queries'
import { getInvitationsByAssessment } from '@/lib/supabase/invitation-queries'
import { notFound } from 'next/navigation'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { InviteForm } from '@/components/admin/InviteForm'
import { InvitationsSection } from '@/components/admin/InvitationsSection'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { id } = await params
  const assessmentId = parseInt(id)
  
  const [assessment, invitations] = await Promise.all([
    getAssessmentById(assessmentId),
    getInvitationsByAssessment(assessmentId)
  ])

  if (!assessment) {
    notFound()
  }

  const totalQuestions = assessment.parts?.reduce(
    (total, part) => total + (part.blocks?.reduce(
      (blockTotal, block) => blockTotal + (block.questions?.length || 0), 0
    ) || 0), 0
  ) || 0

  // Calculate invitation stats for this assessment
  const invitationStats = {
    total: invitations.length,
    pending: invitations.filter(inv => inv.status === 'pending').length,
    accepted: invitations.filter(inv => inv.status === 'accepted').length,
    expired: invitations.filter(inv => inv.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/assessments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-gray-600 mt-1">{assessment.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/assessment?assessmentId=${assessment.id}`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Link href={`/admin/assessments/${assessment.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Parts</p>
                <p className="text-2xl font-bold">{assessment.parts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Invitations</p>
                <p className="text-2xl font-bold">{invitationStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Attempts</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-100 rounded">
                <BarChart3 className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {invitationStats.total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {invitationStats.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="attempts">Attempts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Assessment Structure</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Part
            </Button>
          </div>

          {assessment.parts && assessment.parts.length > 0 ? (
            <div className="space-y-4">
              {assessment.parts
                .sort((a, b) => a.sequence_order - b.sequence_order)
                .map((part) => (
                  <Card key={part.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Part {part.sequence_order}: {part.title}
                          </CardTitle>
                          <CardDescription>{part.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {part.blocks && part.blocks.length > 0 ? (
                        <div className="space-y-3">
                          {part.blocks
                            .sort((a, b) => a.sequence_order - b.sequence_order)
                            .map((block) => (
                              <div key={block.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">
                                    Block {block.sequence_order}: {block.title}
                                  </h4>
                                  <Badge variant="outline">
                                    {block.questions?.length || 0} questions
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{block.description}</p>
                                
                                {block.questions && block.questions.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {block.questions
                                      .sort((a, b) => a.sequence_order - b.sequence_order)
                                      .slice(0, 3)
                                      .map((question) => (
                                        <div key={question.id} className="text-sm bg-gray-50 p-2 rounded">
                                          <div className="flex justify-between items-start">
                                            <span className="font-medium">Q{question.sequence_order}:</span>
                                            <Badge variant="secondary" className="text-xs">
                                              {question.question_type}
                                            </Badge>
                                          </div>
                                          <p className="mt-1 text-gray-700 line-clamp-2">
                                            {question.question_text}
                                          </p>
                                        </div>
                                      ))}
                                    {block.questions.length > 3 && (
                                      <p className="text-xs text-gray-500">
                                        +{block.questions.length - 3} more questions
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          No blocks in this part yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No parts yet</h3>
                <p className="text-gray-600 text-center mb-6">
                  Start building your assessment by adding the first part
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Part
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          {/* Invitation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{invitationStats.pending}</p>
                  <p className="text-sm text-blue-800">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{invitationStats.accepted}</p>
                  <p className="text-sm text-green-800">Accepted</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{invitationStats.expired}</p>
                  <p className="text-sm text-gray-800">Expired</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{invitationStats.total}</p>
                  <p className="text-sm text-purple-800">Total Sent</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invitation Form */}
            <div>
              <InviteForm 
                assessment={assessment} 
              />
            </div>

            {/* Recent Invitations */}
            <InvitationsSection 
              invitations={invitations} 
              assessment={assessment} 
            />
          </div>
        </TabsContent>

        <TabsContent value="attempts">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Attempts</CardTitle>
              <CardDescription>Users who have taken this assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                No attempts yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>Performance insights and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Analytics will appear here once users start taking the assessment
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Settings</CardTitle>
              <CardDescription>Configure assessment behavior and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Time Limit</label>
                  <p className="text-sm text-gray-600">
                    {assessment.time_limit_overall 
                      ? `${assessment.time_limit_overall} minutes`
                      : 'No time limit set'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Instructions</label>
                  <p className="text-sm text-gray-600">
                    {assessment.instruction_overall || assessment.instruction_detailed || 'No instructions provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 