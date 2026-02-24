'use client'

import { useRef, useEffect } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { useChatController } from '@/hooks/use-chat-controller'
import { ChatEmptyState } from '@/components/chat-empty-state'

export default function ChatPage() {
  const {
    user,
    chatsLoading,
    isInitialLoading,
    messages,
    isLoading,
    currentChatId,
    sendMessage,
    handleNewChat
  } = useChatController()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user || chatsLoading || (isInitialLoading && messages.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          messages.map((message: any) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              displayName={userName}
              parts={message.parts}
              toolInvocations={message.toolInvocations}
              createdAt={message.createdAt}
              metadata={message.data || message.metadata}
            />
          ))
        )}
        {isLoading && (
             <div className="flex gap-3 mb-6">
                 <div className="w-10 h-10 flex-shrink-0 border border-border rounded-full bg-background flex items-center justify-center text-foreground">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
                 <div className="text-muted-foreground text-sm self-center animate-pulse">Thinking...</div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-background border-t border-border p-4 lg:p-6">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || !currentChatId}
          placeholder="Ask about your GitHub repositories..."
        />
      </div>
    </>
  )
}
