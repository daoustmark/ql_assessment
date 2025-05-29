import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { getAllAssessmentsForAdmin } from '@/lib/supabase/admin-queries'
import type { PartWithBlocks, BlockWithQuestions } from '@/types'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

export default async function AssessmentsPage() {
  const assessments = await getAllAssessmentsForAdmin()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">Manage your assessment library</p>
        </div>
        <Link href="/admin/assessments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </Link>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
            <p className="text-gray-600 text-center mb-6">
              Get started by creating your first assessment
            </p>
            <Link href="/admin/assessments/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assessments.map((assessment) => {
            const totalQuestions = assessment.parts?.reduce(
              (total: number, part: PartWithBlocks) => {
                if (!part.blocks) return total
                return total + part.blocks.reduce(
                  (blockTotal: number, block: BlockWithQuestions) => blockTotal + (block.questions?.length || 0), 
                  0
                )
              }, 
              0
            ) || 0

            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{assessment.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {assessment.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/assessments/${assessment.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/assessments/${assessment.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary">
                          {assessment.parts?.length || 0} parts
                        </Badge>
                        <Badge variant="outline">
                          {totalQuestions} questions
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        Created {new Date(assessment.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/assessment?assessmentId=${assessment.id}`}>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/admin/assessments/${assessment.id}`}>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Manage
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
    </div>
  )
} 