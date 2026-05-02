'use client'

import { LucideIcon, MessageSquare, Sparkles, Search, GitBranch } from 'lucide-react'
import { useRef } from 'react'
import { gsap, useGSAP, SplitText, ScrambleTextPlugin, DrawSVGPlugin } from '@/lib/gsap'

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin, DrawSVGPlugin)

interface ChatEmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  onSuggest?: (prompt: string) => void
}

const SUGGESTED_PROMPTS = [
  { icon: Sparkles, label: 'Ask about your repos...', prompt: 'Summarize my top repositories and open risks' },
  { icon: Search, label: 'Search your codebase...', prompt: 'Find auth middleware and explain token validation flow' },
  { icon: GitBranch, label: 'Create a branch...', prompt: 'Create a branch for refactoring the chat input UX' },
]

export function ChatEmptyState({
  title = 'Start a conversation',
  description = 'Ask me anything about your GitHub repositories',
  icon: Icon = MessageSquare,
  onSuggest,
}: ChatEmptyStateProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    let splitTitle: SplitText | null = null
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo('.empty-logo-path', { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.8 })
      if (titleRef.current) {
        splitTitle = SplitText.create(titleRef.current, { type: 'words' })
        gsap.from(splitTitle.words, { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.4 })
      }
      if (subtitleRef.current) {
        gsap.to(subtitleRef.current, { duration: 1.2, scrambleText: { text: description, chars: "░▒▓█" } })
      }
      gsap.from('.suggest-chip', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.35, delay: 0.25 })
    })
    return () => {
      splitTitle?.revert()
      mm.revert()
    }
  }, { scope: rootRef })

  return (
    <div ref={rootRef} className="flex flex-col items-center justify-center h-full gap-8">
      <div className="text-center">
        <div className="w-16 h-16 glass rounded-lg flex items-center justify-center mx-auto mb-4 border border-[var(--pr-border)]">
          <svg className="w-9 h-9 text-[var(--pr-text-muted)]" viewBox="0 0 98 96" fill="none" aria-hidden="true">
            <path className="empty-logo-path" d="M49 1C22 1 1 22 1 49c0 22 14 40 34 47 2 0 3-1 3-3v-9c-14 3-17-6-17-6-2-5-5-7-5-7-4-3 0-3 0-3 4 0 6 4 6 4 4 6 10 5 12 4 0-3 1-5 2-6-11-1-22-5-22-24 0-5 2-9 4-12 0-1-2-6 1-12 0 0 4-1 13 4 4-1 8-2 12-2 4 0 8 1 12 2 9-5 13-4 13-4 3 6 1 11 1 12 2 3 4 7 4 12 0 19-11 23-22 24 1 1 3 4 3 9v13c0 2 1 3 3 3 20-7 34-25 34-47C97 22 76 1 49 1Z" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h3 ref={titleRef} className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p ref={subtitleRef} className="text-muted-foreground">{description}</p>
      </div>

      {onSuggest && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl px-4">
          {SUGGESTED_PROMPTS.map(({ icon: PromptIcon, label, prompt }) => (
            <button
              type="button"
              key={label}
              onClick={() => onSuggest(prompt)}
              className="suggest-chip flex items-center gap-2 px-4 py-3 rounded-lg border border-[var(--pr-border)] bg-white/[0.02] hover:border-[rgba(35,134,54,0.3)] hover:shadow-[0_0_20px_var(--pr-accent-glow)] text-sm text-left text-muted-foreground hover:text-foreground transition-all"
            >
              <PromptIcon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
