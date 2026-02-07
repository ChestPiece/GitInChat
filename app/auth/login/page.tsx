'use client'

import { useState } from 'react'
import { signInWithGithub } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGithub()
    } catch (err) {
      console.error('Sign in error:', err)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-6">
        <Github className="w-12 h-12 text-white" />
      </div>

      <div className="w-full max-w-[340px]">
        <h1 className="text-2xl font-light text-white text-center mb-4">Sign in to GitHub Chat</h1>
        
        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4">
          {error && (
             <div className="mb-4 bg-red-900/10 border border-red-500/50 text-red-200 px-3 py-2 rounded-md text-sm">
               {error}
             </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-semibold h-9 border border-[rgba(240,246,252,0.1)] shadow-sm"
            >
              {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
            </Button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-4 border border-[#30363d] rounded-md p-4 text-center text-sm">
          <span className="text-[#c9d1d9]">New to GitHub Chat? </span>
          <Link href="/auth/signup" className="text-[#58a6ff] hover:underline hover:text-[#58a6ff]">
            Create an account
          </Link>
          .
        </div>
        
        <div className="mt-8 text-center text-xs text-[#8b949e] space-x-3">
           <a href="#" className="hover:text-[#58a6ff] hover:underline">Terms</a>
           <a href="#" className="hover:text-[#58a6ff] hover:underline">Privacy</a>
           <a href="#" className="hover:text-[#58a6ff] hover:underline">Docs</a>
           <a href="#" className="hover:text-[#58a6ff] hover:underline">Contact GitHub Support</a>
        </div>
      </div>
    </div>
  )
}
