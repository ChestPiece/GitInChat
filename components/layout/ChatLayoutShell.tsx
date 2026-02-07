'use client'

import { useState, ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { useChats } from '@/hooks/use-chats'
import { usePathname, useRouter } from 'next/navigation'

interface ChatLayoutShellProps {
  children: ReactNode
  user: any
}

export function ChatLayoutShell({ children, user }: ChatLayoutShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { chats, createChat, deleteChat, updateChat } = useChats()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleNewChat = async () => {
    try {
      const newChat = await createChat('New Chat')
      router.push(`/chat/${newChat.id}`)
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleDeleteChat = async (id: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(id)
        if (pathname === `/chat/${id}`) {
          router.push('/chat')
        }
      } catch (error) {
        console.error('Failed to delete chat:', error)
      }
    }
  }

  const handleRenameChat = async (id: string, newTitle: string) => {
    try {
      await updateChat(id, newTitle)
    } catch (error) {
      console.error('Failed to rename chat:', error)
    }
  }

  const formattedChats = chats.map(chat => ({
    id: chat.id,
    title: chat.title || 'New Chat',
    active: pathname === `/chat/${chat.id}`
  }))

  const headerUser = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
    email: user?.email,
    image: user?.user_metadata?.avatar_url
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">
      <Header user={headerUser} onMenuClick={() => setIsMobileMenuOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          chats={formattedChats} 
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        <MobileSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          chats={formattedChats}
          onNewChat={handleNewChat}
        />

        <main className="flex-1 overflow-hidden flex flex-col relative w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
