'use client'

import { useCallback, useEffect, useState } from 'react'
import * as messagesService from '@/lib/services/messages.client'

export interface Message {
  id: string
  chat_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setIsLoading(false)
      setMessages([])
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await messagesService.fetchMessages(chatId)
      setMessages(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch messages'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [chatId])

  const sendMessage = useCallback(
    async (content: string, role: 'user' | 'assistant' = 'user') => {
      if (!chatId) throw new Error('No chat ID provided')
      
      try {
        // const newMessage = await messagesService.createMessage(chatId, role, content)
        // setMessages((prev) => [...prev, newMessage])
        // return newMessage
        throw new Error("sendMessage via useMessages is deprecated. Use useChat hook.");
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message'
        setError(message)
        throw err
      }
    },
    [chatId],
  )

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
  }
}
