
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ChatLayoutShell } from "@/components/layout/ChatLayoutShell"
import { SettingsContent } from "./content"

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <ChatLayoutShell user={user}>
      <SettingsContent />
    </ChatLayoutShell>
  )
}
