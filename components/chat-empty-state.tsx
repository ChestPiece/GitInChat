'use client'

import { LucideIcon, MessageSquare, List, Eye, Archive, Search } from 'lucide-react'

interface ChatEmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  onSuggest?: (prompt: string) => void
}

const SUGGESTED_PROMPTS = [
  { icon: List, label: 'Show me all my repos', prompt: 'Show me all my repositories' },
  { icon: Eye, label: "What needs my attention?", prompt: "What needs my attention this week?" },
  { icon: Search, label: 'Find stale issues', prompt: 'Find stale issues across my most active repos' },
  { icon: Archive, label: 'Archive old repos', prompt: 'List repositories I haven\'t touched in over a year' },
]

export function ChatEmptyState({
  title = 'Start a conversation',
  description = 'Ask me anything about your GitHub repositories',
  icon: Icon = MessageSquare,
  onSuggest,
}: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 border border-border">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {onSuggest && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg px-4">
          {SUGGESTED_PROMPTS.map(({ icon: PromptIcon, label, prompt }) => (
            <button
              key={label}
              onClick={() => onSuggest(prompt)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-muted/50 hover:bg-muted text-sm text-left text-muted-foreground hover:text-foreground transition-colors"
            >
              <PromptIcon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
