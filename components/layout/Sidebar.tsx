'use client'

import { Button } from '@/components/ui/button'
import { Plus, Book, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface SidebarProps {
  chats?: Array<{
    id: string
    title: string
    active?: boolean
  }>
  onNewChat?: () => void
  onDeleteChat?: (id: string) => void
  onRenameChat?: (id: string, newTitle: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function Sidebar({ 
  chats = [], 
  onNewChat, 
  onDeleteChat,
  onRenameChat,
  isCollapsed = false,
  onToggleCollapse,
  className 
}: SidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingChatId(id)
    setEditTitle(currentTitle)
  }

  const handleRenameSubmit = (id: string) => {
    if (onRenameChat && editTitle.trim()) {
      onRenameChat(id, editTitle)
    }
    setEditingChatId(null)
  }

  return (
    <aside 
      className={`bg-[#0d1117] border-r border-[#30363d] flex flex-col pt-4 hidden lg:flex h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-[296px]'
      } ${className}`}
    >
      {/* Top Section */}
      <div className={`px-4 pb-2 flex ${isCollapsed ? 'flex-col items-center gap-4' : 'flex-col'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-between'} mb-2`}>
          {!isCollapsed && <h2 className="text-sm font-semibold text-[#c9d1d9]">Your chats</h2>}
          <Button 
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#1f2428] h-8 w-8"
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>

        {!isCollapsed && (
          <Button 
            onClick={onNewChat}
            size="sm" 
            className="bg-[#238636] hover:bg-[#2ea043] text-white hover:text-white h-7 px-2 text-xs font-semibold gap-1 flex items-center border border-[rgba(240,246,252,0.1)] rounded-md shadow-sm w-full justify-center mb-4"
          >
            <Plus className="h-3.5 w-3.5 text-white" />
            New
          </Button>
        )}
        
        {isCollapsed && (
           <Button 
             onClick={onNewChat}
             size="icon" 
             className="bg-[#238636] hover:bg-[#2ea043] text-white hover:text-white h-8 w-8 rounded-md shadow-sm"
           >
             <Plus className="h-4 w-4 text-white" />
           </Button>
        )}

        {!isCollapsed && (
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Find a chat..." 
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1 px-3 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-colors"
            />
          </div>
        )}
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        <ul className="space-y-1">
          {chats.map((chat) => (
            <li key={chat.id} className="relative group">
              {editingChatId === chat.id && !isCollapsed ? (
                <div className="flex items-center gap-2 px-2 py-1">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(chat.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(chat.id)}
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-1 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              ) : (
                <div className={`flex items-center justify-between group rounded-md ${
                    chat.active 
                      ? 'bg-[#1f2428]' 
                      : 'hover:bg-[#161b22]'
                  }`}>
                  <Link 
                    href={`/chat/${chat.id}`}
                    className={`flex items-center gap-2 px-2 py-1.5 flex-1 min-w-0 ${
                      chat.active ? 'text-[#c9d1d9]' : 'text-[#c9d1d9] hover:text-[#58a6ff]'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={chat.title}
                  >
                    <div className="min-w-[16px] flex justify-center">
                       <Book className={`h-4 w-4 ${chat.active ? 'text-[#c9d1d9]' : 'text-[#8b949e] group-hover:text-[#c9d1d9]'}`} />
                    </div>
                    {!isCollapsed && (
                      <span className={`truncate font-medium text-sm ${chat.active ? 'font-semibold' : ''}`}>
                        {chat.title.includes('/') ? chat.title : `owner/${chat.title}`}
                      </span>
                    )}
                  </Link>
                  
                  {!isCollapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 mr-1 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#1f2428]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#161b22] border-[#30363d] text-[#c9d1d9]">
                        <DropdownMenuItem onClick={() => handleStartRename(chat.id, chat.title)}>
                          <Edit2 className="h-3 w-3 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteChat?.(chat.id)}
                          className="text-red-400 focus:text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        
        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-[#30363d] mx-2">
            <h3 className="text-sm font-semibold text-[#c9d1d9] mb-2">Recent activity</h3>
             <div className="border border-[#30363d] rounded-md p-4 bg-[#0d1117] mb-2">
               <p className="text-xs text-[#8b949e] mb-1">When you have chat activity, it will show up here.</p>
             </div>
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
