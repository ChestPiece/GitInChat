'use client'

import { Github, Bell, Plus, Menu } from 'lucide-react'
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

interface HeaderProps {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-[#c9d1d9] hover:bg-[#1f2428] hover:text-white" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/chat" className="flex items-center gap-2 text-white font-semibold">
          <Github className="h-8 w-8 text-white" />
          <span className="hidden lg:inline text-sm font-bold ml-2">GitHub Manager</span>
        </Link>
        
        {/* Search Bar - Visual only for now */}
        

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {['Pull requests', 'Issues', 'Codespaces', 'Marketplace', 'Explore'].map((item) => (
            <Link 
              key={item} 
              href="#" 
              className="text-[#c9d1d9] hover:text-white text-sm font-semibold px-2 py-1 rounded-md hover:bg-[#1f2428] transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Create New Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-[#c9d1d9] hover:bg-[#1f2428] hover:text-white border border-[#30363d] rounded-md px-2 h-8">
              <Plus className="h-4 w-4" />
              <span className="ml-1"></span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#161b22] border-[#30363d] text-[#c9d1d9]">
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              New repository
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Import repository
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              New codespace
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              New gist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-[#c9d1d9] hover:text-white hover:bg-transparent relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#1f6feb] rounded-full border-2 border-[#161b22]"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-1 ring-2 ring-transparent bg-transparent p-0 overflow-hidden hover:ring-[#30363d]">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="bg-[#238636] text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#161b22] border-[#30363d] text-[#c9d1d9] mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none text-[#8b949e]">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#30363d]" />
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer group">
              <div className="flex items-center justify-between w-full">
                <span>Set status</span>
                <span className="text-xs text-[#8b949e] group-focus:text-white">⌘E</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#30363d]" />
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Your profile
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Your repositories
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Your organizations
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Your projects
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Your stars
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#30363d]" />
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Upgrade
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Feature preview
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#30363d]" />
            <DropdownMenuItem className="focus:bg-[#1f6feb] focus:text-white cursor-pointer">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
