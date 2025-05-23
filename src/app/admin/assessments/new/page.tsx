'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import Link from 'next/link'
import { createAssessment } from '@/lib/supabase/admin-queries'
import { toast } from 'sonner'

export default function NewAssessmentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    time_limit_overall: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the assessment')
      return
    }

    setIsLoading(true)
    
    try {
      const assessmentData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        instructions: formData.instructions.trim() || undefined,
        time_limit_overall: formData.time_limit_overall ? parseInt(formData.time_limit_overall) : undefined
      }

      const newAssessment = await createAssessment(assessmentData)
      
      if (newAssessment) {
        toast.success('Assessment created successfully!')
        router.push(`/admin/assessments/${newAssessment.id}`)
      } else {
        toast.error('Failed to create assessment. Please try again.')
      }
    } catch (error) {
      console.error('Error creating assessment:', error)
      toast.error('An error occurred while creating the assessment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/assessments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Assessment</h1>
          <p className="text-gray-600 mt-1">Build a new assessment from scratch</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Set the basic details for your assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assessment Title *</Label>
              <Input
                id="title"
                placeholder="Enter assessment title..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a brief description of the assessment..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Enter instructions for test takers..."
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_limit">Time Limit (minutes)</Label>
              <Input
                id="time_limit"
                type="number"
                placeholder="Leave blank for no time limit"
                value={formData.time_limit_overall}
                onChange={(e) => handleInputChange('time_limit_overall', e.target.value)}
                min="1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link href="/admin/assessments">
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              'Creating...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Assessment
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            After creating your assessment, you'll be able to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Add parts to organize your content</li>
            <li>Create blocks within each part</li>
            <li>Add questions of various types (multiple choice, essay, video, etc.)</li>
            <li>Configure scoring and validation rules</li>
            <li>Preview and test your assessment</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 