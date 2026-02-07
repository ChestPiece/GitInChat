'use client'

import { useCallback, useEffect, useState } from 'react'

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
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/chats')
      if (!response.ok) {
        throw new Error('Failed to fetch chats')
      }
      const data = await response.json()
      setChats(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Error fetching chats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createChat = useCallback(async (title?: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'New Chat' }),
      })
      if (!response.ok) {
        throw new Error('Failed to create chat')
      }
      const newChat = await response.json()
      setChats((prev) => [newChat, ...prev])
      return newChat
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Error creating chat:', err)
      throw err
    }
  }, [])

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Error deleting chat:', err)
      throw err
    }
  }, [])

  const updateChat = useCallback(async (chatId: string, title: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) {
        throw new Error('Failed to update chat')
      }
      const updatedChat = await response.json()
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? updatedChat : chat))
      )
      return updatedChat
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Error updating chat:', err)
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
