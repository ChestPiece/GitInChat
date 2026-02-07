'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Github, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

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
    <div
      className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback
          className={cn(
            'flex items-center justify-center',
            isUser
              ? 'bg-blue-600/20 text-blue-400'
              : 'bg-slate-700 text-slate-300'
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Github className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex flex-col gap-1 max-w-md',
          isUser && 'items-end'
        )}
      >
        <span className="text-xs text-slate-400 px-2">
          {isUser ? displayName : 'GitHub Agent'}
        </span>
        <div
          className={cn(
            'px-3 py-2 rounded-lg text-sm',
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-slate-700 text-slate-100 rounded-bl-none'
          )}
        >
          <div className="prose prose-invert prose-sm max-w-none [&>*]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&_code]:bg-slate-900 [&_code]:px-1 [&_code]:rounded [&_code]:text-slate-200">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-300 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
