'use client'

import { useRef, useEffect } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { useChatController } from '@/hooks/use-chat-controller'
import { ChatEmptyState } from '@/components/chat-empty-state'
import { gsap } from '@/lib/gsap'

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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 140
    if (nearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    gsap.from('.message-new', { y: 12, autoAlpha: 0, duration: 0.25, ease: 'power2.out' })
  }, [messages.length])

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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState onSuggest={sendMessage} />
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
              isNew={Boolean(message.id && message.id === messages[messages.length - 1]?.id)}
            />
          ))
        )}
        {isLoading && (
             <div className="flex gap-3 mb-6 items-center">
               <div className="w-10 h-10 flex-shrink-0 border border-[var(--gh-border)] rounded-full bg-[var(--gh-canvas)] flex items-center justify-center">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-[var(--gh-green)] animate-dot-pulse" />
                   <span className="w-1.5 h-1.5 rounded-full bg-[var(--gh-green)] animate-dot-pulse [animation-delay:120ms]" />
                   <span className="w-1.5 h-1.5 rounded-full bg-[var(--gh-green)] animate-dot-pulse [animation-delay:240ms]" />
                 </div>
               </div>
               <div className="h-1 w-40 bg-[var(--gh-subtle)] overflow-hidden rounded">
                 <div className="scan-bar h-full bg-[var(--gh-green)] origin-left animate-scan-x" />
               </div>
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
