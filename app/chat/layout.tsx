import React from "react"
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ChatLayoutShell } from '@/components/layout/ChatLayoutShell'

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <ChatLayoutShell user={user}>
      {children}
    </ChatLayoutShell>
  )
}
