'use client'

interface MessageContentProps {
  content: string
}

export function MessageContent({ content }: MessageContentProps) {
  if (!content) return null

  return (
    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap has-[pre]:bg-muted has-[pre]:border has-[pre]:border-border has-[pre]:rounded-md has-[pre]:p-0">
      {content.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <div key={index} className="my-3 bg-muted border border-border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-background border-b border-border text-xs text-muted-foreground">
                <span>Code</span>
                {/* TODO: Extract Copy Button logic */}
                <button className="hover:text-white transition-colors">Copy</button>
              </div>
              <pre className="p-3 overflow-x-auto bg-muted text-foreground font-mono text-xs">
                <code>{part.trim()}</code>
              </pre>
            </div>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </div>
  )
}
