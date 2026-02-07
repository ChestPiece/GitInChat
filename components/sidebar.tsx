'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'
import { MessageSquare, Plus, Settings, Github, LogOut } from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  userEmail?: string
  userName?: string
  userAvatar?: string
  chats?: Array<{
    id: string
    title: string
  }>
  currentChatId?: string
  onNewChat?: () => Promise<void>
}

export function Sidebar({
  userEmail = 'user@example.com',
  userName = 'User',
  userAvatar,
  chats = [],
  currentChatId,
  onNewChat,
}: SidebarProps) {
  const handleLogout = async () => {
    await signOut()
  }

  const handleNewChat = async () => {
    if (onNewChat) {
      await onNewChat()
    }
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Github className="w-5 h-5" />
          </div>
          <span>GitHub Chat</span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-700">
        <Button
          onClick={handleNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
          <div className="p-3 space-y-2">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-slate-500 text-sm">No chat history yet</p>
          </div>
        )}
      </div>

      {/* User Profile & Settings */}
      <div className="p-4 space-y-3 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            {userAvatar && <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />}
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-left justify-start text-slate-400 hover:text-slate-300 hover:bg-slate-800"
        >
          <Settings className="mr-2 w-4 h-4" />
          Settings
        </Button>

        <form action={handleLogout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full text-left justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
          >
            <LogOut className="mr-2 w-4 h-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}
