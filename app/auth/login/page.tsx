'use client'

import { useState } from 'react'
import { useRef } from 'react'
import { signInWithGithub } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { gsap, useGSAP, DrawSVGPlugin } from '@/lib/gsap'

gsap.registerPlugin(useGSAP, DrawSVGPlugin)

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGithub()
    } catch (err) {
      console.error('Sign in error:', err)
      setIsLoading(false)
    }
  }

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      gsap.set('.login-orb', { autoAlpha: 0, scale: 0.9 })
      gsap.set('.login-card', { autoAlpha: 0, y: 30 })
      gsap.set('.login-form-item', { autoAlpha: 0, y: 12 })
      gsap.set('.login-logo-path', { drawSVG: '0% 0%' })

      tl.to('.login-orb', { autoAlpha: 1, scale: 1, duration: 0.8, stagger: 0.08 }, 0)
        .to('.login-logo-path', { drawSVG: '0% 100%', duration: 0.8, ease: 'power1.inOut' }, 0.2)
        .to('.login-card', { y: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.4)' }, 0.5)
        .to('.login-form-item', { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.08 }, 0.7)
    })
    return () => mm.revert()
  }, { scope: rootRef })

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[var(--pr-bg)] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="login-orb pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[rgba(16,185,129,0.22)] blur-[120px]" />
      <div className="login-orb pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[rgba(99,102,241,0.2)] blur-[120px]" />
      <div className="login-orb pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(139,92,246,0.14)] blur-[120px]" />

      <div className="mb-6 login-form-item">
        <svg className="h-12 w-12 text-[var(--pr-text)]" viewBox="0 0 98 96" fill="none" aria-hidden="true">
          <path className="login-logo-path" d="M49 1C22 1 1 22 1 49c0 22 14 40 34 47 2 0 3-1 3-3v-9c-14 3-17-6-17-6-2-5-5-7-5-7-4-3 0-3 0-3 4 0 6 4 6 4 4 6 10 5 12 4 0-3 1-5 2-6-11-1-22-5-22-24 0-5 2-9 4-12 0-1-2-6 1-12 0 0 4-1 13 4 4-1 8-2 12-2 4 0 8 1 12 2 9-5 13-4 13-4 3 6 1 11 1 12 2 3 4 7 4 12 0 19-11 23-22 24 1 1 3 4 3 9v13c0 2 1 3 3 3 20-7 34-25 34-47C97 22 76 1 49 1Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="w-full max-w-[340px] relative z-10">
        <h1 className="login-form-item text-2xl font-semibold text-[var(--pr-text)] text-center mb-4">
          Sign in to GitInChat
        </h1>

        <div className="login-card bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-[0_25px_50px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="login-form-item w-full bg-[var(--pr-accent)] hover:bg-[var(--pr-accent-hover)] text-white font-semibold h-9 border border-white/10 shadow-sm flex items-center gap-2 hover:shadow-[0_0_20px_var(--pr-accent-glow)]"
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

        <div className="login-form-item mt-4 border border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-xl p-4 text-center text-sm">
          <span className="text-[var(--pr-text-muted)]">New to GitInChat? </span>
          <Link href="/auth/signup" className="text-[var(--pr-secondary)] hover:underline">
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
