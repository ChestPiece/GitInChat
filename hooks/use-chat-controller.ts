import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/use-chats'
import { useChat } from '@ai-sdk/react'
import { getUser } from '@/lib/auth'
import * as messagesService from '@/lib/services/messages.client'
import { toast } from 'sonner'
import { UIMessage } from 'ai'
import { User } from '@/lib/auth'

export function useChatController() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const { chats, addChat, isLoading: chatsLoading } = useChats()
  
  // Custom state to manage initial loading
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  // sendMessage is the v6 API (append was removed in AI SDK v6)
  const { messages, sendMessage, status, setMessages } = useChat({
    api: '/api/chat',
    body: { chatId: currentChatId },
    initialMessages: initialMessages,
    onError: (error: Error) => {
      toast.error('Failed to send message: ' + error.message)
    }
  });

  const isLoading = status === 'streaming' || status === 'submitted';

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
                const newChatId = await addChat('New Chat')
                if (newChatId) setCurrentChatId(newChatId)
            } catch (error) {
                console.error('Failed to create initial chat:', error)
            }
          } else if (!currentChatId) {
             setCurrentChatId(chats[0].id)
          }
      }
    }
    initializeChat()
  }, [user, chats, chatsLoading, currentChatId, addChat])

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
                  createdAt: m.created_at,
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
      const newChatId = await addChat('New Chat')
      if (newChatId) {
        setCurrentChatId(newChatId)
        setMessages([]) // Clear local messages
      }
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  return {
    user,
    chats,
    currentChatId,
    setCurrentChatId,
    messages,
    isLoading,
    isInitialLoading,
    chatsLoading,
    sendMessage: handleSendMessage,
    handleNewChat,

  }
}
