'use client'

import { useState, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { SidebarMobile } from '@/components/sidebar-mobile'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/use-chats'
import { useMessages } from '@/hooks/use-messages'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatDetailPage({ params }: ChatPageProps) {
  const router = useRouter()
  const [uiMessages, setUiMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { chats } = useChats()
  const { messages: dbMessages, sendMessage, fetchMessages } = useMessages(params.id)
  const [messages, setMessages] = useState<Message[]>([]); // Declare messages variable

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getUser()
        if (!currentUser) {
          router.push('/auth/login')
          return
        }
        setUser(currentUser)
        // Load messages for this chat
        await fetchMessages()
      } catch (error) {
        console.error('Failed to get user:', error)
        router.push('/auth/login')
      }
    }

    initializeUser()
  }, [router, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [uiMessages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsLoading(true)

    try {
      // Send user message to database
      await sendMessage(content, 'user')

      // Simulate AI response - in a real app, call your API/AI service here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assistantResponse = `Thanks for your message! I received: "${content}"\n\nThis is a simulated response for chat ${params.id}. In a real implementation, this would be connected to your GitHub agent API.`

      // Send assistant message to database
      await sendMessage(assistantResponse, 'assistant')

      // Refetch messages to show in UI
      await fetchMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = async () => {
    router.push('/chat')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  const userName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
  const userEmail = user.email || ''
  const userAvatar = user.user_metadata?.avatar_url

  return (
    <div className="flex h-screen bg-slate-900 relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          chats={chats}
          currentChatId={params.id}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile Sidebar */}
      <SidebarMobile
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        chats={chats}
        currentChatId={params.id}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <h2 className="text-lg font-semibold text-white">Chat</h2>
          <p className="text-sm text-slate-400">Conversation with your GitHub agent</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {dbMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-600"
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
                <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
                <p className="text-slate-400">Ask me anything about your GitHub repositories</p>
              </div>
            </div>
          ) : (
            dbMessages.map((message: any) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                displayName={userName}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-800 border-t border-slate-700 p-6">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask about your GitHub repositories..."
          />
        </div>
      </main>
    </div>
  )
}
