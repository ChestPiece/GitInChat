'use client'

import { Github, Bell, Plus, Menu, LogOut, User, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { signOut } from '@/lib/auth'
import { useToast } from '@/components/ui/use-toast'
import { gsap, useGSAP } from '@/lib/gsap'
import { useRef } from 'react'

interface HeaderProps {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const { toast } = useToast()
  const headerRef = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.to('.notif-dot', { scale: 1.4, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut" })
  }, { scope: headerRef })

  const handleSetStatus = () => {
    toast({
      description: "Status updated successfully",
      duration: 2000,
      className: "bg-[var(--gh-blue)] text-white border-none"
    })
  }

  return (
    <header ref={headerRef} className="h-16 bg-[var(--gh-canvas)]/90 backdrop-blur-md border-b border-transparent flex items-center justify-between px-4 lg:px-6" style={{ borderImage: 'linear-gradient(90deg, transparent 0%, #30363d 20%, #30363d 80%, transparent 100%) 1' }}>
      <div className="flex items-center gap-4">
        <Button aria-label="Open navigation menu" variant="ghost" size="icon" className="lg:hidden text-[var(--gh-text)] hover:bg-[var(--gh-overlay)] hover:text-white" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/chat" className="flex items-center gap-2 text-white font-semibold">
          <Github className="h-8 w-8 text-white" />
          <span className="hidden lg:inline text-sm font-bold ml-2">GitHub Chat</span><span className="hidden lg:inline-flex h-2 w-2 rounded-full bg-[var(--gh-green)] shadow-[0_0_8px_var(--gh-green-glow)]" />
        </Link>
        
        {/* Search Bar - Visual only for now */}
        

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {/* Main Navigation removed for chat focus */}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Create New Dropdown */}
        {/* Create New Dropdown - Removed for Chat focus */}

        <Button aria-label="Notifications" variant="ghost" size="icon" className="text-[var(--gh-text)] hover:text-white hover:bg-transparent relative">
          <Bell className="h-5 w-5" />
          <span className="notif-dot absolute top-2 right-2 w-2 h-2 bg-[var(--gh-blue)] rounded-full border-2 border-[var(--gh-canvas)]"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Open user menu" className="flex items-center gap-2 hover:bg-[var(--gh-overlay)] rounded-full pr-3 pl-1 py-1 transition-all cursor-pointer border border-transparent hover:border-[var(--gh-border)] hover:ring-2 hover:ring-[var(--gh-green)]/40">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="bg-[var(--gh-green)] text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-sm font-medium text-[var(--gh-text)] max-w-[100px] truncate">
                {user?.name}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[var(--gh-subtle)] border-[var(--gh-border)] text-[var(--gh-text)] mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none text-[var(--gh-text-muted)]">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--gh-border)]" />
            <DropdownMenuItem 
              onClick={handleSetStatus}
              className="focus:bg-[#1f6feb] focus:text-white cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <span>Set status</span>
                <span className="text-xs text-[var(--gh-text-muted)] group-focus:text-white">⌘E</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--gh-border)]" />
            <DropdownMenuItem asChild className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                Your profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              <Link href="/settings" className="flex items-center w-full">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--gh-border)]" />
            <DropdownMenuItem 
              className="focus:text-white cursor-pointer text-red-400 hover:text-white hover:bg-red-600 focus:bg-red-600"
              onClick={() => signOut()}
            >
               <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
