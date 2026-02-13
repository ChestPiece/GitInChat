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

  const handleSetStatus = () => {
    toast({
      description: "Status updated successfully",
      duration: 2000,
      className: "bg-[#1f6feb] text-white border-none"
    })
  }

  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-[#c9d1d9] hover:bg-[#1f2428] hover:text-white" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/chat" className="flex items-center gap-2 text-white font-semibold">
          <Github className="h-8 w-8 text-white" />
          <span className="hidden lg:inline text-sm font-bold ml-2">GitHub Chat</span>
        </Link>
        
        {/* Search Bar - Visual only for now */}
        

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {/* Main Navigation removed for chat focus */}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Create New Dropdown */}
        {/* Create New Dropdown - Removed for Chat focus */}

        <Button variant="ghost" size="icon" className="text-[#c9d1d9] hover:text-white hover:bg-transparent relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#1f6feb] rounded-full border-2 border-[#161b22]"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 hover:bg-[#1f2428] rounded-full pr-3 pl-1 py-1 transition-colors cursor-pointer border border-transparent hover:border-[#30363d]">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="bg-[#238636] text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-sm font-medium text-white max-w-[100px] truncate">
                {user?.name}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#161b22] border-[#30363d] text-[#c9d1d9] mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none text-[#8b949e]">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#30363d]" />
            <DropdownMenuItem 
              onClick={handleSetStatus}
              className="focus:bg-[#1f6feb] focus:text-white cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <span>Set status</span>
                <span className="text-xs text-[#8b949e] group-focus:text-white">⌘E</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#30363d]" />
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
            <DropdownMenuSeparator className="bg-[#30363d]" />
            <DropdownMenuItem 
              className="focus:bg-[#1f6feb] focus:text-white cursor-pointer text-red-400 hover:text-white hover:bg-red-600 focus:bg-red-600"
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
