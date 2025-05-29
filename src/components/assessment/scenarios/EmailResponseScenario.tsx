import React from 'react'

// TypeScript interfaces for the scenario structure
interface ParsedEmailScenario {
  title?: string
  scenarioType?: string
  character?: {
    name: string
    type: string
  }
  business?: {
    type: string
    product: string
    revenue: string
    sde: string
  }
  background?: string
  email?: string
  emailMeta?: {
    from?: string
    subject?: string
    urgency?: string
  }
  task?: string
  taskMeta?: {
    type?: string
    goal?: string
  }
}

interface EmailResponseScenarioProps {
  content: string
}

export function EmailResponseScenario({ content }: EmailResponseScenarioProps) {
  // Parse the custom format
  const parseEmailScenario = (text: string): ParsedEmailScenario => {
    const lines = text.split('\n')
    const parsed: ParsedEmailScenario = {}
    let currentSection = ''
    let currentContent = ''
    
    for (const line of lines) {
      if (line.startsWith('::scenario-type[')) {
        parsed.scenarioType = line.match(/\[([^\]]+)\]/)?.[1]
      } else if (line.startsWith('::character[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.character = { name: parts[0], type: parts[1] }
        }
      } else if (line.startsWith('::business[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.business = {
            type: parts[0],
            product: parts[1],
            revenue: parts[2],
            sde: parts[3]
          }
        }
      } else if (line.startsWith('# ')) {
        parsed.title = line.substring(2)
      } else if (line.startsWith('::background')) {
        currentSection = 'background'
        currentContent = ''
      } else if (line.startsWith('::email[')) {
        currentSection = 'email'
        currentContent = ''
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const params = match[1].split('|')
          parsed.emailMeta = {}
          params.forEach(param => {
            const [key, value] = param.split('=')
            if (parsed.emailMeta) {
              parsed.emailMeta[key as keyof typeof parsed.emailMeta] = value
            }
          })
        }
      } else if (line.startsWith('::task[')) {
        currentSection = 'task'
        currentContent = ''
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const params = match[1].split('|')
          parsed.taskMeta = {}
          params.forEach(param => {
            const [key, value] = param.split('=')
            if (parsed.taskMeta) {
              parsed.taskMeta[key as keyof typeof parsed.taskMeta] = value
            }
          })
        }
      } else if (line === '::end') {
        if (currentSection) {
          if (currentSection === 'background') {
            parsed.background = currentContent.trim()
          } else if (currentSection === 'email') {
            parsed.email = currentContent.trim()
          } else if (currentSection === 'task') {
            parsed.task = currentContent.trim()
          }
          currentSection = ''
          currentContent = ''
        }
      } else if (currentSection) {
        currentContent += line + '\n'
      }
    }
    
    return parsed
  }

  const scenario = parseEmailScenario(content)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-900 mb-2">{scenario.title}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Character:</span> {scenario.character?.name} ({scenario.character?.type})
          </div>
          <div>
            <span className="font-medium text-blue-800">Scenario Type:</span> {scenario.scenarioType}
          </div>
        </div>
        {scenario.business && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-blue-800">Business:</span> {scenario.business.type} - {scenario.business.product} | {scenario.business.revenue} | {scenario.business.sde}
          </div>
        )}
      </div>

      {/* Background */}
      {scenario.background && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">📋 Background</h3>
          <p className="text-gray-700 leading-relaxed">{scenario.background}</p>
        </div>
      )}

      {/* Email */}
      {scenario.email && (
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">From:</span> {scenario.emailMeta?.from}
              </div>
              <div className="flex items-center gap-2">
                {scenario.emailMeta?.urgency === 'high' && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">HIGH PRIORITY</span>
                )}
              </div>
            </div>
            <div className="mt-1">
              <span className="font-medium text-sm">Subject:</span> {scenario.emailMeta?.subject}
            </div>
          </div>
          <div className="p-4">
            <div className="whitespace-pre-line text-gray-800 leading-relaxed">
              {scenario.email}
            </div>
          </div>
        </div>
      )}

      {/* Task */}
      {scenario.task && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📝 Your Task</h3>
          <div className="text-sm text-green-800 mb-2">
            <span className="font-medium">Type:</span> {scenario.taskMeta?.type} | 
            <span className="font-medium ml-2">Goal:</span> {scenario.taskMeta?.goal}
          </div>
          <p className="text-green-700 leading-relaxed">{scenario.task}</p>
        </div>
      )}
    </div>
  )
} 