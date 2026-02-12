import { LucideIcon, MessageSquare } from 'lucide-react'

interface ChatEmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
}

export function ChatEmptyState({
  title = 'Start a conversation',
  description = 'Ask me anything about your GitHub repositories',
  icon: Icon = MessageSquare
}: ChatEmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 border border-border">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
