'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Github, User } from 'lucide-react'

import { ChatToolInvocation } from '@/components/chat-tool-invocation'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  avatar?: string
  displayName?: string
  toolInvocations?: any[]
}

export function ChatMessage({
  role,
  content,
  avatar,
  displayName = 'You',
  toolInvocations,
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
             {/* Text Content */}
            {content && (
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap has-[pre]:bg-[#161b22] has-[pre]:border has-[pre]:border-[#30363d] has-[pre]:rounded-md has-[pre]:p-0">
                {content.split('```').map((part, index) => {
                    if (index % 2 === 1) {
                    return (
                        <div key={index} className="my-3 bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d1117] border-b border-[#30363d] text-xs text-[#8b949e]">
                            <span>Code</span>
                            <button className="hover:text-white transition-colors">Copy</button>
                        </div>
                        <pre className="p-3 overflow-x-auto bg-[#161b22] text-[#c9d1d9] font-mono text-xs">
                            <code>{part.trim()}</code>
                        </pre>
                        </div>
                    )
                    }
                    return <span key={index}>{part}</span>
                })}
                </div>
            )}

            {/* Tool Invocations */}
            {toolInvocations && toolInvocations.length > 0 && (
                <div className="mt-4 space-y-4 border-t border-[#30363d] pt-4">
                    {toolInvocations.map((toolInvocation) => (
                        <ChatToolInvocation key={toolInvocation.toolCallId} toolInvocation={toolInvocation} />
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
