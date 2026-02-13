
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserCard } from "@/components/profile/user-card"
import { PageHeader } from "@/components/page-header"
import { ChatLayoutShell } from "@/components/layout/ChatLayoutShell"

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <ChatLayoutShell user={user}>
        <div className="flex h-full bg-[#0d1117] text-white font-sans overflow-hidden relative">
            
            <main className="flex-1 overflow-auto relative">
                {/* Ambient Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#238636]/10 to-transparent pointer-events-none" />
                
                <div className="p-8 max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PageHeader 
                        title="Your Profile" 
                        description="Manage your connected GitHub identity"
                    />
                    
                    <div className="mt-8 flex justify-center">
                        <UserCard user={user} />
                    </div>
                </div>
            </main>
        </div>
    </ChatLayoutShell>
  )
}
