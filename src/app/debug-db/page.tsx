'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { testUserAnswersTable } from '@/lib/supabase/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [questionTypes, setQuestionTypes] = useState<any[]>([])
  const [ethicalQuestions, setEthicalQuestions] = useState<any[]>([])
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [tableTestResult, setTableTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get all unique question types
        const { data: types, error: typesError } = await supabase
          .from('questions')
          .select('question_type')
          .order('question_type')

        if (typesError) throw typesError

        // Get unique types with counts
        const typeCounts = types?.reduce((acc: any, item: any) => {
          const type = item.question_type
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {})

        setQuestionTypes(Object.entries(typeCounts || {}).map(([type, count]) => ({ type, count })))

        // Look for ethical questions specifically
        const { data: ethical, error: ethicalError } = await supabase
          .from('questions')
          .select('*')
          .ilike('question_text', '%ethical%')

        if (ethicalError) throw ethicalError
        setEthicalQuestions(ethical || [])

        // Look for questions in parts with "ethical" in title
        const { data: ethicalParts, error: ethicalPartsError } = await supabase
          .from('parts')
          .select('id, title')
          .ilike('title', '%ethical%')

        if (ethicalPartsError) throw ethicalPartsError
        
        console.log('Ethical parts found:', ethicalParts)

        // Get a sample of all questions to see patterns
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id, question_type, question_text')
          .order('id')
          .limit(20)

        if (questionsError) throw questionsError

        // Check user_answers table schema by getting a sample record
        const { data: sampleAnswer, error: answerError } = await supabase
          .from('user_answers')
          .select('*')
          .limit(1)

        console.log('Sample user_answer record:', sampleAnswer)
        if (answerError) console.log('No existing answers:', answerError)

        // Try to check the actual schema by attempting different column names
        const schemaTestResults: any = {}
        
        // Test for 'selected_option_id' column
        try {
          const { data: test1, error: error1 } = await supabase
            .from('user_answers')
            .select('selected_option_id')
            .limit(1)
          schemaTestResults.selected_option_id = error1 ? error1.message : 'Column exists'
        } catch (e: any) {
          schemaTestResults.selected_option_id = e.message
        }

        // Test for 'selected_mcq_option_id' column
        try {
          const { data: test2, error: error2 } = await supabase
            .from('user_answers')
            .select('selected_mcq_option_id')
            .limit(1)
          schemaTestResults.selected_mcq_option_id = error2 ? error2.message : 'Column exists'
        } catch (e: any) {
          schemaTestResults.selected_mcq_option_id = e.message
        }

        // Test for 'mcq_option_id' column
        try {
          const { data: test3, error: error3 } = await supabase
            .from('user_answers')
            .select('mcq_option_id')
            .limit(1)
          schemaTestResults.mcq_option_id = error3 ? error3.message : 'Column exists'
        } catch (e: any) {
          schemaTestResults.mcq_option_id = e.message
        }

        // Test more possible column names
        const possibleColumns = [
          'option_id',
          'mcq_id', 
          'choice_id',
          'answer_choice_id',
          'selected_choice_id',
          'answer_option_id'
        ]

        for (const column of possibleColumns) {
          try {
            const { data, error } = await supabase
              .from('user_answers')
              .select(column)
              .limit(1)
            schemaTestResults[column] = error ? error.message : 'Column exists'
          } catch (e: any) {
            schemaTestResults[column] = e.message
          }
        }

        // Try to get all column names by inspecting any existing record
        try {
          const { data: allColumns, error: allError } = await supabase
            .from('user_answers')
            .select('*')
            .limit(1)
          
          if (allColumns && allColumns.length > 0) {
            schemaTestResults.actual_columns = `Available columns: ${Object.keys(allColumns[0]).join(', ')}`
          } else if (allError) {
            schemaTestResults.actual_columns = `Error getting columns: ${allError.message}`
          } else {
            schemaTestResults.actual_columns = 'No records found to determine columns'
          }
        } catch (e: any) {
          schemaTestResults.actual_columns = `Exception: ${e.message}`
        }

        console.log('Schema test results:', schemaTestResults)
        
        // Try to create a test record to understand the required schema
        try {
          const testRecord = {
            attempt_id: 1, // assuming this exists
            question_id: 1, // assuming this exists
            answer_text: 'test answer'
          }
          
          const { data: insertTest, error: insertError } = await supabase
            .from('user_answers')
            .insert(testRecord)
            .select()
            .single()
            
          if (insertTest) {
            console.log('✅ Test insert successful:', insertTest)
            schemaTestResults.insert_test = `SUCCESS: Record created with columns: ${Object.keys(insertTest).join(', ')}`
            
            // Clean up the test record
            await supabase
              .from('user_answers')
              .delete()
              .eq('id', insertTest.id)
          } else if (insertError) {
            console.log('❌ Test insert failed:', insertError)
            schemaTestResults.insert_test = `FAILED: ${insertError.message}`
          }
        } catch (e: any) {
          schemaTestResults.insert_test = `EXCEPTION: ${e.message}`
        }
        
        // Update the state with the new test results
        setAllQuestions([...questions || [], { schemaTestResults }])

        // Test the user_answers table structure
        const tableTest = await testUserAnswersTable()
        setTableTestResult(tableTest)
        console.log('Table test result:', tableTest)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading debug data...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Database Debug Info</h1>
      
      {/* Question Types */}
      <Card>
        <CardHeader>
          <CardTitle>Question Types in Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {questionTypes.map(({ type, count }) => (
              <div key={type} className="flex justify-between">
                <span className="font-mono">{type}</span>
                <span>{count} questions</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ethical Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions with "Ethical" in Text ({ethicalQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ethicalQuestions.map((q) => (
              <div key={q.id} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium">Q{q.id} - Type: {q.question_type}</div>
                <div className="text-sm text-gray-600 mt-1">{q.question_text.substring(0, 200)}...</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Questions (First 20)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allQuestions.filter(q => !q.schemaTestResults).map((q) => (
              <div key={q.id} className="border-l-4 border-gray-300 pl-4">
                <div className="font-medium">Q{q.id} - Type: {q.question_type}</div>
                <div className="text-sm text-gray-600 mt-1">{q.question_text.substring(0, 150)}...</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schema Test Results */}
      {allQuestions.find(q => q.schemaTestResults) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">🔍 User Answers Table Schema Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(allQuestions.find(q => q.schemaTestResults)?.schemaTestResults || {}).map(([column, result]) => (
                <div key={column} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-mono font-medium">{column}</span>
                  <span className={result === 'Column exists' ? 'text-green-600' : 'text-red-600 text-sm'}>
                    {String(result)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Structure Test */}
      {tableTestResult && (
        <Card>
          <CardHeader>
            <CardTitle className={tableTestResult.success ? "text-green-600" : "text-red-600"}>
              🧪 User Answers Table Structure Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tableTestResult.success ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-medium text-green-900 mb-2">✅ Table Structure Found</h4>
                  <div className="text-sm text-green-800">
                    <strong>Available Columns:</strong> {tableTestResult.columns?.join(', ')}
                  </div>
                </div>
                {tableTestResult.sample && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <h4 className="font-medium text-gray-900 mb-2">📄 Sample Record</h4>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(tableTestResult.sample, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-medium text-red-900 mb-2">❌ Table Test Failed</h4>
                <div className="text-sm text-red-800">
                  <strong>Error:</strong> {tableTestResult.error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 