import React from 'react'
import { Badge } from './badge'

interface TextFormatterProps {
  text: string
  className?: string
  id?: string
}

export function TextFormatter({ text, className = '', id }: TextFormatterProps) {
  if (!text) return null

  // Generate a unique key for this instance
  const uniqueKey = id || `markdown-${Math.random().toString(36).substr(2, 9)}`

  // Function to parse and format the text
  const formatText = (input: string): React.ReactNode[] => {
    let formatted = input

    // Handle special scenario tags first
    const specialTags = [
      { pattern: /::scenario-type\[([^\]]+)\]/g, label: 'Type', color: 'bg-blue-100 text-blue-800' },
      { pattern: /::character\[([^\]]+)\]/g, label: 'Character', color: 'bg-green-100 text-green-800' },
      { pattern: /::business\[([^\]]+)\]/g, label: 'Business', color: 'bg-purple-100 text-purple-800' },
      { pattern: /::task\[([^\]]+)\]/g, label: 'Task', color: 'bg-orange-100 text-orange-800' },
      { pattern: /::goal\[([^\]]+)\]/g, label: 'Goal', color: 'bg-yellow-100 text-yellow-800' },
    ]

    const elements: React.ReactNode[] = []
    let lastIndex = 0

    // Find all special tags and their positions
    const tagMatches: Array<{ match: RegExpMatchArray; type: typeof specialTags[0] }> = []
    
    specialTags.forEach(tagType => {
      const matches = Array.from(formatted.matchAll(tagType.pattern))
      matches.forEach(match => {
        tagMatches.push({ match, type: tagType })
      })
    })

    // Sort by position
    tagMatches.sort((a, b) => (a.match.index || 0) - (b.match.index || 0))

    // Process each tag match
    tagMatches.forEach((tagMatch, index) => {
      const { match, type } = tagMatch
      const matchStart = match.index || 0
      const matchEnd = matchStart + match[0].length

      // Add text before this match
      if (matchStart > lastIndex) {
        const textBefore = formatted.slice(lastIndex, matchStart)
        if (textBefore.trim()) {
          elements.push(formatBasicMarkdown(textBefore, `${uniqueKey}-before-${index}`))
        }
      }

      // Add the formatted tag
      const content = match[1]
      elements.push(
        <Badge key={`tag-${uniqueKey}-${index}`} variant="secondary" className={`${type.color} mr-2 mb-1 inline-block`}>
          {type.label}: {content}
        </Badge>
      )

      lastIndex = matchEnd
    })

    // Add remaining text
    if (lastIndex < formatted.length) {
      const remainingText = formatted.slice(lastIndex)
      if (remainingText.trim()) {
        elements.push(formatBasicMarkdown(remainingText, `${uniqueKey}-remaining`))
      }
    }

    // If no special tags were found, just format as basic markdown
    if (elements.length === 0) {
      elements.push(formatBasicMarkdown(formatted, `${uniqueKey}-main`))
    }

    return elements
  }

  // Basic markdown formatting - now accepts a unique key parameter
  const formatBasicMarkdown = (text: string, keyPrefix: string = uniqueKey): React.ReactNode => {
    const lines = text.split('\n')
    const formattedLines: React.ReactNode[] = []

    lines.forEach((line, lineIndex) => {
      let formattedLine: React.ReactNode = line

      // Headers
      if (line.startsWith('###')) {
        formattedLine = (
          <h3 key={`h3-${keyPrefix}-${lineIndex}`} className="text-lg font-semibold mt-4 mb-2">
            {line.replace(/^###\s*/, '')}
          </h3>
        )
      } else if (line.startsWith('##')) {
        formattedLine = (
          <h2 key={`h2-${keyPrefix}-${lineIndex}`} className="text-xl font-semibold mt-4 mb-2">
            {line.replace(/^##\s*/, '')}
          </h2>
        )
      } else if (line.startsWith('#')) {
        formattedLine = (
          <h1 key={`h1-${keyPrefix}-${lineIndex}`} className="text-2xl font-bold mt-4 mb-3">
            {line.replace(/^#\s*/, '')}
          </h1>
        )
      }
      // Lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        formattedLine = (
          <li key={`li-${keyPrefix}-${lineIndex}`} className="ml-4 list-disc">
            {formatInlineMarkdown(line.replace(/^\s*[-*]\s*/, ''), `${keyPrefix}-${lineIndex}`)}
          </li>
        )
      }
      // Numbered lists
      else if (/^\s*\d+\.\s/.test(line)) {
        formattedLine = (
          <li key={`li-${keyPrefix}-${lineIndex}`} className="ml-4 list-decimal">
            {formatInlineMarkdown(line.replace(/^\s*\d+\.\s*/, ''), `${keyPrefix}-${lineIndex}`)}
          </li>
        )
      }
      // Regular paragraphs
      else if (line.trim()) {
        formattedLine = (
          <p key={`p-${keyPrefix}-${lineIndex}`} className="mb-2">
            {formatInlineMarkdown(line, `${keyPrefix}-${lineIndex}`)}
          </p>
        )
      }
      // Empty lines
      else {
        formattedLine = <br key={`br-${keyPrefix}-${lineIndex}`} />
      }

      formattedLines.push(formattedLine)
    })

    return <div key={`markdown-content-${keyPrefix}`}>{formattedLines}</div>
  }

  // Format inline markdown (bold, italic, etc.) - now accepts unique key parameter
  const formatInlineMarkdown = (text: string, keyPrefix: string = uniqueKey): React.ReactNode => {
    // Handle bold text **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    const formattedParts = parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`bold-${keyPrefix}-${index}`} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      
      // Handle italic text *text*
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={`italic-${keyPrefix}-${index}`} className="italic">
            {part.slice(1, -1)}
          </em>
        )
      }
      
      return part
    })

    return <>{formattedParts}</>
  }

  const formattedElements = formatText(text)

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {formattedElements}
    </div>
  )
} 