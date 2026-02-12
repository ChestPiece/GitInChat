"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { fetchChats, createChat, deleteChat, updateChat, Chat } from "@/lib/services/chats"

export type { Chat }

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchChats(supabase)
      setChats(data)
    } catch (error: any) {
      console.error('Error fetching chats:', error)
      setError(error.message || 'Failed to fetch chats')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  const addChat = useCallback(async (title: string) => {
    try {
      setError(null)
      // We still need to get the user here because the service expects userId
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newChat = await createChat(title, user.id, supabase)
      setChats((prev) => [newChat, ...prev])
      return newChat.id
    } catch (error: any) {
      console.error('Error creating chat:', error)
      setError(error.message || 'Failed to create chat')
      return null
    }
  }, [supabase])

  const removeChat = useCallback(async (id: string) => {
    try {
      setError(null)
      await deleteChat(id, supabase)
      setChats((prev) => prev.filter((chat) => chat.id !== id))
    } catch (error: any) {
      console.error('Error deleting chat:', error)
      setError(error.message || 'Failed to delete chat')
    }
  }, [supabase])

  const editChat = useCallback(async (id: string, title: string) => {
    try {
      setError(null)
      await updateChat(id, title, supabase)
      setChats((prev) => prev.map((chat) => 
        chat.id === id ? { ...chat, title } : chat
      ))
    } catch (error: any) {
      console.error('Error updating chat:', error)
      setError(error.message || 'Failed to update chat')
    }
  }, [supabase])

  return {
    chats,
    isLoading,
    error,
    addChat,
    deleteChat: removeChat,
    updateChat: editChat,
    refreshChats: loadChats
  }
}
