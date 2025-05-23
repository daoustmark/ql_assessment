'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  GripVertical,
  Check,
  X,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Question types available
const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'essay', label: 'Essay' },
  { value: 'email_response', label: 'Email Response' },
  { value: 'video_response', label: 'Video Response' },
  { value: 'likert_scale', label: 'Likert Scale (1-5)' },
  { value: 'timed_video_response', label: 'Timed Video Response' },
  { value: 'ethical_choice', label: 'Ethical Choice' },
]

// Question types that support time limits
const TIMED_QUESTION_TYPES = [
  'timed_video_response',
  'video_response',
  'essay',
  'email_response'
]

export default function EditAssessmentPage({ params }: PageProps) {
  const router = useRouter()
  const [assessmentId, setAssessmentId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [assessment, setAssessment] = useState<any>(null)
  const [expandedParts, setExpandedParts] = useState<number[]>([])
  const [expandedBlocks, setExpandedBlocks] = useState<number[]>([])
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [editingQuestionData, setEditingQuestionData] = useState<any>(null)
  const [addingQuestionToBlock, setAddingQuestionToBlock] = useState<number | null>(null)
  const [newQuestionData, setNewQuestionData] = useState<any>({
    question_text: '',
    question_type: 'multiple_choice',
    is_required: true,
    time_limit: null,
    points: 1.0,
    correct_answer: null,
    mcq_options: [
      { option_text: '', sequence_order: 1, is_correct: false },
      { option_text: '', sequence_order: 2, is_correct: false }
    ]
  })

  // Initialize component
  useEffect(() => {
    const initializeEditor = async () => {
      const { id } = await params
      const parsedId = parseInt(id)
      setAssessmentId(parsedId)
      await loadAssessment(parsedId)
    }
    initializeEditor()
  }, [params])

  const loadAssessment = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/assessments/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAssessment(data)
        // Auto-expand first part and block for easier editing
        if (data.parts && data.parts.length > 0) {
          setExpandedParts([data.parts[0].id])
          if (data.parts[0].blocks && data.parts[0].blocks.length > 0) {
            setExpandedBlocks([data.parts[0].blocks[0].id])
          }
        }
      } else {
        toast.error('Failed to load assessment')
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
      toast.error('Error loading assessment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBasicInfoChange = (field: string, value: string) => {
    setAssessment((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const saveBasicInfo = async () => {
    if (!assessmentId) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assessment.title,
          description: assessment.description,
          instructions: assessment.instructions,
          time_limit_overall: assessment.time_limit_overall ? parseInt(assessment.time_limit_overall) : null
        })
      })

      if (response.ok) {
        toast.success('Assessment updated successfully!')
      } else {
        toast.error('Failed to update assessment')
      }
    } catch (error) {
      console.error('Error updating assessment:', error)
      toast.error('Error updating assessment')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePartExpansion = (partId: number) => {
    setExpandedParts(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    )
  }

  const toggleBlockExpansion = (blockId: number) => {
    setExpandedBlocks(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    )
  }

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question.id)
    // Create a deep copy of the question data for editing
    setEditingQuestionData({
      ...question,
      mcq_options: question.mcq_options ? [...question.mcq_options] : []
    })
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
    setEditingQuestionData(null)
  }

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      deleteQuestion(questionId)
    }
  }

  const deleteQuestion = async (questionId: number) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Question deleted successfully!')
        
        // Update local state to remove the deleted question
        setAssessment((prev: any) => {
          const updated = { ...prev }
          updated.parts = updated.parts.map((part: any) => ({
            ...part,
            blocks: part.blocks.map((block: any) => ({
              ...block,
              questions: block.questions.filter((q: any) => q.id !== questionId)
            }))
          }))
          return updated
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Error deleting question')
    }
  }

  const handleSaveQuestion = async () => {
    if (!editingQuestionData) return

    try {
      const response = await fetch(`/api/admin/questions/${editingQuestionData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: editingQuestionData.question_text,
          question_type: editingQuestionData.question_type,
          is_required: editingQuestionData.is_required,
          time_limit: editingQuestionData.time_limit,
          mcq_options: editingQuestionData.question_type === 'multiple_choice' 
            ? editingQuestionData.mcq_options.filter((opt: any) => opt.option_text.trim())
            : []
        })
      })

      if (response.ok) {
        const updatedQuestion = await response.json()
        toast.success('Question updated successfully!')
        
        // Update the local assessment data
        setAssessment((prev: any) => {
          const updated = { ...prev }
          updated.parts = updated.parts.map((part: any) => ({
            ...part,
            blocks: part.blocks.map((block: any) => ({
              ...block,
              questions: block.questions.map((q: any) => 
                q.id === editingQuestionData.id ? updatedQuestion : q
              )
            }))
          }))
          return updated
        })

        setEditingQuestion(null)
        setEditingQuestionData(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update question')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Error updating question')
    }
  }

  const updateQuestionText = (text: string) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      question_text: text
    }))
  }

  const updateQuestionType = (type: string) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      question_type: type
    }))
  }

  const updateQuestionRequired = (required: boolean) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      is_required: required
    }))
  }

  const updateQuestionTimeLimit = (timeLimit: string) => {
    const seconds = timeLimit ? parseInt(timeLimit) * 60 : null // Convert minutes to seconds
    setEditingQuestionData((prev: any) => ({
      ...prev,
      time_limit: seconds
    }))
  }

  const updateMcqOption = (optionIndex: number, text: string) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      mcq_options: prev.mcq_options.map((option: any, index: number) =>
        index === optionIndex ? { ...option, option_text: text } : option
      )
    }))
  }

  const updateMcqOptionCorrect = (optionIndex: number, isCorrect: boolean) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      mcq_options: prev.mcq_options.map((option: any, index: number) =>
        index === optionIndex ? { ...option, is_correct: isCorrect } : option
      )
    }))
  }

  const updateQuestionPoints = (points: string) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      points: points ? parseFloat(points) : 1.0
    }))
  }

  const updateQuestionCorrectAnswer = (answer: string) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      correct_answer: answer
    }))
  }

  const addMcqOption = () => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      mcq_options: [
        ...prev.mcq_options,
        {
          id: Date.now(), // Temporary ID
          option_text: '',
          sequence_order: prev.mcq_options.length + 1
        }
      ]
    }))
  }

  const removeMcqOption = (optionIndex: number) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      mcq_options: prev.mcq_options.filter((_: any, index: number) => index !== optionIndex)
    }))
  }

  const handleAddQuestion = (blockId: number) => {
    setAddingQuestionToBlock(blockId)
    // Reset form data
    setNewQuestionData({
      question_text: '',
      question_type: 'multiple_choice',
      is_required: true,
      time_limit: null,
      points: 1.0,
      correct_answer: null,
      mcq_options: [
        { option_text: '', sequence_order: 1, is_correct: false },
        { option_text: '', sequence_order: 2, is_correct: false }
      ]
    })
  }

  const handleCancelAddQuestion = () => {
    setAddingQuestionToBlock(null)
    setNewQuestionData({
      question_text: '',
      question_type: 'multiple_choice',
      is_required: true,
      time_limit: null,
      points: 1.0,
      correct_answer: null,
      mcq_options: [
        { option_text: '', sequence_order: 1, is_correct: false },
        { option_text: '', sequence_order: 2, is_correct: false }
      ]
    })
  }

  const handleSaveNewQuestion = async () => {
    if (!addingQuestionToBlock || !newQuestionData.question_text.trim()) {
      toast.error('Question text is required')
      return
    }

    try {
      const questionPayload = {
        block_id: addingQuestionToBlock,
        question_text: newQuestionData.question_text,
        question_type: newQuestionData.question_type,
        is_required: newQuestionData.is_required,
        time_limit: newQuestionData.time_limit,
        mcq_options: newQuestionData.question_type === 'multiple_choice' 
          ? newQuestionData.mcq_options.filter((opt: any) => opt.option_text.trim())
          : []
      }

      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionPayload)
      })

      if (response.ok) {
        const newQuestion = await response.json()
        toast.success('Question added successfully!')
        
        // Update local state to include the new question
        setAssessment((prev: any) => {
          const updated = { ...prev }
          updated.parts = updated.parts.map((part: any) => ({
            ...part,
            blocks: part.blocks.map((block: any) => {
              if (block.id === addingQuestionToBlock) {
                return {
                  ...block,
                  questions: [...(block.questions || []), newQuestion]
                }
              }
              return block
            })
          }))
          return updated
        })

        handleCancelAddQuestion()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add question')
      }
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('Error adding question')
    }
  }

  const updateNewQuestionField = (field: string, value: any) => {
    setNewQuestionData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNewQuestionMcqOption = (optionIndex: number, text: string) => {
    setNewQuestionData((prev: any) => ({
      ...prev,
      mcq_options: prev.mcq_options.map((option: any, index: number) =>
        index === optionIndex ? { ...option, option_text: text } : option
      )
    }))
  }

  const updateNewQuestionMcqOptionCorrect = (optionIndex: number, isCorrect: boolean) => {
    setNewQuestionData((prev: any) => ({
      ...prev,
      mcq_options: prev.mcq_options.map((option: any, index: number) =>
        index === optionIndex ? { ...option, is_correct: isCorrect } : option
      )
    }))
  }

  const addNewQuestionMcqOption = () => {
    setNewQuestionData((prev: any) => ({
      ...prev,
      mcq_options: [
        ...prev.mcq_options,
        {
          option_text: '',
          sequence_order: prev.mcq_options.length + 1,
          is_correct: false
        }
      ]
    }))
  }

  const removeNewQuestionMcqOption = (optionIndex: number) => {
    setNewQuestionData((prev: any) => ({
      ...prev,
      mcq_options: prev.mcq_options.filter((_: any, index: number) => index !== optionIndex)
    }))
  }

  const formatTimeLimit = (seconds: number | null) => {
    if (!seconds) return ''
    return Math.floor(seconds / 60).toString() // Convert seconds to minutes for display
  }

  const getTimeLimitDisplay = (seconds: number | null) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (remainingSeconds === 0) {
      return `${minutes}min`
    }
    return `${minutes}m ${remainingSeconds}s`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading assessment editor...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Assessment not found</h2>
          <Link href="/admin/assessments">
            <Button variant="outline">Back to Assessments</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/admin/assessments/${assessmentId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessment
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Assessment</h1>
            <p className="text-gray-600 mt-1">{assessment.title}</p>
          </div>
        </div>
        <Button onClick={saveBasicInfo} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>Edit the basic information for this assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  value={assessment.title || ''}
                  onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                  placeholder="Enter assessment title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assessment.description || ''}
                  onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                  placeholder="Provide a brief description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={assessment.instructions || ''}
                  onChange={(e) => handleBasicInfoChange('instructions', e.target.value)}
                  placeholder="Enter instructions for test takers..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  value={assessment.time_limit_overall || ''}
                  onChange={(e) => handleBasicInfoChange('time_limit_overall', e.target.value)}
                  placeholder="Leave blank for no time limit"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                .sort((a: any, b: any) => a.sequence_order - b.sequence_order)
                .map((part: any) => (
                  <Card key={part.id} className="border-l-4 border-l-blue-500">
                    <Collapsible open={expandedParts.includes(part.id)}>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger
                            className="flex items-center space-x-3 flex-1 text-left"
                            onClick={() => togglePartExpansion(part.id)}
                          >
                            {expandedParts.includes(part.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <div>
                              <CardTitle className="text-lg">
                                Part {part.sequence_order}: {part.title}
                              </CardTitle>
                              <CardDescription>{part.description}</CardDescription>
                            </div>
                          </CollapsibleTrigger>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {part.blocks?.length || 0} blocks
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {part.blocks && part.blocks.length > 0 ? (
                            <div className="space-y-3">
                              {part.blocks
                                .sort((a: any, b: any) => a.sequence_order - b.sequence_order)
                                .map((block: any) => (
                                  <div key={block.id} className="border rounded-lg">
                                    <Collapsible open={expandedBlocks.includes(block.id)}>
                                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                          <CollapsibleTrigger
                                            className="flex items-center space-x-3 flex-1 text-left"
                                            onClick={() => toggleBlockExpansion(block.id)}
                                          >
                                            {expandedBlocks.includes(block.id) ? (
                                              <ChevronDown className="w-4 h-4" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4" />
                                            )}
                                            <div>
                                              <h4 className="font-medium">
                                                Block {block.sequence_order}: {block.title}
                                              </h4>
                                              <p className="text-sm text-gray-600">{block.description}</p>
                                            </div>
                                          </CollapsibleTrigger>
                                          <div className="flex items-center space-x-2">
                                            <Badge variant="outline">
                                              {block.questions?.length || 0} questions
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <CollapsibleContent>
                                        <div className="px-4 pb-4 border-t bg-gray-50">
                                          {block.questions && block.questions.length > 0 ? (
                                            <div className="space-y-2 mt-3">
                                              {block.questions
                                                .sort((a: any, b: any) => a.sequence_order - b.sequence_order)
                                                .map((question: any) => (
                                                  <div key={question.id} className="bg-white p-3 rounded border">
                                                    {editingQuestion === question.id ? (
                                                      // EDITING MODE
                                                      <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                          <div className="flex items-center space-x-2">
                                                            <Badge variant="secondary" className="text-xs">
                                                              Q{question.sequence_order}
                                                            </Badge>
                                                            <Badge variant="default" className="text-xs">
                                                              Editing
                                                            </Badge>
                                                          </div>
                                                          <div className="flex items-center space-x-2">
                                                            <Button 
                                                              variant="outline" 
                                                              size="sm"
                                                              onClick={handleSaveQuestion}
                                                            >
                                                              <Check className="w-3 h-3 mr-1" />
                                                              Save
                                                            </Button>
                                                            <Button 
                                                              variant="ghost" 
                                                              size="sm"
                                                              onClick={handleCancelEdit}
                                                            >
                                                              <X className="w-3 h-3 mr-1" />
                                                              Cancel
                                                            </Button>
                                                          </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                          <div>
                                                            <Label className="text-sm font-medium">Question Text</Label>
                                                            <Textarea
                                                              value={editingQuestionData?.question_text || ''}
                                                              onChange={(e) => updateQuestionText(e.target.value)}
                                                              className="mt-1"
                                                              rows={3}
                                                            />
                                                          </div>

                                                          <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                              <Label className="text-sm font-medium">Question Type</Label>
                                                              <Select 
                                                                value={editingQuestionData?.question_type || ''} 
                                                                onValueChange={updateQuestionType}
                                                              >
                                                                <SelectTrigger className="mt-1">
                                                                  <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                  {QUESTION_TYPES.map((type) => (
                                                                    <SelectItem key={type.value} value={type.value}>
                                                                      {type.label}
                                                                    </SelectItem>
                                                                  ))}
                                                                </SelectContent>
                                                              </Select>
                                                            </div>
                                                            
                                                            <div>
                                                              <Label className="text-sm font-medium">Points</Label>
                                                              <Input
                                                                type="number"
                                                                value={editingQuestionData?.points || 1.0}
                                                                onChange={(e) => updateQuestionPoints(e.target.value)}
                                                                placeholder="1.0"
                                                                min="0"
                                                                step="0.1"
                                                                className="mt-1"
                                                              />
                                                            </div>
                                                            
                                                            {TIMED_QUESTION_TYPES.includes(editingQuestionData?.question_type) && (
                                                              <div>
                                                                <Label className="text-sm font-medium flex items-center">
                                                                  <Clock className="w-3 h-3 mr-1" />
                                                                  Time Limit (minutes)
                                                                </Label>
                                                                <Input
                                                                  type="number"
                                                                  value={formatTimeLimit(editingQuestionData?.time_limit)}
                                                                  onChange={(e) => updateQuestionTimeLimit(e.target.value)}
                                                                  placeholder="No limit"
                                                                  min="1"
                                                                  max="60"
                                                                  className="mt-1"
                                                                />
                                                              </div>
                                                            )}
                                                          </div>

                                                          <div className="flex items-center space-x-2">
                                                            <input
                                                              type="checkbox"
                                                              id={`required-${question.id}`}
                                                              checked={editingQuestionData?.is_required || false}
                                                              onChange={(e) => updateQuestionRequired(e.target.checked)}
                                                              className="rounded"
                                                            />
                                                            <Label htmlFor={`required-${question.id}`} className="text-sm">
                                                              Required
                                                            </Label>
                                                          </div>

                                                          {/* Correct Answer for non-MCQ questions */}
                                                          {editingQuestionData?.question_type !== 'multiple_choice' && 
                                                           editingQuestionData?.question_type !== 'video_response' && 
                                                           editingQuestionData?.question_type !== 'timed_video_response' && (
                                                            <div>
                                                              <Label className="text-sm font-medium">Expected/Correct Answer</Label>
                                                              <Textarea
                                                                value={editingQuestionData?.correct_answer || ''}
                                                                onChange={(e) => updateQuestionCorrectAnswer(e.target.value)}
                                                                placeholder="Enter the expected answer or key points for grading..."
                                                                className="mt-1"
                                                                rows={3}
                                                              />
                                                            </div>
                                                          )}

                                                          {/* MCQ Options with Correct Answer Marking */}
                                                          {editingQuestionData?.question_type === 'multiple_choice' && (
                                                            <div>
                                                              <Label className="text-sm font-medium">Answer Options</Label>
                                                              <div className="space-y-2 mt-2">
                                                                {editingQuestionData.mcq_options?.map((option: any, index: number) => (
                                                                  <div key={option.id || index} className="flex items-center space-x-2">
                                                                    <span className="text-sm text-gray-500 min-w-[20px]">
                                                                      {String.fromCharCode(65 + index)}.
                                                                    </span>
                                                                    <Input
                                                                      value={option.option_text}
                                                                      onChange={(e) => updateMcqOption(index, e.target.value)}
                                                                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                                      className="flex-1"
                                                                    />
                                                                    <div className="flex items-center space-x-1">
                                                                      <input
                                                                        type="radio"
                                                                        name={`correct-${question.id}`}
                                                                        checked={option.is_correct || false}
                                                                        onChange={() => {
                                                                          // Update this option as correct and others as incorrect
                                                                          setEditingQuestionData((prev: any) => ({
                                                                            ...prev,
                                                                            mcq_options: prev.mcq_options.map((opt: any, idx: number) => ({
                                                                              ...opt,
                                                                              is_correct: idx === index
                                                                            }))
                                                                          }))
                                                                        }}
                                                                        className="w-3 h-3"
                                                                      />
                                                                      <span className="text-xs text-gray-500">Correct</span>
                                                                    </div>
                                                                    <Button
                                                                      variant="ghost"
                                                                      size="sm"
                                                                      onClick={() => removeMcqOption(index)}
                                                                      disabled={editingQuestionData.mcq_options.length <= 2}
                                                                    >
                                                                      <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                  </div>
                                                                ))}
                                                                <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  onClick={addMcqOption}
                                                                  className="mt-2"
                                                                >
                                                                  <Plus className="w-3 h-3 mr-1" />
                                                                  Add Option
                                                                </Button>
                                                              </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      // VIEW MODE
                                                      <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                          <div className="flex items-center space-x-2 mb-2">
                                                            <Badge variant="secondary" className="text-xs">
                                                              Q{question.sequence_order}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                              {question.question_type}
                                                            </Badge>
                                                            {question.is_required && (
                                                              <Badge variant="destructive" className="text-xs">
                                                                Required
                                                              </Badge>
                                                            )}
                                                            {question.time_limit && (
                                                              <Badge variant="outline" className="text-xs flex items-center">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {getTimeLimitDisplay(question.time_limit)}
                                                              </Badge>
                                                            )}
                                                          </div>
                                                          <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                                                            {question.question_text}
                                                          </p>
                                                          {question.mcq_options && question.mcq_options.length > 0 && (
                                                            <div className="mt-2">
                                                              <p className="text-xs text-gray-500 mb-1">Options:</p>
                                                              <div className="text-xs text-gray-600 space-y-1">
                                                                {question.mcq_options
                                                                  .sort((a: any, b: any) => a.sequence_order - b.sequence_order)
                                                                  .slice(0, 2)
                                                                  .map((option: any) => (
                                                                    <div key={option.id}>
                                                                      • {option.option_text}
                                                                    </div>
                                                                  ))}
                                                                {question.mcq_options.length > 2 && (
                                                                  <div className="text-gray-500">
                                                                    +{question.mcq_options.length - 2} more options
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div className="flex items-center space-x-1 ml-3">
                                                          <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleEditQuestion(question)}
                                                          >
                                                            <Edit className="w-3 h-3" />
                                                          </Button>
                                                          <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleDeleteQuestion(question.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                          >
                                                            <Trash2 className="w-3 h-3" />
                                                          </Button>
                                                          <Button variant="ghost" size="sm">
                                                            <GripVertical className="w-3 h-3" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full mt-2"
                                                onClick={() => handleAddQuestion(block.id)}
                                              >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Question
                                              </Button>
                                            </div>
                                          ) : (
                                            <div className="text-center py-4 text-gray-500">
                                              <p className="text-sm">No questions in this block yet</p>
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="mt-2"
                                                onClick={() => handleAddQuestion(block.id)}
                                              >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add First Question
                                              </Button>
                                            </div>
                                          )}

                                          {/* Add Question Form */}
                                          {addingQuestionToBlock === block.id && (
                                            <div className="bg-blue-50 p-4 rounded border mt-3">
                                              <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium text-blue-900">Add New Question</h4>
                                                <div className="flex items-center space-x-2">
                                                  <Button 
                                                    variant="default" 
                                                    size="sm"
                                                    onClick={handleSaveNewQuestion}
                                                    disabled={!newQuestionData.question_text.trim()}
                                                  >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Save
                                                  </Button>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={handleCancelAddQuestion}
                                                  >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </div>

                                              <div className="space-y-3">
                                                <div>
                                                  <Label className="text-sm font-medium">Question Text *</Label>
                                                  <Textarea
                                                    value={newQuestionData.question_text}
                                                    onChange={(e) => updateNewQuestionField('question_text', e.target.value)}
                                                    placeholder="Enter your question..."
                                                    className="mt-1"
                                                    rows={3}
                                                  />
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                  <div>
                                                    <Label className="text-sm font-medium">Question Type</Label>
                                                    <Select 
                                                      value={newQuestionData.question_type} 
                                                      onValueChange={(value) => {
                                                        updateNewQuestionField('question_type', value)
                                                        // Reset MCQ options when changing type
                                                        if (value === 'multiple_choice') {
                                                          updateNewQuestionField('mcq_options', [
                                                            { option_text: '', sequence_order: 1, is_correct: false },
                                                            { option_text: '', sequence_order: 2, is_correct: false }
                                                          ])
                                                        }
                                                      }}
                                                    >
                                                      <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {QUESTION_TYPES.map((type) => (
                                                          <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                          </SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                  
                                                  <div>
                                                    <Label className="text-sm font-medium">Points</Label>
                                                    <Input
                                                      type="number"
                                                      value={newQuestionData.points || 1.0}
                                                      onChange={(e) => updateNewQuestionField('points', e.target.value ? parseFloat(e.target.value) : 1.0)}
                                                      placeholder="1.0"
                                                      min="0"
                                                      step="0.1"
                                                      className="mt-1"
                                                    />
                                                  </div>
                                                  
                                                  {TIMED_QUESTION_TYPES.includes(newQuestionData.question_type) && (
                                                    <div>
                                                      <Label className="text-sm font-medium flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Time Limit (minutes)
                                                      </Label>
                                                      <Input
                                                        type="number"
                                                        value={newQuestionData.time_limit ? Math.floor(newQuestionData.time_limit / 60) : ''}
                                                        onChange={(e) => {
                                                          const minutes = e.target.value ? parseInt(e.target.value) : null
                                                          updateNewQuestionField('time_limit', minutes ? minutes * 60 : null)
                                                        }}
                                                        placeholder="No limit"
                                                        min="1"
                                                        max="60"
                                                        className="mt-1"
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                                  
                                                <div className="flex items-center space-x-2">
                                                  <input
                                                    type="checkbox"
                                                    id="new-question-required"
                                                    checked={newQuestionData.is_required}
                                                    onChange={(e) => updateNewQuestionField('is_required', e.target.checked)}
                                                    className="rounded"
                                                  />
                                                  <Label htmlFor="new-question-required" className="text-sm">
                                                    Required
                                                  </Label>
                                                </div>

                                                {/* Correct Answer for non-MCQ questions */}
                                                {newQuestionData.question_type !== 'multiple_choice' && 
                                                 newQuestionData.question_type !== 'video_response' && 
                                                 newQuestionData.question_type !== 'timed_video_response' && (
                                                  <div>
                                                    <Label className="text-sm font-medium">Expected/Correct Answer</Label>
                                                    <Textarea
                                                      value={newQuestionData.correct_answer || ''}
                                                      onChange={(e) => updateNewQuestionField('correct_answer', e.target.value)}
                                                      placeholder="Enter the expected answer or key points for grading..."
                                                      className="mt-1"
                                                      rows={3}
                                                    />
                                                  </div>
                                                )}

                                                {newQuestionData.question_type === 'multiple_choice' && (
                                                  <div>
                                                    <Label className="text-sm font-medium">Answer Options</Label>
                                                    <div className="space-y-2 mt-2">
                                                      {newQuestionData.mcq_options.map((option: any, index: number) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                          <span className="text-sm text-gray-500 min-w-[20px]">
                                                            {String.fromCharCode(65 + index)}.
                                                          </span>
                                                          <Input
                                                            value={option.option_text}
                                                            onChange={(e) => updateNewQuestionMcqOption(index, e.target.value)}
                                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                            className="flex-1"
                                                          />
                                                          <div className="flex items-center space-x-1">
                                                            <input
                                                              type="radio"
                                                              name="new-question-correct"
                                                              checked={option.is_correct || false}
                                                              onChange={() => {
                                                                // Update this option as correct and others as incorrect
                                                                setNewQuestionData((prev: any) => ({
                                                                  ...prev,
                                                                  mcq_options: prev.mcq_options.map((opt: any, idx: number) => ({
                                                                    ...opt,
                                                                    is_correct: idx === index
                                                                  }))
                                                                }))
                                                              }}
                                                              className="w-3 h-3"
                                                            />
                                                            <span className="text-xs text-gray-500">Correct</span>
                                                          </div>
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeNewQuestionMcqOption(index)}
                                                            disabled={newQuestionData.mcq_options.length <= 2}
                                                          >
                                                            <Trash2 className="w-3 h-3" />
                                                          </Button>
                                                        </div>
                                                      ))}
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={addNewQuestionMcqOption}
                                                        className="mt-2"
                                                      >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Add Option
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                ))}
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Block
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <p>No blocks in this part yet</p>
                              <Button variant="outline" size="sm" className="mt-2">
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Block
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
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

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Preview</CardTitle>
              <CardDescription>Preview how this assessment will appear to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>Assessment preview will be rendered here</p>
                <Link href={`/assessment?assessmentId=${assessmentId}`}>
                  <Button className="mt-4">
                    Open Full Preview
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 