'use client'

import { useState, useRef, useEffect, use } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import * as messagesService from '@/lib/services/messages'
import { toast } from 'sonner'
import { UIMessage } from 'ai'

interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ChatDetailPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const { messages, sendMessage, status, setMessages } = useChat({
    api: '/api/chat',
    body: { chatId: id },
    initialMessages: initialMessages,
    onError: (error: Error) => {
      toast.error('Failed to send message: ' + error.message)
    },
    onFinish: () => {
        // Optional: Trigger a router refresh or other side effect if needed
    }
  } as any) as any;

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
                 const mappedMessages: any[] = fetched.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    toolInvocations: [],
                    parts: [], 
                 }))
                 setMessages(mappedMessages)
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
          await sendMessage({
              role: 'user',
              content: content,
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
          <div className="flex items-center justify-center h-full">
            <div className="text-[#8b949e]">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          messages.map((message: any) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              displayName={userName}
              toolInvocations={message.toolInvocations}
            />
          ))
        )}
        {isLoading && (
             <div className="flex gap-3 mb-6">
                 <div className="w-10 h-10 flex-shrink-0 border border-[#30363d] rounded-full bg-[#0d1117] flex items-center justify-center text-[#c9d1d9]">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
