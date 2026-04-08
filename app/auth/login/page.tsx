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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* GitHub mark */}
      <div className="mb-6">
        <Github className="w-12 h-12 text-foreground" />
      </div>

      <div className="w-full max-w-[340px]">
        <h1 className="text-2xl font-semibold text-foreground text-center mb-4">
          Sign in to GitInChat
        </h1>

        {/* Card */}
        <div className="bg-card border border-border rounded-md p-4">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 border border-white/10 shadow-sm flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <Github className="w-4 h-4 shrink-0" />
                Sign in with GitHub
              </>
            )}
          </Button>
        </div>

        {/* "New user?" card */}
        <div className="mt-4 border border-border rounded-md p-4 text-center text-sm">
          <span className="text-muted-foreground">New to GitInChat? </span>
          <Link href="/auth/signup" className="text-ring hover:underline">
            Create an account
          </Link>
          .
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-x-3">
          <a href="#" className="hover:text-ring hover:underline">Terms</a>
          <a href="#" className="hover:text-ring hover:underline">Privacy</a>
          <a href="#" className="hover:text-ring hover:underline">Docs</a>
          <a href="#" className="hover:text-ring hover:underline">Contact GitHub Support</a>
        </div>
      </div>
    </div>
  )
}
