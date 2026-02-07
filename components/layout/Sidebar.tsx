'use client'

import { Button } from '@/components/ui/button'
import { Plus, Book, Search } from 'lucide-react'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps {
  chats?: Array<{
    id: string
    title: string
    active?: boolean
  }>
  onNewChat?: () => void
  className?: string
}

export function Sidebar({ chats = [], onNewChat, className }: SidebarProps) {
  return (
    <aside className={`w-[296px] bg-[#0d1117] border-r border-[#30363d] flex flex-col pt-4 hidden lg:flex h-full ${className}`}>
      {/* Top Section */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#c9d1d9]">Top repositories</h2>
          <Button 
            onClick={onNewChat}
            size="sm" 
            className="bg-[#238636] hover:bg-[#2ea043] text-white hover:text-white h-7 px-2 text-xs font-semibold gap-1 flex items-center border border-[rgba(240,246,252,0.1)] rounded-md shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-white" />
            New
          </Button>
        </div>
        
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Find a repository..." 
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1 px-3 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-4">
        <ul className="space-y-1">
          {chats.map((chat) => (
            <li key={chat.id}>
              <Link 
                href={`/chat/${chat.id}`}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm group ${
                  chat.active 
                    ? 'bg-[#1f2428] text-[#c9d1d9]' 
                    : 'text-[#c9d1d9] hover:bg-[#161b22] hover:text-[#58a6ff] hover:underline'
                }`}
              >
                <div className="min-w-[16px] flex justify-center">
                   <Book className={`h-4 w-4 ${chat.active ? 'text-[#c9d1d9]' : 'text-[#8b949e] group-hover:text-[#c9d1d9]'}`} />
                </div>
                <span className={`truncate font-medium ${chat.active ? 'font-semibold' : ''}`}>
                  {/* Simulate user/repo format */}
                  {chat.title.includes('/') ? chat.title : `owner/${chat.title}`}
                </span>
              </Link>
            </li>
          ))}
          
          {/* Mock data if empty for visualization */}
          {chats.length === 0 && (
            <>
              {['moeez/v0-git-hub-chat', 'moeez/next-js-app', 'vercel/next.js', 'facebook/react', 'shadcn/ui', 'openai/gpt-4'].map((repo) => (
                <li key={repo}>
                  <Link 
                    href="#"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm group text-[#c9d1d9] hover:bg-[#161b22] hover:text-[#58a6ff] hover:underline"
                  >
                    <div className="min-w-[16px] flex justify-center">
                       <Book className="h-4 w-4 text-[#8b949e] group-hover:text-[#c9d1d9]" />
                    </div>
                    <span className="truncate font-medium hover:text-[#58a6ff]">
                      {repo}
                    </span>
                  </Link>
                </li>
              ))}
              <div className="pt-2">
                 <button className="text-xs text-[#8b949e] hover:text-[#58a6ff] pl-8">Show more</button>
              </div>
            </>
          )}
        </ul>
        
        <div className="mt-6 pt-4 border-t border-[#30363d]">
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-2">Recent activity</h3>
           <div className="border border-[#30363d] rounded-md p-4 bg-[#0d1117] mb-2">
             <p className="text-xs text-[#8b949e] mb-1">When you have activity, it will show up here.</p>
           </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
