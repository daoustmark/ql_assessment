import React from 'react'

// TypeScript interfaces for the video scenario structure
interface ParsedVideoScenario {
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
  situation?: {
    type: string
    context: string
  }
  background?: string
  videoPrompt?: string
  videoMeta?: {
    character?: string
    tone?: string
    duration?: string
  }
  task?: string
  taskMeta?: {
    type?: string
    duration?: string
    goal?: string
  }
}

interface VideoResponseScenarioProps {
  content: string
}

export function VideoResponseScenario({ content }: VideoResponseScenarioProps) {
  const parseVideoScenario = (text: string): ParsedVideoScenario => {
    const lines = text.split('\n')
    const parsed: ParsedVideoScenario = {}
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
      } else if (line.startsWith('::situation[')) {
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const parts = match[1].split('|')
          parsed.situation = {
            type: parts[0],
            context: parts[1]
          }
        }
      } else if (line.startsWith('# ')) {
        parsed.title = line.substring(2)
      } else if (line.startsWith('::background')) {
        currentSection = 'background'
        currentContent = ''
      } else if (line.startsWith('::video_prompt[')) {
        currentSection = 'videoPrompt'
        currentContent = ''
        const match = line.match(/\[([^\]]+)\]/)
        if (match) {
          const params = match[1].split('|')
          parsed.videoMeta = {}
          params.forEach(param => {
            const [key, value] = param.split('=')
            if (parsed.videoMeta) {
              parsed.videoMeta[key as keyof typeof parsed.videoMeta] = value
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
          } else if (currentSection === 'videoPrompt') {
            parsed.videoPrompt = currentContent.trim()
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

  const scenario = parseVideoScenario(content)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-purple-900 mb-2">{scenario.title}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-purple-800">Character:</span> {scenario.character?.name} ({scenario.character?.type})
          </div>
          <div>
            <span className="font-medium text-purple-800">Scenario Type:</span> {scenario.scenarioType}
          </div>
        </div>
        {scenario.business && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-purple-800">Business:</span> {scenario.business.type} - {scenario.business.product} | {scenario.business.revenue} | {scenario.business.sde}
          </div>
        )}
        {scenario.situation && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-purple-800">Situation:</span> {scenario.situation.type} - {scenario.situation.context}
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

      {/* Video Prompt */}
      {scenario.videoPrompt && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-red-900">🎬 Video Scenario</h3>
          </div>
          <div className="text-sm text-red-800 mb-2">
            <span className="font-medium">Character:</span> {scenario.videoMeta?.character} | 
            <span className="font-medium ml-2">Tone:</span> {scenario.videoMeta?.tone} | 
            <span className="font-medium ml-2">Duration:</span> {scenario.videoMeta?.duration?.replace('_', ' ')}
          </div>
          <div className="bg-white border border-red-200 rounded p-3">
            <p className="text-red-700 leading-relaxed whitespace-pre-line">{scenario.videoPrompt}</p>
          </div>
        </div>
      )}

      {/* Task */}
      {scenario.task && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📝 Your Task</h3>
          <div className="text-sm text-green-800 mb-2">
            <span className="font-medium">Type:</span> {scenario.taskMeta?.type} | 
            <span className="font-medium ml-2">Duration:</span> {scenario.taskMeta?.duration} |
            <span className="font-medium ml-2">Goal:</span> {scenario.taskMeta?.goal?.replace('_', ' ')}
          </div>
          <p className="text-green-700 leading-relaxed">{scenario.task}</p>
        </div>
      )}
    </div>
  )
} 