'use client'

import { ChatToolInvocation } from '@/components/chat-tool-invocation'

interface MessageToolListProps {
  toolParts?: any[]
  toolInvocations?: any[]
}

export function MessageToolList({ toolParts = [], toolInvocations = [] }: MessageToolListProps) {
  const hasToolParts = toolParts.length > 0
  const hasLegacyTools = toolInvocations.length > 0

  if (!hasToolParts && !hasLegacyTools) return null

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      {hasToolParts ? (
        toolParts.map((part, index) => (
          <ChatToolInvocation 
            key={part.toolCallId || index} 
            toolInvocation={{
              toolName: part.toolName,
              toolCallId: part.toolCallId,
              args: part.args,
              result: part.result,
              state: part.state,
            }} 
          />
        ))
      ) : (
        toolInvocations.map((toolInvocation) => (
          <ChatToolInvocation key={toolInvocation.toolCallId} toolInvocation={toolInvocation} />
        ))
      )}
    </div>
  )
}
