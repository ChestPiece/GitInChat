'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/use-chats'
import { useMessages } from '@/hooks/use-messages'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { chats, createChat, isLoading: chatsLoading } = useChats()
  const { messages, sendMessage, isLoading: messagesLoading } = useMessages(currentChatId)

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

  // Auto-create first chat if user has no chats
  useEffect(() => {
    const initializeChat = async () => {
      if (user && !chatsLoading && chats.length === 0) {
        try {
          const newChat = await createChat('New Chat')
          setCurrentChatId(newChat.id)
        } catch (error) {
          console.error('Failed to create initial chat:', error)
        }
      } else if (chats.length > 0 && !currentChatId) {
        // Set the most recent chat as active
        setCurrentChatId(chats[0].id)
      }
    }

    initializeChat()
  }, [user, chats, chatsLoading, currentChatId, createChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChatId) return

    setIsLoadingMessages(true)
    try {
      // Send user message
      await sendMessage(content, 'user')

      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assistantResponse = `Thanks for your message! I received: "${content}"\n\nThis is a simulated response. In a real implementation, this would be connected to your GitHub agent API.`
      
      await sendMessage(assistantResponse, 'assistant')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const newChat = await createChat('New Chat')
      setCurrentChatId(newChat.id)
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  if (!user || chatsLoading) {
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
          messages.map((message) => (
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
          disabled={isLoadingMessages || messagesLoading || !currentChatId}
          placeholder="Ask about your GitHub repositories..."
        />
      </div>
    </>
  )
}
