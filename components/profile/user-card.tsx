'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Github } from "lucide-react"

interface UserCardProps {
  user: {
    name: string
    email: string
    avatar?: string
    id: string
  }
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto bg-[var(--pr-surface)] border-[var(--pr-border-strong)] text-[var(--pr-text)] shadow-xl">
      <CardHeader className="flex flex-col items-center pb-2">
        <div className="relative mb-4">
            <Avatar className="h-32 w-32 border-4 border-[var(--pr-border-strong)] shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-4xl bg-[var(--pr-bg)] text-[var(--pr-text)]">
                {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-[var(--pr-accent)] border-4 border-[var(--pr-surface)]" title="Connected"></div>
        </div>

        <h2 className="text-2xl font-bold text-[var(--pr-text)] tracking-tight text-center">{user.name}</h2>
        <p className="text-[var(--pr-text-muted)] text-sm text-center font-mono">{user.email}</p>

        <div className="mt-4 flex items-center gap-2">
             <Badge variant="outline" className="border-[var(--pr-border-strong)] text-[var(--pr-text-muted)] bg-[var(--pr-bg)] gap-1 px-3 py-1">
                <Github className="w-3.5 h-3.5" />
                <span>Connected to GitHub</span>
             </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-center pb-8">
           <div className="mt-6 pt-6 border-t border-[var(--pr-border)] flex justify-between text-sm px-4">
               <div className="flex flex-col">
                   <span className="text-[var(--pr-text-muted)] text-xs uppercase tracking-wider mb-1">Account ID</span>
                   <span className="font-mono text-[var(--pr-text)] truncate max-w-[120px]">{user.id.slice(0, 8)}...</span>
               </div>
               <div className="flex flex-col">
                   <span className="text-[var(--pr-text-muted)] text-xs uppercase tracking-wider mb-1">Status</span>
                   <span className="text-[var(--pr-accent)] font-medium">Active</span>
               </div>
           </div>
      </CardContent>
    </Card>
  )
}
