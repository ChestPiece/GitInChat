'use client'

import { useCallback, useEffect, useState } from 'react'

export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Getting Started',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Repository Basics',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = useCallback(async () => {
    setIsLoading(false)
    setError(null)
  }, [])

  const createChat = useCallback(
    async (title: string) => {
      try {
        const newChat: Chat = {
          id: Math.random().toString(36).substr(2, 9),
          title: title || 'New Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setChats((prev) => [newChat, ...prev])
        return newChat
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create chat'
        setError(message)
        throw err
      }
    },
    [],
  )

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete chat'
      setError(message)
      throw err
    }
  }, [])

  const updateChat = useCallback(async (chatId: string, title: string) => {
    try {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, title, updated_at: new Date().toISOString() }
            : chat,
        ),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update chat'
      setError(message)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  return {
    chats,
    isLoading,
    error,
    fetchChats,
    createChat,
    deleteChat,
    updateChat,
  }
}
