'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Github, User } from 'lucide-react'

import { ChatToolInvocation } from '@/components/chat-tool-invocation'
import { MessageContent } from '@/components/chat-message-content'
import { MessageToolList } from '@/components/chat-message-tool-list'

interface MessagePart {
  type: string;
  text?: string;
  toolName?: string;
  toolCallId?: string;
  args?: unknown;
  result?: unknown;
  state?: 'call' | 'result' | 'partial-call';
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content?: string
  avatar?: string
  displayName?: string
  parts?: MessagePart[]
  toolInvocations?: any[] // Legacy support
}

export function ChatMessage({
  role,
  content,
  avatar,
  displayName = 'You',
  parts,
  toolInvocations,
}: ChatMessageProps) {
  const isUser = role === 'user'

  // Extract text content from parts if available, otherwise use content prop
  const textContent = parts 
    ? parts
        .filter(part => part.type === 'text')
        .map(part => part.text || '')
        .join('')
    : content || '';

  // Extract tool parts from parts array
  const toolParts = parts?.filter(part => 
    part.type === 'tool-invocation' || 
    part.type.startsWith('tool-')
  ) || [];

  return (
    <div className={cn('flex gap-3 mb-6 relative group', isUser && 'flex-row-reverse')}>
      <Avatar className="w-10 h-10 flex-shrink-0 border border-border">
        <AvatarFallback
          className={cn(
            'flex items-center justify-center bg-background text-foreground',
          )}
        >
          {isUser ? <User className="w-5 h-5" /> : <Github className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 max-w-3xl min-w-0', isUser && 'flex flex-col items-end')}>
        {/* Comment Box */}
        <div className="border border-border rounded-md bg-background w-full relative">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 border-b border-border bg-muted rounded-t-md text-xs text-muted-foreground",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="font-semibold text-foreground">{isUser ? displayName : 'GitHub Agent'}</span>
            <span>commented</span>
            <span className="ml-auto"></span>
          </div>

          {/* Body */}
          <div className="p-4 text-foreground text-sm overflow-x-auto">
             {/* Text Content */}
             <MessageContent content={textContent} />

             {/* Tool Parts & Invocations */}
             <MessageToolList toolParts={toolParts} toolInvocations={toolInvocations} />
          </div>
        </div>
      </div>
    </div>
  )
}

