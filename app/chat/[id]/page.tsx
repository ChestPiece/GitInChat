'use client'

import { useState, useRef, useEffect, use } from 'react'
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
  params: Promise<{
    id: string
  }>
}

export default function ChatDetailPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { chats } = useChats()
  const { messages: dbMessages, sendMessage, fetchMessages } = useMessages(id)
  const uiMessages = dbMessages; // Declare uiMessages variable

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
  }, [dbMessages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsLoading(true)

    try {
      // Send user message to database
      await sendMessage(content, 'user')

      // Simulate AI response - in a real app, call your API/AI service here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assistantResponse = `Thanks for your message! I received: "${content}"\n\nThis is a simulated response for chat ${id}. In a real implementation, this would be connected to your GitHub agent API.`

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
        {dbMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl w-full px-4">
              <div className="w-16 h-16 bg-[#161b22] rounded-lg flex items-center justify-center mx-auto mb-6 border border-[#30363d]">
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
              <h3 className="text-xl font-semibold text-[#c9d1d9] mb-2">Welcome to GitHub Chat</h3>
              <p className="text-[#8b949e] mb-8">Start a conversation by selecting a suggestion below or typing your own query.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                  { title: 'Explain this repository', desc: 'Get a high-level overview of the codebase architecture.' },
                  { title: 'Find recent bugs', desc: 'Scan issues and pull requests for reported bugs.' },
                  { title: 'Generate unit tests', desc: 'Create tests for specific components or functions.' },
                  { title: 'Draft a release', desc: 'Summarize recent changes into a release note.' },
                ].map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(card.title)}
                    className="p-4 rounded-md border border-[#30363d] bg-[#161b22] hover:bg-[#1f2428] hover:border-[#8b949e] transition-all group"
                  >
                    <div className="font-semibold text-[#c9d1d9] mb-1 group-hover:text-[#58a6ff]">{card.title}</div>
                    <div className="text-sm text-[#8b949e]">{card.desc}</div>
                  </button>
                ))}
              </div>
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
