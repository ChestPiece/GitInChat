'use client'

import { Header } from '@/components/layout/Header'
import { getUser } from '@/lib/auth'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getUser().then(setUser)
  }, [])

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <Header user={user} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
          <p className="text-[#8b949e]">This is a placeholder for the settings page.</p>
        </div>
      </div>
    </div>
  )
}
