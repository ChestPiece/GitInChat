'use client'

import { useState, useCallback } from 'react'
import { Check, Copy } from 'lucide-react'

interface MessageContentProps {
  content: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: ignore clipboard errors
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="hover:text-white transition-colors flex items-center gap-1"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

// Regex patterns for GitHub link detection
const GITHUB_LINK_PATTERNS = [
  // Full GitHub URLs
  { pattern: /(https?:\/\/github\.com\/[^\s<>"]+)/g, render: (match: string) => match },
  // owner/repo#123 (issue/PR references)
  { pattern: /\b([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)#(\d+)\b/g, render: (match: string, owner_repo: string, num: string) => `https://github.com/${owner_repo}/issues/${num}` },
  // owner/repo (bare repo reference)
  { pattern: /(?<![/\w])([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)(?![/\w#])/g, render: (match: string, repo: string) => `https://github.com/${repo}` },
]

function linkifyText(text: string): React.ReactNode[] {
  // Process GitHub issue/PR references: owner/repo#123
  const issuePattern = /\b([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)#(\d+)\b/g
  // Full GitHub URLs
  const urlPattern = /(https?:\/\/github\.com\/[^\s<>"']+)/g

  // Combined pattern — process text left to right
  const combinedPattern = /(https?:\/\/github\.com\/[^\s<>"']+)|([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)#(\d+)/g

  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match

  combinedPattern.lastIndex = 0
  while ((match = combinedPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // Full GitHub URL
      nodes.push(
        <a
          key={match.index}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {match[1]}
        </a>
      )
    } else if (match[2] && match[3]) {
      // owner/repo#123
      const url = `https://github.com/${match[2]}/issues/${match[3]}`
      nodes.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {match[2]}#{match[3]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

export function MessageContent({ content }: MessageContentProps) {
  if (!content) return null

  const parts = content.split('```')

  return (
    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // Code block
          const lines = part.split('\n')
          const lang = lines[0].trim()
          const code = (lang ? lines.slice(1) : lines).join('\n').trim()
          return (
            <div key={index} className="my-3 bg-muted border border-border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-background border-b border-border text-xs text-muted-foreground">
                <span>{lang || 'Code'}</span>
                <CopyButton text={code} />
              </div>
              <pre className="p-3 overflow-x-auto bg-muted text-foreground font-mono text-xs">
                <code>{code}</code>
              </pre>
            </div>
          )
        }
        // Regular text — linkify GitHub references
        return <span key={index}>{linkifyText(part)}</span>
      })}
    </div>
  )
}
