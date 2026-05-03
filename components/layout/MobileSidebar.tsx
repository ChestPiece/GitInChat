'use client'

import { Sidebar } from './Sidebar'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  chats?: any[]
  onNewChat?: () => void
}

export function MobileSidebar({ isOpen, onClose, chats, onNewChat }: MobileSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar Container */}
      <div className="absolute inset-y-0 left-0 w-[296px] bg-[var(--pr-bg)] shadow-xl border-r border-[var(--pr-border)] animate-in slide-in-from-left duration-200">
        <div className="absolute top-2 right-2 z-50 md:hidden">
           <Button
             variant="ghost"
             size="icon"
             onClick={onClose}
             className="text-[var(--pr-text-muted)] hover:text-[var(--pr-text)] hover:bg-[var(--pr-surface-elevated)]"
           >
             <X className="w-5 h-5" />
           </Button>
        </div>
        <Sidebar chats={chats} onNewChat={onNewChat} className="flex w-full border-none pt-12 md:pt-4" />
      </div>
    </div>
  )
}
