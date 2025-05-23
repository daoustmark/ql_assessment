'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export default function TestDBPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testDatabase() {
      try {
        console.log('Testing database structure...')

        // Step 1: Get accurate counts for all tables
        const tableCounts: Record<string, string> = {}

        // Count assessments
        const { count: assessmentCount, error: assessmentCountError } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true })
        tableCounts.assessments = assessmentCountError ? 
          `Error: ${assessmentCountError.message}` : 
          `${assessmentCount || 0} total assessments`

        // Count parts
        const { count: partsCount, error: partsCountError } = await supabase
          .from('parts')
          .select('*', { count: 'exact', head: true })
        tableCounts.parts = partsCountError ? 
          `Error: ${partsCountError.message}` : 
          `${partsCount || 0} total parts`

        // Count blocks
        const { count: blocksCount, error: blocksCountError } = await supabase
          .from('blocks')
          .select('*', { count: 'exact', head: true })
        tableCounts.blocks = blocksCountError ? 
          `Error: ${blocksCountError.message}` : 
          `${blocksCount || 0} total blocks`

        // Count questions
        const { count: questionsCount, error: questionsCountError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
        tableCounts.questions = questionsCountError ? 
          `Error: ${questionsCountError.message}` : 
          `${questionsCount || 0} total questions`

        // Count mcq_options
        const { count: mcqCount, error: mcqCountError } = await supabase
          .from('mcq_options')
          .select('*', { count: 'exact', head: true })
        tableCounts.mcq_options = mcqCountError ? 
          `Error: ${mcqCountError.message}` : 
          `${mcqCount || 0} total mcq_options`

        // Count scenarios
        const { count: scenariosCount, error: scenariosCountError } = await supabase
          .from('scenarios')
          .select('*', { count: 'exact', head: true })
        tableCounts.scenarios = scenariosCountError ? 
          `Error: ${scenariosCountError.message}` : 
          `${scenariosCount || 0} total scenarios`

        // Count scenario_options
        const { count: scenarioOptionsCount, error: scenarioOptionsCountError } = await supabase
          .from('scenario_options')
          .select('*', { count: 'exact', head: true })
        tableCounts.scenario_options = scenarioOptionsCountError ? 
          `Error: ${scenarioOptionsCountError.message}` : 
          `${scenarioOptionsCount || 0} total scenario_options`

        // Test assessment_attempts table
        const { count: attemptsCount, error: attemptsCountError } = await supabase
          .from('assessment_attempts')
          .select('*', { count: 'exact', head: true })
        tableCounts.assessment_attempts = attemptsCountError ? 
          `Error: ${attemptsCountError.message}` : 
          `${attemptsCount || 0} total assessment_attempts`

        // Test user_answers table
        const { count: answersCount, error: answersCountError } = await supabase
          .from('user_answers')
          .select('*', { count: 'exact', head: true })
        tableCounts.user_answers = answersCountError ? 
          `Error: ${answersCountError.message}` : 
          `${answersCount || 0} total user_answers`

        // Step 2: Try to get sample data to see actual schema
        let schemaInfo: Record<string, string> = {}

        // Try to select all columns from assessment_attempts to see what exists
        const { data: attemptsSample, error: attemptsSchemaError } = await supabase
          .from('assessment_attempts')
          .select('*')
          .limit(1)

        if (attemptsSchemaError) {
          schemaInfo.assessment_attempts_schema = `Error: ${attemptsSchemaError.message}`
        } else {
          schemaInfo.assessment_attempts_schema = `Table exists, columns: ${Object.keys(attemptsSample?.[0] || {}).join(', ') || 'No data to determine columns'}`
        }

        // Try to get sample data from user_answers to see what exists  
        const { data: answersSample, error: answersSchemaError } = await supabase
          .from('user_answers')
          .select('*')
          .limit(1)

        if (answersSchemaError) {
          schemaInfo.user_answers_schema = `Error: ${answersSchemaError.message}`
        } else {
          schemaInfo.user_answers_schema = `Table exists, columns: ${Object.keys(answersSample?.[0] || {}).join(', ') || 'No data to determine columns'}`
        }

        // Step 3: Test different insert attempts to find correct schema
        const testUserId = `test_user_${Date.now()}`
        
        // Try minimal insert first
        const minimalAttemptData = {
          assessment_id: 1,
          user_id: testUserId
        }

        console.log('Testing minimal assessment attempt creation:', minimalAttemptData)
        
        const { data: minimalResult, error: minimalError } = await supabase
          .from('assessment_attempts')
          .insert(minimalAttemptData)
          .select()
          .single()

        tableCounts.minimal_attempt_test = minimalError ? 
          `Minimal Insert Error: ${JSON.stringify(minimalError)}` : 
          `SUCCESS: Created attempt ID ${minimalResult?.id}`

        // If minimal worked, try with started_at
        if (!minimalError) {
          const withTimeData = {
            assessment_id: 1,
            user_id: `${testUserId}_2`,
            started_at: new Date().toISOString()
          }

          const { data: timeResult, error: timeError } = await supabase
            .from('assessment_attempts')
            .insert(withTimeData)
            .select()
            .single()

          tableCounts.time_attempt_test = timeError ? 
            `Time Insert Error: ${JSON.stringify(timeError)}` : 
            `SUCCESS: Created attempt ID ${timeResult?.id}`
        }

        // Step 4: Get sample assessments
        const { data: sampleAssessments } = await supabase
          .from('assessments')
          .select('*')
          .limit(1)

        // Get any existing attempts
        const { data: existingAttempts } = await supabase
          .from('assessment_attempts')
          .select('*')
          .limit(3)

        setData({
          tableCounts,
          schemaInfo,
          sampleAssessments,
          existingAttempts,
          connectionStatus: 'success'
        })

      } catch (err) {
        console.error('Database test error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testDatabase()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Schema Analysis</CardTitle>
            <CardDescription>Testing actual database schema and insert methods...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Database Connection Failed</CardTitle>
            <CardDescription>Error occurred while testing database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 font-mono text-sm bg-red-50 p-4 rounded">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✅ Database Schema Analysis</CardTitle>
          <CardDescription>Testing actual database structure and finding correct insert methods</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Tests & Schema Discovery</CardTitle>
          <CardDescription>Testing tables and discovering actual column structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(data.tableCounts).map(([tableName, result]) => (
              <div key={tableName} className={`p-3 border rounded-lg ${
                tableName.includes('test') ? 'border-blue-300 bg-blue-50' : ''
              }`}>
                <h4 className="font-semibold text-sm">{tableName}</h4>
                <p className="text-xs text-gray-600">{result as string}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schema Information</CardTitle>
          <CardDescription>Actual table structures discovered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.schemaInfo).map(([tableName, info]) => (
              <div key={tableName} className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm">{tableName.replace('_', ' ')}</h4>
                <p className="text-xs text-gray-600">{info as string}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data?.existingAttempts && data.existingAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Assessment Attempts</CardTitle>
            <CardDescription>Sample data from successful inserts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-auto">
              <pre className="text-xs">
                {JSON.stringify(data.existingAttempts, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 