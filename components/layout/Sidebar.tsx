'use client'

import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Trash2, Edit2, Settings, Search } from 'lucide-react'
import { GithubActivityFeed } from '@/components/github-activity-feed'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState, useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'

interface Chat {
  id: string
  title: string
  active?: boolean
  createdAt?: string
}

interface SidebarProps {
  chats?: Chat[]
  onNewChat?: () => void
  onDeleteChat?: (id: string) => void
  onRenameChat?: (id: string, newTitle: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
  user?: {
    name?: string
    email?: string
    image?: string
  }
}

function groupChatsByDate(chats: Chat[]): Array<{ label: string; chats: Chat[] }> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: Record<string, Chat[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 days': [],
    Older: [],
    Recent: [],
  }

  for (const chat of chats) {
    if (!chat.createdAt) {
      groups['Recent'].push(chat)
      continue
    }
    const d = new Date(chat.createdAt)
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (day.getTime() === today.getTime()) {
      groups['Today'].push(chat)
    } else if (day.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(chat)
    } else if (day >= sevenDaysAgo) {
      groups['Last 7 days'].push(chat)
    } else {
      groups['Older'].push(chat)
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, chats: items }))
}

export function Sidebar({
  chats = [],
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isCollapsed = false,
  onToggleCollapse,
  className,
  user,
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

  const grouped = groupChatsByDate(chats)

  return (
    <aside
      ref={sidebarRef}
      className={`bg-[var(--pr-bg)] border-r border-[var(--pr-border)] hidden lg:flex lg:flex-col h-full overflow-hidden ${isCollapsed ? 'w-16' : 'w-[296px]'} ${className ?? ''}`}
    >
      {/* Top bar: collapse toggle */}
      <div className={`px-3 pt-4 pb-2 flex ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="icon"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="h-8 w-8 text-[var(--pr-text-muted)] hover:text-[var(--pr-text)] hover:bg-[var(--pr-surface-elevated)]"
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>

      {/* New Chat button */}
      <div className={`px-3 pb-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {isCollapsed ? (
          <Button
            onClick={onNewChat}
            size="icon"
            aria-label="Create new chat"
            className="h-9 w-9 bg-[var(--pr-accent)] hover:bg-[var(--pr-accent-hover)] text-white rounded-md shadow-sm hover:shadow-[0_0_20px_var(--pr-accent-glow)]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onNewChat}
            aria-label="Create new chat"
            className="w-full bg-[var(--pr-accent)] hover:bg-[var(--pr-accent-hover)] text-white font-semibold gap-2 hover:shadow-[0_0_20px_var(--pr-accent-glow)] transition-shadow"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        )}
      </div>

      {/* Search input (expanded only) */}
      {!isCollapsed && (
        <div className="px-3 pb-3 relative">
          <label htmlFor="chat-search" className="sr-only">Find a chat</label>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--pr-text-muted)] pointer-events-none" />
          <input
            id="chat-search"
            type="text"
            placeholder="Find a chat..."
            className="w-full bg-[var(--pr-surface)] border border-[var(--pr-border-strong)] rounded-md py-1.5 pl-8 pr-3 text-sm text-[var(--pr-text)] placeholder:text-[var(--pr-text-muted)] focus:outline-none focus:border-[var(--pr-accent)] focus:ring-1 focus:ring-[var(--pr-accent-glow)] transition-colors"
          />
        </div>
      )}

      {/* Chat list */}
      <ScrollArea className="flex-1 px-2">
        {grouped.length === 0 ? (
          !isCollapsed && (
            <div className="px-2 py-6 text-center">
              <MessageSquare className="h-5 w-5 mx-auto mb-2 text-[var(--pr-text-subtle)]" />
              <p className="text-xs text-[var(--pr-text-muted)]">No chats yet. Start a new one!</p>
            </div>
          )
        ) : (
          grouped.map(({ label, chats: groupChats }, gi) => (
            <div key={label}>
              {!isCollapsed && (
                <p className={`text-xs font-medium text-[var(--pr-text-subtle)] uppercase tracking-wider px-2 py-1.5 ${gi === 0 ? '' : 'mt-3'}`}>
                  {label}
                </p>
              )}
              <ul className="space-y-0.5">
                {groupChats.map((chat) => (
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
                          className="flex-1 bg-[var(--pr-surface)] border border-[var(--pr-border-strong)] rounded px-2 py-0.5 text-sm text-[var(--pr-text)] focus:outline-none focus:border-[var(--pr-accent)]"
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex items-center justify-between rounded-md border-l-2 transition-colors ${
                          chat.active
                            ? 'bg-[var(--pr-surface)] border-l-[var(--pr-accent)]'
                            : 'border-l-transparent hover:bg-[var(--pr-surface)]'
                        }`}
                      >
                        <Link
                          href={`/chat/${chat.id}`}
                          className={`flex items-center gap-2 px-2 py-2 flex-1 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}
                          title={chat.title}
                        >
                          <div className="min-w-[16px] flex justify-center">
                            <MessageSquare
                              className={`h-4 w-4 shrink-0 ${
                                chat.active
                                  ? 'text-[var(--pr-accent)]'
                                  : 'text-[var(--pr-text-muted)] group-hover:text-[var(--pr-text)]'
                              }`}
                            />
                          </div>
                          {!isCollapsed && (
                            <span
                              className={`truncate text-sm text-[var(--pr-text)] ${chat.active ? 'font-semibold' : 'font-medium'}`}
                            >
                              {chat.title}
                            </span>
                          )}
                        </Link>

                        {!isCollapsed && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-label="Chat actions"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 mr-1 text-[var(--pr-text-muted)] hover:text-[var(--pr-text)] hover:bg-[var(--pr-surface-elevated)] shrink-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[var(--pr-surface-elevated)] border-[var(--pr-border-strong)] text-[var(--pr-text)]"
                            >
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
            </div>
          ))
        )}
      </ScrollArea>

      {/* Activity Feed Section - only when expanded */}
      {!isCollapsed && (
        <div className="border-t border-[var(--pr-border)]">
          <details className="group">
            <summary className="px-3 py-2 text-xs font-medium text-[var(--pr-text-subtle)] cursor-pointer hover:text-[var(--pr-text)] flex items-center justify-between">
              <span>GitHub Activity</span>
              <span className="group-open:rotate-90 transition-transform">▶</span>
            </summary>
            <div className="px-2 pb-2">
              <GithubActivityFeed />
            </div>
          </details>
        </div>
      )}

      {/* User profile strip (pinned bottom) */}
      {isCollapsed ? (
        <div className="border-t border-[var(--pr-border)] p-3 flex justify-center">
          <Link href="/profile">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="bg-[var(--pr-surface-elevated)] text-[var(--pr-text)] text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      ) : (
        <div className="border-t border-[var(--pr-border)] p-3 flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-[var(--pr-surface-elevated)] text-[var(--pr-text)] text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--pr-text)] truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-[var(--pr-text-muted)] truncate">{user?.email}</p>
          </div>
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[var(--pr-text-muted)] hover:text-[var(--pr-text)] hover:bg-[var(--pr-surface-elevated)] shrink-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </aside>
  )
}
