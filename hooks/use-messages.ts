'use client'

import { useCallback, useState } from 'react'

export interface Message {
  id: string
  chat_id: string
  user_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Error fetching messages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [chatId])

  const sendMessage = useCallback(
    async (content: string, role: 'user' | 'assistant' = 'user') => {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            content,
            role,
          }),
        })
        if (!response.ok) {
          throw new Error('Failed to send message')
        }
        const newMessage = await response.json()
        setMessages((prev) => [...prev, newMessage])
        return newMessage
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Error sending message:', err)
        throw err
      }
    },
    [chatId]
  )

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
  }
}
