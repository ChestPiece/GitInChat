'use client'

import * as React from 'react'
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  MessageSquare,
  Plus,
  Github
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="bg-[#161b22] border-[#30363d]">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions" className="text-[#8b949e]">
          <CommandItem onSelect={() => runCommand(() => router.push('/chat'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Chat</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/chat'))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Chats</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator className="bg-[#30363d]" />
        <CommandGroup heading="Navigation" className="text-[#8b949e]">
          <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
         <CommandSeparator className="bg-[#30363d]" />
        <CommandGroup heading="Help" className="text-[#8b949e]">
          <CommandItem onSelect={() => runCommand(() => window.open('https://github.com', '_blank'))}>
            <Github className="mr-2 h-4 w-4" />
            <span>Open GitHub</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
