'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SimpleLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setIsLoading(true)
    localStorage.setItem('auth_token', 'mock_token_' + Date.now())
    localStorage.setItem('user', JSON.stringify({
      email: 'user@example.com',
      name: 'GitHub User',
      avatar: 'https://api.github.com/users/github/avatar',
    }))
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">GitHub Chat</h1>
          <p className="text-slate-400">AI-powered GitHub management</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
          >
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </Button>
          <p className="text-xs text-slate-500 text-center mt-4">
            Demo version - click to continue
          </p>
        </div>
      </div>
    </div>
  )
}
