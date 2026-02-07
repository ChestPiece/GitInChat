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
  const { chats, createChat } = useChats()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNewChat = async () => {
    try {
      const newChat = await createChat('New Chat')
      router.push(`/chat/${newChat.id}`)
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Failed to create new chat:', error)
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
