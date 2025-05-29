'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { 
  getQuestionsWithCompetencyMappings, 
  saveQuestionCompetencyMapping,
  getQuestionCompetencyMapping 
} from '@/lib/supabase/scoring'
import { COMPETENCY_DEFINITIONS } from '@/types/scoring'
import { TextFormatter } from '@/components/ui/text-formatter'
import { Save, Search, Filter, RefreshCw } from 'lucide-react'

export default function CompetencyMappingsPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCompetency, setFilterCompetency] = useState<string>('all')
  const [autoMappings, setAutoMappings] = useState<Map<number, string>>(new Map())
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadQuestions()
    loadAutoMappings()
  }, [])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await getQuestionsWithCompetencyMappings(1) // Assessment ID 1
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAutoMappings = async () => {
    try {
      // Temporarily get auto-mappings for comparison
      const mappings = await getQuestionCompetencyMapping(1)
      setAutoMappings(mappings)
    } catch (error) {
      console.error('Error loading auto-mappings:', error)
    }
  }

  const handleSaveMapping = async (questionId: number, competencyArea: string) => {
    try {
      setSaving(questionId)
      await saveQuestionCompetencyMapping(questionId, competencyArea, 'admin')
      
      // Update local state
      setQuestions(questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              question_competency_mappings: [{ 
                competency_area: competencyArea, 
                is_custom: true, 
                mapped_by: 'admin',
                mapped_at: new Date().toISOString()
              }] 
            }
          : q
      ))
      
      setSuccessMessage(`Updated mapping for question ${questionId}`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving mapping:', error)
    } finally {
      setSaving(null)
    }
  }

  const getCompetencyColor = (competency: string) => {
    const colors = {
      'business_valuation': 'bg-blue-100 text-blue-800',
      'industry_knowledge': 'bg-green-100 text-green-800',
      'technical_assessment': 'bg-purple-100 text-purple-800',
      'negotiation_skills': 'bg-orange-100 text-orange-800',
      'communication': 'bg-pink-100 text-pink-800',
      'ethical_decision_making': 'bg-red-100 text-red-800',
      'problem_solving': 'bg-yellow-100 text-yellow-800',
      'behavioral_fit': 'bg-gray-100 text-gray-800'
    }
    return colors[competency as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCurrentCompetency = (question: any): string => {
    // Check if there's a custom mapping
    if (question.question_competency_mappings && question.question_competency_mappings.length > 0) {
      return question.question_competency_mappings[0].competency_area
    }
    // Otherwise use auto-mapping
    return autoMappings.get(question.id) || 'business_valuation'
  }

  const isCustomMapping = (question: any): boolean => {
    return question.question_competency_mappings && question.question_competency_mappings.length > 0
  }

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchTerm === '' || 
      question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.blocks.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.blocks.parts.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const currentCompetency = getCurrentCompetency(question)
    const matchesFilter = filterCompetency === 'all' || currentCompetency === filterCompetency
    
    return matchesSearch && matchesFilter
  })

  // Count questions by competency
  const competencyCounts = questions.reduce((acc, question) => {
    const competency = getCurrentCompetency(question)
    acc[competency] = (acc[competency] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competency Mappings</h1>
          <p className="text-gray-600">Manage how questions are categorized into competency areas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadQuestions} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Competency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Current Distribution ({questions.length} questions)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMPETENCY_DEFINITIONS.map(def => (
              <div key={def.area} className="text-center">
                <Badge className={getCompetencyColor(def.area)}>
                  {def.name}
                </Badge>
                <div className="text-2xl font-bold mt-2">
                  {competencyCounts[def.area] || 0}
                </div>
                <div className="text-sm text-gray-500">questions</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search questions, blocks, or parts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterCompetency} onValueChange={setFilterCompetency}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by competency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Competencies</SelectItem>
                  {COMPETENCY_DEFINITIONS.map(def => (
                    <SelectItem key={def.area} value={def.area}>
                      {def.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Questions ({filteredQuestions.length})
          </h2>
        </div>

        {filteredQuestions.map((question) => {
          const currentCompetency = getCurrentCompetency(question)
          const isCustom = isCustomMapping(question)
          const autoCompetency = autoMappings.get(question.id)
          
          return (
            <Card key={question.id} className={isCustom ? 'border-blue-200' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Question {question.id}</span>
                      {isCustom && (
                        <Badge variant="outline" className="border-blue-500 text-blue-700">
                          Custom Mapping
                        </Badge>
                      )}
                      {!isCustom && autoCompetency !== currentCompetency && (
                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                          Auto-detected
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {question.blocks.parts.title} → {question.blocks.title}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentCompetency}
                      onValueChange={(value) => handleSaveMapping(question.id, value)}
                      disabled={saving === question.id}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPETENCY_DEFINITIONS.map(def => (
                          <SelectItem key={def.area} value={def.area}>
                            {def.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {saving === question.id && (
                      <Save className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <TextFormatter text={question.question_text.substring(0, 300) + '...'} />
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Type: {question.question_type}</span>
                    <span>Block: {question.blocks.block_type}</span>
                    {!isCustom && autoCompetency && (
                      <span>Auto-detected: {autoCompetency.replace('_', ' ')}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredQuestions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No questions match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 