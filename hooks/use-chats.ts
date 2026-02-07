'use client'

import { useCallback, useEffect, useState } from 'react'
import * as chatsService from '@/lib/services/chats'

export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await chatsService.fetchChats()
      setChats(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch chats'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createChat = useCallback(
    async (title: string) => {
      try {
        const newChat = await chatsService.createChat(title)
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
      await chatsService.deleteChat(chatId)
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete chat'
      setError(message)
      throw err
    }
  }, [])

  const updateChat = useCallback(async (chatId: string, title: string) => {
    try {
      const updatedChat = await chatsService.updateChat(chatId, title)
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? updatedChat : chat)),
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
