'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Github, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  avatar?: string
  displayName?: string
}

export function ChatMessage({
  role,
  content,
  avatar,
  displayName = 'You',
}: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3 mb-6 relative group', isUser && 'flex-row-reverse')}>
      <Avatar className="w-10 h-10 flex-shrink-0 border border-[#30363d]">
        <AvatarFallback
          className={cn(
            'flex items-center justify-center bg-[#0d1117] text-[#c9d1d9]',
          )}
        >
          {isUser ? <User className="w-5 h-5" /> : <Github className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 max-w-3xl min-w-0', isUser && 'flex flex-col items-end')}>
        {/* Comment Box */}
        <div className="border border-[#30363d] rounded-md bg-[#0d1117] w-full relative">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 border-b border-[#30363d] bg-[#161b22] rounded-t-md text-xs text-[#8b949e]",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="font-semibold text-[#c9d1d9]">{isUser ? displayName : 'GitHub Agent'}</span>
            <span>commented</span>
            <span className="ml-auto"></span>
          </div>

          {/* Body */}
          <div className="p-4 text-[#c9d1d9] text-sm overflow-x-auto">
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
