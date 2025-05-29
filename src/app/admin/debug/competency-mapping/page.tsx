'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { debugCompetencyMapping, getQuestionCompetencyMapping } from '@/lib/supabase/scoring'

export default function CompetencyMappingDebugPage() {
  const [debugData, setDebugData] = useState<any[]>([])
  const [mapping, setMapping] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(false)

  const loadDebugData = async () => {
    try {
      setLoading(true)
      console.log('Loading debug data...')
      
      // Debug the first 20 questions
      const questions = await debugCompetencyMapping(1) // Assessment ID 1
      const competencyMap = await getQuestionCompetencyMapping(1)
      
      setDebugData(questions)
      setMapping(competencyMap)
      
      console.log('Debug data loaded:', questions.length, 'questions')
    } catch (error) {
      console.error('Error loading debug data:', error)
    } finally {
      setLoading(false)
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

  // Count questions by competency
  const competencyCounts = Array.from(mapping.values()).reduce((acc, competency) => {
    acc[competency] = (acc[competency] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competency Mapping Debug</h1>
          <p className="text-gray-600">See how questions are mapped to competency areas</p>
        </div>
        <Button onClick={loadDebugData} disabled={loading}>
          {loading ? 'Loading...' : 'Load Debug Data'}
        </Button>
      </div>

      {/* Competency Counts Summary */}
      {mapping.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competency Distribution (All Questions)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(competencyCounts).map(([competency, count]) => (
                <div key={competency} className="text-center">
                  <Badge className={getCompetencyColor(competency)}>
                    {competency.replace('_', ' ')}
                  </Badge>
                  <div className="text-2xl font-bold mt-2">{count}</div>
                  <div className="text-sm text-gray-500">questions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Question Mapping */}
      {debugData.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Individual Question Mappings (First 20)</h2>
          {debugData.map((question) => {
            const competency = mapping.get(question.id) || 'unknown'
            return (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Question {question.id}</CardTitle>
                    <Badge className={getCompetencyColor(competency)}>
                      {competency.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Question Text:</strong>
                    <p className="text-sm mt-1">{question.question_text.substring(0, 200)}...</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Part Title:</strong> {question.blocks.parts.title}
                    </div>
                    <div>
                      <strong>Block Title:</strong> {question.blocks.title}
                    </div>
                    <div>
                      <strong>Block Type:</strong> {question.blocks.block_type}
                    </div>
                    <div>
                      <strong>Question Type:</strong> {question.question_type}
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