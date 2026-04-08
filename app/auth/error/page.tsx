'use client'

import { Button } from '@/components/ui/button'
import { Github, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* GitHub mark */}
      <div className="mb-6">
        <Github className="w-12 h-12 text-foreground" />
      </div>

      <div className="w-full max-w-[340px]">
        <h1 className="text-2xl font-semibold text-foreground text-center mb-4">
          Authentication error
        </h1>

        {/* Error card */}
        <div className="bg-card border border-border rounded-md p-4 space-y-4">
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/50 px-3 py-2 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              Something went wrong during authentication. Please try again.
            </p>
          </div>

          <Link href="/auth/login">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 border border-white/10 shadow-sm">
              Back to sign in
            </Button>
          </Link>
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
