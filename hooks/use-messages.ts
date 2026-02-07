'use client'

import { useCallback, useState } from 'react'

export interface Message {
  id: string
  chat_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      chat_id: '1',
      role: 'assistant',
      content: 'Welcome to GitHub Chat! I\'m your AI assistant for managing GitHub repositories. How can I help you today?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      chat_id: '1',
      role: 'user',
      content: 'How do I create a new repository?',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '3',
      chat_id: '1',
      role: 'assistant',
      content: 'To create a new repository:\n\n1. Click the "+" icon in the top right\n2. Select "New repository"\n3. Fill in the details\n4. Choose public or private\n5. Click "Create"\n\nAny other questions?',
      created_at: new Date(Date.now() - 1600000).toISOString(),
    },
  ],
  '2': [
    {
      id: '4',
      chat_id: '2',
      role: 'assistant',
      content: 'Let\'s talk about repository basics. What would you like to know?',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
}

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>(mockMessages[chatId] || [])
  const [isLoading, setIsLoading] = useState(false)

  const fetchMessages = useCallback(async () => {
    setIsLoading(false)
  }, [chatId])

  const sendMessage = useCallback(
    async (content: string, role: 'user' | 'assistant' = 'user') => {
      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        chat_id: chatId,
        role,
        content,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMessage])
      return newMessage
    },
    [chatId],
  )

  return {
    messages,
    isLoading,
    fetchMessages,
    sendMessage,
  }
}
