'use client'

import { useState, useRef, useEffect, use } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { ChatEmptyState } from '@/components/chat-empty-state'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import * as messagesService from '@/lib/services/messages.client'
import { toast } from 'sonner'
import { UIMessage } from 'ai'
import { mapDatabaseMessagesToUIMessages } from '@/lib/mappers/message-mapper'
import { LoadingSpinner } from '@/components/ui/spinner'

interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

interface ChatUser {
    name?: string;
    email?: string;
}

// Extend UIMessage to include properties we need that might be missing or optional in the base type
export type ExtendedUIMessage = UIMessage & {
    toolInvocations?: any[];
    createdAt?: Date | number | string;
    content?: string; // Legacy support for string content
    data?: any;
    metadata?: any;
}

export default function ChatDetailPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<ChatUser | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [initialMessages, setInitialMessages] = useState<ExtendedUIMessage[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Remove initialMessages from options as it is not supported or causing issues
  const { messages, sendMessage, status, setMessages } = useChat({
    onError: (error: Error) => {
      toast.error('Failed to send message: ' + error.message)
    },
    onFinish: () => {
        // Optional: Trigger a router refresh or other side effect if needed
    }
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

  // Fetch initial messages from DB
  useEffect(() => {
    const loadMessages = async () => {
        setIsInitialLoading(true)
        try {
            const fetched = await messagesService.fetchMessages(id)
            if (fetched && fetched.length > 0) {
                 const mappedMessages = mapDatabaseMessagesToUIMessages(fetched);
                 setMessages(mappedMessages as ExtendedUIMessage[])
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
      try {
          // Construct message with parts as expected by the new UIMessage type
          await sendMessage({
              role: 'user',
              parts: [{ type: 'text', text: content }],
          } as any, { 
            body: { chatId: id } 
          });
      } catch (error: any) {
         console.error("Error creating message", error);
         toast.error("Failed to prevent message");
      }
  };

  if (!user || isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d1117]">
        <div className="text-[#8b949e]">Loading...</div>
      </div>
    )
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState
            title="No messages yet"
            description="Start the conversation!"
            onSuggest={handleSendMessage}
          />
        ) : (
          messages.map((message) => {
            const extendedMessage = message as ExtendedUIMessage;
            // Provide defaults for strict type checking if casting is not enough
            const role = (message.role as string === 'data' ? 'assistant' : message.role) as "user" | "assistant"; 
            
            return (
                <ChatMessage
                key={message.id}
                role={role}
                // content prop is omitted in favor of parts
                displayName={userName}
                parts={message.parts as any} // ChatMessage parts might expect a slightly different type
                // toolInvocations omitted in favor of parts
                createdAt={extendedMessage.createdAt}
                metadata={extendedMessage.data || extendedMessage.metadata}
                />
            )
          })
        )}
        {isLoading && (
             <div className="flex gap-3 mb-6">
                 <div className="w-10 h-10 flex-shrink-0 border border-[#30363d] rounded-full bg-[#0d1117] flex items-center justify-center text-[#c9d1d9]">
                    <LoadingSpinner />
                 </div>
                 <div className="text-[#8b949e] text-sm self-center animate-pulse">Thinking...</div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[#0d1117] border-t border-[#30363d] p-4 lg:p-6">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask about your GitHub repositories..."
        />
      </div>
    </>
  )
}
