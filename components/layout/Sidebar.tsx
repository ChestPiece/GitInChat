'use client'

import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'

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
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sidebarRef.current) return
    gsap.to(sidebarRef.current, {
      width: isCollapsed ? 64 : 296,
      duration: 0.3,
      ease: 'power2.inOut',
      overwrite: true,
    })
  }, [isCollapsed])

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
      ref={sidebarRef}
      className={`border-r border-[var(--gh-border)] hidden lg:flex lg:flex-col pt-4 h-full overflow-hidden ${isCollapsed ? 'w-16' : 'w-[296px]'} ${className}`}
      style={{ background: 'linear-gradient(180deg, var(--gh-subtle) 0%, var(--gh-canvas) 100%)' }}
    >
      {/* Top Section */}
      <div className={`px-4 pb-2 flex ${isCollapsed ? 'flex-col items-center gap-4' : 'flex-col'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-between'} mb-2`}>
          {!isCollapsed && <h2 className="text-sm font-semibold text-[var(--gh-text)]">Your chats</h2>}
          <Button 
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] hover:bg-[var(--gh-overlay)] h-8 w-8"
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>

        {!isCollapsed && (
          <Button 
            onClick={onNewChat}
            size="sm" 
            aria-label="Create new chat"
            className="bg-[var(--gh-green)] hover:bg-[var(--gh-green-hover)] text-white h-7 px-2 text-xs font-semibold gap-1 flex items-center border border-[rgba(240,246,252,0.1)] rounded-md shadow-sm w-full justify-center mb-4 hover:shadow-[0_0_16px_var(--gh-green-glow)]"
          >
            <Plus className="h-3.5 w-3.5 text-white" />
            New
          </Button>
        )}
        
        {isCollapsed && (
           <Button 
             onClick={onNewChat}
             size="icon" 
             aria-label="Create new chat"
             className="bg-[var(--gh-green)] hover:bg-[var(--gh-green-hover)] text-white h-8 w-8 rounded-md shadow-sm hover:shadow-[0_0_16px_var(--gh-green-glow)]"
           >
             <Plus className="h-4 w-4 text-white" />
           </Button>
        )}

        {!isCollapsed && (
          <div className="relative mb-4">
            <label htmlFor="chat-search" className="sr-only">Find a chat</label>
            <input 
              id="chat-search"
              type="text" 
              placeholder="Find a chat..." 
              className="w-full bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md py-1 px-3 text-sm text-[var(--gh-text)] placeholder-[var(--gh-text-muted)] focus:outline-none focus:border-[var(--gh-blue)] focus:shadow-[0_0_0_3px_var(--gh-blue-glow)] transition-colors"
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleRenameSubmit(chat.id)
                        ;(e.currentTarget as HTMLInputElement).blur()
                      }
                    }}
                    className="flex-1 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded px-1 text-sm text-[var(--gh-text)] focus:outline-none focus:border-[var(--gh-blue)]"
                  />
                </div>
              ) : (
                <div className={`flex items-center justify-between group rounded-md border-l-2 ${
                    chat.active 
                      ? 'bg-[var(--gh-overlay)] border-l-[var(--gh-green)]' 
                      : 'hover:bg-[color:var(--gh-subtle)]/60 border-l-transparent'
                  }`}>
                  <Link 
                    href={`/chat/${chat.id}`}
                    className={`flex items-center gap-2 px-2 py-1.5 flex-1 min-w-0 ${
                      chat.active ? 'text-[var(--gh-text)]' : 'text-[var(--gh-text)] hover:text-[var(--gh-blue)]'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={chat.title}
                  >
                    <div className="min-w-[16px] flex justify-center">
                       <MessageSquare className={`h-4 w-4 ${chat.active ? 'text-[var(--gh-text)]' : 'text-[var(--gh-text-muted)] group-hover:text-[var(--gh-text)]'}`} />
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
                        <Button aria-label="Chat actions" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 mr-1 text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] hover:bg-[var(--gh-overlay)]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[var(--gh-subtle)] border-[var(--gh-border)] text-[var(--gh-text)]">
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
          <div className="mt-6 pt-4 border-t border-[var(--gh-border)] mx-2">
            <h3 className="text-sm font-semibold text-[var(--gh-text)] mb-2">Recent activity</h3>
             <div className="border border-dashed border-[var(--gh-border-muted)] rounded-md p-4 bg-[var(--gh-canvas)] mb-2 text-center">
               <MessageSquare className="h-4 w-4 mx-auto mb-2 text-[var(--gh-text-muted)]" />
               <p className="text-xs text-[var(--gh-text-muted)] mb-1">When you have chat activity, it will show up here.</p>
             </div>
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
