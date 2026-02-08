'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/use-chats'
import { useChat } from '@ai-sdk/react'
import * as messagesService from '@/lib/services/messages'
import { toast } from 'sonner'
import { UIMessage } from 'ai'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { chats, createChat, isLoading: chatsLoading } = useChats()
  
  // Custom state to manage initial loading
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  // Cast useChat options to any to avoid strict type mismatches with installed version
  // We use sendMessage instead of append because append is missing in this version
  const { messages, sendMessage, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: { chatId: currentChatId },
    initialMessages: initialMessages,
    onError: (error: Error) => {
      toast.error('Failed to send message: ' + error.message)
    }
  } as any) as any;

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

  // Auto-create first chat if user has no chats, or select most recent
  useEffect(() => {
    const initializeChat = async () => {
      if (user && !chatsLoading) {
          if (chats.length === 0) {
            try {
                const newChat = await createChat('New Chat')
                setCurrentChatId(newChat.id)
            } catch (error) {
                console.error('Failed to create initial chat:', error)
            }
          } else if (!currentChatId) {
             setCurrentChatId(chats[0].id)
          }
      }
    }
    initializeChat()
  }, [user, chats, chatsLoading, currentChatId, createChat])

  // Fetch messages when chat ID changes
  useEffect(() => {
      if (!currentChatId) return

      const loadMessages = async () => {
          setIsInitialLoading(true)
          try {
              const fetched = await messagesService.fetchMessages(currentChatId)
              const mappedMessages: any[] = fetched.map(m => ({
                  id: m.id,
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                  toolInvocations: [], // Default to empty if not in DB yet
                  parts: [], // Satisfy UIMessage type requirements (v6+)
              }))
              setMessages(mappedMessages)
          } catch (e) {
              console.error(e)
              toast.error('Failed to load history')
          } finally {
              setIsInitialLoading(false)
          }
      }
      loadMessages()
  }, [currentChatId, setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChatId) return

    try {
        // Optimistically add user message via sendMessage
        await sendMessage({
            role: 'user',
            content
        })
    } catch (error: any) {
        console.error('Error sending message:', error)
        toast.error('Failed to send message: ' + (error.message || 'Unknown error'))
    }
  }

  const handleNewChat = async () => {
    try {
      const newChat = await createChat('New Chat')
      setCurrentChatId(newChat.id)
      setMessages([]) // Clear local messages
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  if (!user || chatsLoading || (isInitialLoading && messages.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d1117]">
        <div className="text-[#8b949e]">Loading...</div>
      </div>
    )
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#161b22] rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#30363d]">
                <svg
                  className="w-8 h-8 text-[#8b949e]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#c9d1d9] mb-2">Start a conversation</h3>
              <p className="text-[#8b949e]">Ask me anything about your GitHub repositories</p>
            </div>
          </div>
        ) : (
          messages.map((message: any) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              displayName={userName}
              parts={message.parts}
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

      {/* Input Area */}
      <div className="bg-[#0d1117] border-t border-[#30363d] p-4 lg:p-6">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || !currentChatId}
          placeholder="Ask about your GitHub repositories..."
        />
      </div>
    </>
  )
}
