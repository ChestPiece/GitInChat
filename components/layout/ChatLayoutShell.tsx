'use client'

import { useState, ReactNode, useEffect } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { useChats } from '@/hooks/use-chats'
import { usePathname, useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ChatLayoutShellProps {
  children: ReactNode
  user: any
}

export function ChatLayoutShell({ children, user }: ChatLayoutShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { chats, addChat, deleteChat, updateChat } = useChats()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [pendingDeleteChatId, setPendingDeleteChatId] = useState<string | null>(null)

  const handleNewChat = async () => {
    try {
      const newChatId = await addChat('New Chat')
      if (newChatId) {
        router.push(`/chat/${newChatId}`)
        setIsMobileMenuOpen(false)
      }
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleDeleteChat = async (id: string) => {
    setPendingDeleteChatId(id)
  }

  const confirmDeleteChat = async () => {
    if (!pendingDeleteChatId) return
    const id = pendingDeleteChatId
    try {
      await deleteChat(id)
      if (pathname === `/chat/${id}`) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    } finally {
      setPendingDeleteChatId(null)
    }
  }

  const handleRenameChat = async (id: string, newTitle: string) => {
    try {
      await updateChat(id, newTitle)
    } catch (error) {
      console.error('Failed to rename chat:', error)
    }
  }

  // Cmd+K / Ctrl+K → new chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleNewChat()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const formattedChats = chats.map(chat => ({
    id: chat.id,
    title: chat.title || 'New Chat',
    active: pathname === `/chat/${chat.id}`
  }))

  const headerUser = {
    name: user?.name || user?.email?.split('@')[0],
    email: user?.email,
    image: user?.avatar
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--pr-bg)] overflow-hidden">
      <Header user={headerUser} onMenuClick={() => setIsMobileMenuOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          user={headerUser}
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

      <AlertDialog open={pendingDeleteChatId !== null} onOpenChange={(open) => !open && setPendingDeleteChatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes this chat and its messages from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChat}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
