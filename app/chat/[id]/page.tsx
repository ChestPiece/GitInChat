'use client'

import { useState, useRef, useEffect, use } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { ChatEmptyState } from '@/components/chat-empty-state'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import * as messagesService from '@/lib/services/messages.client'
import { toast } from 'sonner'
import { mapDatabaseMessagesToUIMessages } from '@/lib/mappers/message-mapper'

interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

interface ChatUser {
    name?: string;
    email?: string;
}

export type ExtendedUIMessage = UIMessage & {
    createdAt?: Date | number | string;
    data?: any;
    metadata?: any;
}

export default function ChatDetailPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<ChatUser | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { chatId: id },
    }),
    onError: (error: Error) => {
      toast.error('Failed to send message: ' + error.message)
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getUser()
        if (!currentUser) {
          router.push('/auth/login')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Failed to get user:', error)
        router.push('/auth/login')
      }
    }

    initializeUser()
  }, [router])

  useEffect(() => {
    const loadMessages = async () => {
      setIsInitialLoading(true)
      try {
        const fetched = await messagesService.fetchMessages(id)
        if (fetched && fetched.length > 0) {
          setMessages(mapDatabaseMessagesToUIMessages(fetched))
        }
      } catch (e) {
        console.error(e)
        toast.error('Failed to load history')
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadMessages()
  }, [id, setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: content }],
    });
  };

  if (!user || isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState onSuggest={handleSendMessage} />
        ) : (
          messages.map((message) => {
            const extendedMessage = message as ExtendedUIMessage;
            return (
              <ChatMessage
                key={message.id}
                role={message.role as 'user' | 'assistant'}
                displayName={userName}
                parts={message.parts as any}
                createdAt={extendedMessage.createdAt}
                metadata={extendedMessage.data || extendedMessage.metadata}
              />
            )
          })
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

      <div className="bg-background border-t border-border p-4 lg:p-6">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask about your GitHub repositories..."
        />
      </div>
    </>
  )
}
