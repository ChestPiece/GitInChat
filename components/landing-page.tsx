'use client'

import Link from "next/link"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Search, Database, GitBranch } from "lucide-react"
import { gsap, useGSAP, SplitText, ScrollTrigger, ScrollSmoother, ScrambleTextPlugin, DrawSVGPlugin, Physics2DPlugin } from "@/lib/gsap"

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger, ScrollSmoother, ScrambleTextPlugin, DrawSVGPlugin, Physics2DPlugin)

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
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const terminalLineRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      let smoother: ScrollSmoother | null = null
      const delayedCalls: gsap.core.Tween[] = []
      let splitHeadline: SplitText | null = null

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 2.2,
          effects: true,
          smoothTouch: 0.1,
        })
        const intro = gsap.timeline()
        intro
          .from(".hero-grid", { autoAlpha: 0, scale: 1.04, duration: 0.6 }, 0)
          .from(".hero-badge", { x: -20, autoAlpha: 0, ease: "back.out(1.7)", duration: 0.5 }, 0.1)
          .from(".hero-terminal", { x: 60, autoAlpha: 0, ease: "power3.out", duration: 0.7 }, 0.4)
          .from(".hero-terminal-line", { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.4 }, 0.7)
          .from(".hero-cta", { y: 24, autoAlpha: 0, stagger: 0.1, ease: "back.out(2)", duration: 0.5 }, 1)

        if (headlineRef.current) {
          splitHeadline = SplitText.create(headlineRef.current, { type: "chars" })
          intro.from(splitHeadline.chars, {
            y: 60,
            autoAlpha: 0,
            rotationX: 15,
            duration: 0.7,
            stagger: 0.018,
            ease: "power4.out",
          }, 0.2)
        }

        if (subtitleRef.current) {
          gsap.to(subtitleRef.current, {
            duration: 1.2,
            scrambleText: { text: subtitleRef.current.textContent || "", chars: "░▒▓█" },
            delay: 0.8,
          })
        }

        gsap.to(".cta-btn", {
          boxShadow: "0 0 40px var(--gh-green-glow)",
          repeat: -1,
          yoyo: true,
          duration: 2,
        })

        const glow = containerRef.current?.querySelector("#cursor-glow")
        const onMove = (event: MouseEvent) => {
          if (!glow) return
          gsap.to(glow, { x: event.clientX, y: event.clientY, duration: 0.6, ease: "power2.out" })
        }
        document.addEventListener("mousemove", onMove)

        containerRef.current?.querySelectorAll(".particle").forEach((particle) => {
          gsap.set(particle, { autoAlpha: 1, x: 0, y: 0 })
          gsap.to(particle, {
            physics2D: {
              velocity: gsap.utils.random(80, 220),
              angle: gsap.utils.random(-120, -60),
              gravity: 400,
            },
            autoAlpha: 0,
            duration: 1.5,
            delay: 0.3,
          })
        })

        gsap.from(".cta-title-word", {
          scrollTrigger: { trigger: ".cta-section", start: "top 85%" },
          y: 80,
          rotationX: -20,
          autoAlpha: 0,
          stagger: 0.06,
          ease: "expo.out",
        })

        const iconPaths = gsap.utils.toArray(".feature-card svg path")
        if (iconPaths.length > 0) {
          gsap.set(iconPaths, { drawSVG: "0% 0%" })
        }
        ScrollTrigger.batch(".feature-card", {
          interval: 0.1,
          batchMax: 3,
          onEnter: (batch) => {
            gsap.from(batch, { y: 40, autoAlpha: 0, rotationX: 8, stagger: 0.1, duration: 0.5 })
          },
        })

        gsap.fromTo(".logo-path", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.8, delay: 0.1 })

        return () => {
          document.removeEventListener("mousemove", onMove)
        }
      })

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
              delayedCalls.push(gsap.delayedCall(2.2, cycle))
            },
          })
        }
        delayedCalls.push(gsap.delayedCall(0.9, cycle))
      }

      return () => {
        delayedCalls.forEach((call) => call.kill())
        splitHeadline?.revert()
        mm.revert()
        smoother?.kill()
      }
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      id="smooth-wrapper"
      className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-text)] flex flex-col font-sans selection:bg-ring/30"
    >
      <div id="cursor-glow" />
      <div id="smooth-content">
        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]/75 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 font-semibold text-[15px]">
              <svg className="w-5 h-5" viewBox="0 0 98 96" fill="none" aria-hidden="true">
                <path className="logo-path" d="M49 1C22 1 1 22 1 49c0 22 14 40 34 47 2 0 3-1 3-3v-9c-14 3-17-6-17-6-2-5-5-7-5-7-4-3 0-3 0-3 4 0 6 4 6 4 4 6 10 5 12 4 0-3 1-5 2-6-11-1-22-5-22-24 0-5 2-9 4-12 0-1-2-6 1-12 0 0 4-1 13 4 4-1 8-2 12-2 4 0 8 1 12 2 9-5 13-4 13-4 3 6 1 11 1 12 2 3 4 7 4 12 0 19-11 23-22 24 1 1 3 4 3 9v13c0 2 1 3 3 3 20-7 34-25 34-47C97 22 76 1 49 1Z" stroke="currentColor" strokeWidth="2" />
              </svg>
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
                      className="cta-btn bg-[var(--gh-green)] hover:bg-[var(--gh-green-hover)] text-white h-8 px-4 font-semibold border border-white/10"
                      size="sm"
                    >
                      Sign up
                    </Button>
                  </Link>
                </nav>
              </div>
            </header>

        <main className="flex-1">
          <section className="max-w-7xl mx-auto px-6 pt-28 pb-20 relative">
            <div className="hero-grid absolute inset-0 bg-dot-grid pointer-events-none" data-speed="0.95" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative">
              <div>
                <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--gh-green)]/40 bg-[var(--gh-green)]/10 mb-5" data-speed="1.1">
                  <span className="w-2 h-2 rounded-full bg-[var(--gh-green)] animate-dot-pulse" />
                  <span className="text-xs text-[var(--gh-text)]">Now in Beta</span>
                </div>
                <h1
                  ref={headlineRef}
                  className="font-display text-[clamp(3rem,6vw,5rem)] font-extrabold tracking-tight leading-[1.05]"
                >
                  Your GitHub, <span className="text-[var(--gh-text-muted)]">managed in plain English.</span>
                </h1>
                <p ref={subtitleRef} className="hero-subtitle mt-5 text-[17px] text-[var(--gh-text-muted)] leading-relaxed max-w-md">
                  Chat with an AI that reads your repos, opens issues, reviews PRs, and ships code all from one conversation.
                </p>
                <div className="hero-cta flex flex-col sm:flex-row gap-3 mt-8">
                  <Link href="/auth/login">
                    <Button className="cta-btn bg-[var(--gh-green)] hover:bg-[var(--gh-green-hover)] text-white font-semibold h-10 px-6 border border-white/10 shadow-sm">
                      Start with GitHub
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" className="h-10 px-6 font-semibold border-[var(--gh-border)] text-[var(--gh-text)] hover:bg-[var(--gh-subtle)]">
                      See features
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hero-terminal hidden lg:block" data-speed="0.85">
                <div className="glass-card rounded-xl overflow-hidden shadow-[0_0_60px_rgba(35,134,54,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="hero-terminal-line flex items-center gap-2 px-4 py-2.5 bg-[var(--gh-overlay)] border-b border-[var(--gh-border)]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                    </div>
                    <span className="ml-2 text-xs text-[var(--gh-text-muted)] font-mono">gitinchat</span>
                  </div>
                  <div className="hero-terminal-line p-5 font-mono text-sm min-h-[200px] space-y-2">
                    <div><span className="text-[var(--gh-blue)]">➜</span> <span className="text-[var(--gh-text-muted)]">~</span> <span>gitinchat</span></div>
                    <div className="text-[var(--gh-text-muted)] text-xs">GitInChat Agent ready. What would you like to do?</div>
                    <div className="mt-3 flex items-start gap-2">
                      <span className="text-[var(--gh-green)] shrink-0">$</span>
                      <span className="break-all"><span ref={terminalLineRef} /><span className="animate-pulse ml-0.5">▌</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-20 pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="particle absolute w-[2px] h-[2px] rounded-full bg-[var(--gh-green)]" />
              ))}
            </div>
          </section>

          <section id="features" className="features-section border-t border-[var(--gh-border)]">
            <div className="max-w-4xl mx-auto px-6 py-16">
              <h2 className="text-2xl font-semibold mb-2">Everything you need, nothing you don&apos;t.</h2>
              <p className="text-[var(--gh-text-muted)] text-sm mb-10">25+ GitHub tools, all accessible in plain English.</p>
              <div className="grid grid-cols-1 gap-4">
                {features.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="feature-card glass-card rounded-xl p-5 hover:border-[rgba(35,134,54,0.3)] hover:shadow-[0_0_30px_var(--gh-green-glow)] transition-all">
                    <div className="flex gap-4 items-start">
                      <div className="p-2 rounded-md bg-white/[0.02] text-[var(--gh-text-muted)] shrink-0"><Icon className="w-4 h-4" /></div>
                      <div>
                        <h3 className="font-semibold text-[15px]">{title}</h3>
                        <p className="text-[var(--gh-text-muted)] text-sm mt-1 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="cta-section border-t border-[var(--gh-border)]">
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
              <h2 className="text-2xl font-semibold"><span className="cta-title-word inline-block mr-2">Ready</span><span className="cta-title-word inline-block mr-2">to</span><span className="cta-title-word inline-block">try it?</span></h2>
              <p className="text-[var(--gh-text-muted)] text-sm mt-2">Free during beta. Just connect your GitHub account.</p>
              <Link href="/auth/signup">
                <Button className="cta-btn mt-8 bg-[var(--gh-green)] hover:bg-[var(--gh-green-hover)] text-white font-semibold h-11 px-10 border border-white/10 shadow-sm mx-auto">
                  Get started for free
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-[var(--gh-border)] py-8 px-6 text-center text-xs text-[var(--gh-text-muted)] relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--gh-green)] to-[var(--gh-blue)]" />
          <p>© 2024 GitInChat. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
