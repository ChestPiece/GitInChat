'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Github, User } from 'lucide-react'

import { ChatToolInvocation } from '@/components/chat-tool-invocation'
import { MessageContent } from '@/components/chat-message-content'
import { MessageToolList } from '@/components/chat-message-tool-list'
import { MessageMetadataDisplay } from '@/components/message-metadata'

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
  createdAt?: Date | number | string
  metadata?: any
  isNew?: boolean
}

export function ChatMessage({
  role,
  content,
  avatar,
  displayName = 'You',
  parts,
  toolInvocations,
  createdAt,
  metadata,
  isNew = false,
}: ChatMessageProps) {
  const isUser = role === 'user'

  // Extract text content from parts if available, otherwise use content prop
  const textFromParts = parts
    ? parts
        .filter(part => part.type === 'text')
        .map(part => part.text || '')
        .join('')
    : '';
  const textContent = textFromParts || content || '';

  // Extract tool parts from parts array
  const toolParts = parts?.filter(part =>
    part.type === 'tool-invocation' ||
    part.type.startsWith('tool-')
  ) || [];

  return (
    <div className={cn('flex gap-3 mb-4 relative group items-start', isUser && 'flex-row-reverse', isNew && 'message-new')}>
      <Avatar className={cn("w-9 h-9 flex-shrink-0 border", isUser ? "border-[rgba(99,102,241,0.25)]" : "border-[var(--pr-border)]")}>
        <AvatarFallback
          className={cn(
            'flex items-center justify-center bg-background text-foreground',
          )}
        >
          {isUser ? <User className="w-5 h-5" /> : <Github className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 max-w-3xl min-w-0', isUser && 'flex flex-col items-end')}>
        <div className={cn('w-full rounded-xl border px-4 py-3 text-sm overflow-x-auto', isUser ? 'bg-[var(--pr-secondary)]/10 border-[var(--pr-secondary)]/20 text-[var(--pr-text)]' : 'bg-white/[0.02] border-[var(--pr-border)] border-l-[3px] border-l-[var(--pr-accent)] text-[var(--pr-text)]')}>
          <MessageContent content={textContent} />
          <MessageToolList toolParts={toolParts} toolInvocations={toolInvocations} />
          {!isUser && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <MessageMetadataDisplay createdAt={createdAt} metadata={metadata} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
