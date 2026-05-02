'use client'

import { Github, Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

interface HeaderProps {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  onMenuClick?: () => void
}

export function Header({ user: _user, onMenuClick }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: -4,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
  }, { scope: headerRef })

  return (
    <header
      ref={headerRef}
      className="h-14 bg-[var(--pr-bg)] backdrop-blur-sm border-b border-[var(--pr-border)] flex items-center justify-between px-4 lg:px-6"
    >
      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-3">
        <Button
          aria-label="Open navigation menu"
          variant="ghost"
          size="icon"
          className="lg:hidden text-[var(--pr-text-muted)] hover:text-[var(--pr-text)] hover:bg-[var(--pr-surface)]"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/chat" className="flex items-center gap-2">
          <Github className="h-5 w-5 text-[var(--pr-text)]" />
          <span className="hidden lg:inline text-sm font-semibold text-[var(--pr-text)]">
            GitInChat
          </span>
        </Link>
      </div>

      {/* Right: shortcut hint + bell + divider */}
      <div className="flex items-center gap-2">
        {/* Cmd+K shortcut badge */}
        <div className="hidden sm:flex items-center gap-1 text-[var(--pr-text-muted)]">
          <kbd className="inline-flex items-center px-1.5 py-0.5 text-xs border border-[var(--pr-border)] rounded font-mono leading-none">
            ⌘
          </kbd>
          <kbd className="inline-flex items-center px-1.5 py-0.5 text-xs border border-[var(--pr-border)] rounded font-mono leading-none">
            K
          </kbd>
        </div>

        {/* Notification bell — static, no pulse */}
        <Button
          aria-label="Notifications"
          variant="ghost"
          size="icon"
          className="text-[var(--pr-text-muted)] hover:text-[var(--pr-text)] hover:bg-[var(--pr-surface)]"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Thin vertical divider */}
        <div className="w-px h-5 bg-[var(--pr-border-strong)]" />
      </div>
    </header>
  )
}
