'use client'

import Link from "next/link"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Github, Search, Database, GitBranch } from "lucide-react"
import { gsap, useGSAP, SplitText, ScrollTrigger, ScrollSmoother, ScrambleTextPlugin } from "@/lib/gsap"

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger, ScrollSmoother, ScrambleTextPlugin)

const features = [
  {
    icon: Search,
    title: "Repositories & Issues",
    description:
      "Open issues, review PRs, manage branches, and search repos — all by describing what you want in plain English.",
  },
  {
    icon: Database,
    title: "Codebase Search",
    description:
      "Ask questions about your code. The entire codebase is RAG-indexed so answers are accurate and cited.",
  },
  {
    icon: GitBranch,
    title: "Commit & Branch Ops",
    description:
      "Create branches, commit files, and push changes by describing the outcome. No CLI required.",
  },
]

const COMMANDS = [
  "create_repository name='finance-app' private=true",
  "search_issues query='auth bug' state='open'",
  "explain_file path='lib/auth.ts'",
  "create_branch name='feat/payments' from='main'",
]

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const terminalLineRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      // ScrollSmoother for buttery page scroll
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.4,
        effects: true,
      })

      // SplitText headline reveal
      if (headlineRef.current) {
        const split = SplitText.create(headlineRef.current, { type: "words" })
        gsap.from(split.words, {
          y: 32,
          autoAlpha: 0,
          duration: 0.65,
          stagger: 0.055,
          ease: "power3.out",
          delay: 0.1,
        })
      }

      // Subtitle + CTA buttons fade up
      gsap.from([".hero-subtitle", ".hero-cta"], {
        y: 18,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.45,
      })

      // Terminal panel fades in from the right
      gsap.from(".hero-terminal", {
        x: 24,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.3,
      })

      // Feature rows reveal on scroll
      gsap.from(".feature-row", {
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 78%",
        },
        y: 24,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })

      // CTA section fade in
      gsap.from(".cta-section", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 85%",
        },
        y: 16,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.out",
      })

      // ScrambleText terminal cycling
      if (terminalLineRef.current) {
        let i = 0
        const cycle = () => {
          gsap.to(terminalLineRef.current, {
            duration: 1.0,
            scrambleText: {
              text: COMMANDS[i % COMMANDS.length],
              chars: "abcdefghijklmnopqrstuvwxyz_='-",
              speed: 0.45,
            },
            onComplete: () => {
              i++
              gsap.delayedCall(2.2, cycle)
            },
          })
        }
        gsap.delayedCall(0.9, cycle)
      }
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      id="smooth-wrapper"
      className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-ring/30"
    >
      <div id="smooth-content">
        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 font-semibold text-[15px]">
              <Github className="w-5 h-5 text-foreground" />
              <span>GitInChat</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/auth/login" className="text-foreground font-medium hover:text-foreground/80 transition-colors">
                Sign in
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4 font-semibold border border-white/10"
                >
                  Sign up
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="max-w-7xl mx-auto px-6 pt-28 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left column */}
              <div>
                <h1
                  ref={headlineRef}
                  className="text-4xl md:text-5xl lg:text-[52px] font-semibold tracking-tight leading-[1.15] text-foreground"
                >
                  Your GitHub,{" "}
                  <span className="text-muted-foreground">managed in plain English.</span>
                </h1>

                <p className="hero-subtitle mt-5 text-[17px] text-muted-foreground leading-relaxed max-w-md">
                  Chat with an AI that reads your repos, opens issues, reviews PRs, and ships code
                  — all from one conversation.
                </p>

                <div className="hero-cta flex flex-col sm:flex-row gap-3 mt-8">
                  <Link href="/auth/login">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-6 border border-white/10 shadow-sm flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      Start with GitHub
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      variant="outline"
                      className="h-10 px-6 font-semibold border-border text-foreground hover:bg-accent"
                    >
                      See features
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right column — terminal mockup */}
              <div className="hero-terminal hidden lg:block">
                <div className="rounded-md border border-border bg-card shadow-lg overflow-hidden">
                  {/* Terminal title bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/40 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground font-mono">gitinchat</span>
                  </div>

                  {/* Terminal body */}
                  <div className="p-5 font-mono text-sm min-h-[200px] space-y-2">
                    <div>
                      <span className="text-ring">➜</span>{" "}
                      <span className="text-muted-foreground">~</span>{" "}
                      <span className="text-foreground">gitinchat</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      GitInChat Agent ready. What would you like to do?
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <span className="text-primary shrink-0">$</span>
                      <span className="text-foreground break-all">
                        <span ref={terminalLineRef} />
                        <span className="animate-pulse ml-0.5">▌</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature rows */}
          <section id="features" className="features-section border-t border-border">
            <div className="max-w-4xl mx-auto px-6 py-16">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Everything you need, nothing you don&apos;t.
              </h2>
              <p className="text-muted-foreground text-sm mb-10">
                25+ GitHub tools, all accessible in plain English.
              </p>

              <div className="divide-y divide-border">
                {features.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="feature-row flex gap-4 items-start py-6">
                    <div className="p-2 rounded-md bg-accent/60 text-muted-foreground shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-[15px]">{title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="cta-section border-t border-border">
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Ready to try it?</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Free during beta. Just connect your GitHub account.
              </p>
              <Link href="/auth/signup">
                <Button className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-10 border border-white/10 shadow-sm flex items-center gap-2 mx-auto">
                  <Github className="w-4 h-4" />
                  Get started for free
                </Button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
          <p>© 2024 GitInChat. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
