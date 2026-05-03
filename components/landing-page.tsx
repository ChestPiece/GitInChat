"use client";

import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  GitBranch,
  Play,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
} from "lucide-react";
import {
  DrawSVGPlugin,
  Physics2DPlugin,
  ScrambleTextPlugin,
  ScrollSmoother,
  ScrollTrigger,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/gsap";

const COMMANDS = [
  "search_issues query='critical auth bug' state='open'",
  "create_branch name='fix/auth-timeout' from='main'",
  "create_pull_request title='Fix token timeout edge case'",
  "index_repository repo='gitinchat/web' branch='main'",
];

const FEATURE_TILES = [
  {
    title: "Natural-language GitHub control",
    body: "Branches, PR reviews, issues, and releases from one chat.",
    icon: Workflow,
    className: "md:col-span-2",
  },
  {
    title: "Grounded code answers",
    body: "RAG-indexed repos with cited responses for higher trust.",
    icon: Search,
    className: "md:col-span-1",
  },
  {
    title: "Safe automation rails",
    body: "Guarded commands reduce risky operations and accidental pushes.",
    icon: ShieldCheck,
    className: "md:col-span-1",
  },
  {
    title: "End-to-end shipping",
    body: "From idea to PR in one workflow with auditable tool calls.",
    icon: Rocket,
    className: "md:col-span-2",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Connect GitHub",
    body: "OAuth in seconds. Repos and permissions stay scoped to your account.",
    icon: GitBranch,
  },
  {
    title: "Ask in plain English",
    body: "Describe outcome, not command syntax. Agent selects right tools.",
    icon: Sparkles,
  },
  {
    title: "Review and ship",
    body: "See actions, inspect diffs, then land changes with confidence.",
    icon: CheckCircle2,
  },
];

const TRUST_ITEMS = [
  "Backed by Supabase Auth",
  "Live webhook events",
  "RAG-scoped per user",
  "25+ GitHub tools",
];

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const terminalLineRef = useRef<HTMLSpanElement>(null);
  const terminalCardRef = useRef<HTMLDivElement>(null);
  const commandButtonRef = useRef<HTMLButtonElement>(null);
  const commandBurstRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const delayedCalls: gsap.core.Tween[] = [];
      let splitHeadline: SplitText | null = null;
      let splitFinalCta: SplitText | null = null;
      let smoother: ScrollSmoother | null = null;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 2.2,
          effects: true,
          smoothTouch: 0.1,
        });

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero-grid", { autoAlpha: 0, scale: 1.04, duration: 0.6 }, 0)
          .from(
            ".hero-badge",
            { x: -20, autoAlpha: 0, duration: 0.45, ease: "back.out(1.7)" },
            0.1,
          )
          .from(
            ".hero-cta",
            { y: 22, autoAlpha: 0, stagger: 0.08, duration: 0.5 },
            0.95,
          )
          .from(
            ".hero-terminal",
            { y: 40, autoAlpha: 0, duration: 0.7, ease: "power3.out" },
            0.55,
          )
          .from(
            ".hero-terminal-line",
            { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.35 },
            0.75,
          )
          .from(
            ".trust-chip",
            { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.35 },
            1.05,
          );

        if (headlineRef.current) {
          splitHeadline = SplitText.create(headlineRef.current, {
            type: "chars",
          });
          intro.from(
            splitHeadline.chars,
            {
              y: 60,
              autoAlpha: 0,
              rotationX: 15,
              duration: 0.7,
              stagger: 0.018,
              ease: "power4.out",
            },
            0.2,
          );
        }

        if (subtitleRef.current) {
          gsap.to(subtitleRef.current, {
            duration: 1.15,
            delay: 0.8,
            scrambleText: {
              text: subtitleRef.current.textContent || "",
              chars: "░▒▓█",
            },
          });
        }

        gsap.fromTo(
          ".logo-path",
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.8, delay: 0.1 },
        );
        gsap.to(".cta-btn", {
          boxShadow: "0 0 34px var(--pr-accent-glow)",
          duration: 1.8,
          repeat: -1,
          yoyo: true,
        });

        // Hero badge float
        gsap.to(".hero-badge", {
          y: -5,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.2,
        });

        // Terminal card 3D tilt on mousemove
        const card = terminalCardRef.current;
        let cleanupTilt: (() => void) | undefined;
        if (card) {
          const onTiltMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = ((e.clientY - cy) / rect.height) * -10;
            const ry = ((e.clientX - cx) / rect.width) * 12;
            gsap.to(card, {
              rotationX: rx,
              rotationY: ry,
              duration: 0.5,
              ease: "power2.out",
              transformPerspective: 900,
            });
          };
          const onTiltLeave = () => {
            gsap.to(card, {
              rotationX: 0,
              rotationY: 0,
              duration: 0.7,
              ease: "elastic.out(1, 0.4)",
              transformPerspective: 900,
            });
          };
          card.addEventListener("mousemove", onTiltMove);
          card.addEventListener("mouseleave", onTiltLeave);
          cleanupTilt = () => {
            card.removeEventListener("mousemove", onTiltMove);
            card.removeEventListener("mouseleave", onTiltLeave);
          };
        }

        ScrollTrigger.batch(".reveal-card", {
          interval: 0.1,
          batchMax: 3,
          onEnter: (batch) => {
            gsap.from(batch, {
              y: 40,
              autoAlpha: 0,
              rotationX: 8,
              stagger: 0.08,
              duration: 0.45,
            });
          },
        });

        gsap.from(".workflow-step", {
          scrollTrigger: { trigger: ".workflow-grid", start: "top 82%" },
          y: 36,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.45,
        });

        let cleanupCommand: (() => void) | undefined;
        if (commandButtonRef.current) {
          const onCommandHover = () => {
            const burstParticles =
              commandBurstRef.current?.querySelectorAll<HTMLElement>(
                ".burst-particle",
              );
            if (!burstParticles || burstParticles.length === 0) return;
            burstParticles.forEach((particle) => {
              gsap.set(particle, { x: 0, y: 0, autoAlpha: 1 });
              gsap.to(particle, {
                duration: gsap.utils.random(0.55, 1.1),
                physics2D: {
                  velocity: gsap.utils.random(85, 180),
                  angle: gsap.utils.random(-145, -35),
                  gravity: 380,
                },
                autoAlpha: 0,
              });
            });
          };
          commandButtonRef.current.addEventListener(
            "mouseenter",
            onCommandHover,
          );
          commandButtonRef.current.addEventListener("focus", onCommandHover);
          delayedCalls.push(gsap.delayedCall(0.9, onCommandHover));
          cleanupCommand = () => {
            commandButtonRef.current?.removeEventListener(
              "mouseenter",
              onCommandHover,
            );
            commandButtonRef.current?.removeEventListener(
              "focus",
              onCommandHover,
            );
          };
        }

        return () => {
          cleanupTilt?.();
          cleanupCommand?.();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".reveal-card, .workflow-step", {
          autoAlpha: 1,
          clearProps: "all",
        });
      });

      if (terminalLineRef.current) {
        let i = 0;
        const cycle = () => {
          gsap.to(terminalLineRef.current, {
            duration: 1,
            scrambleText: {
              text: COMMANDS[i % COMMANDS.length],
              chars: "abcdefghijklmnopqrstuvwxyz_='-",
              speed: 0.45,
            },
            onComplete: () => {
              i += 1;
              delayedCalls.push(gsap.delayedCall(2.1, cycle));
            },
          });
        };
        delayedCalls.push(gsap.delayedCall(0.8, cycle));
      }

      const glowNode =
        rootRef.current?.querySelector<HTMLElement>("#cursor-glow");
      const onMove = (event: MouseEvent) => {
        if (!glowNode) return;
        gsap.to(glowNode, {
          x: event.clientX,
          y: event.clientY,
          duration: 0.6,
          ease: "power2.out",
        });
      };
      document.addEventListener("mousemove", onMove);

      const finalCtaNode =
        rootRef.current?.querySelector<HTMLElement>(".final-cta-title");
      if (finalCtaNode) {
        splitFinalCta = SplitText.create(finalCtaNode, { type: "words" });
        gsap.from(splitFinalCta.words, {
          scrollTrigger: { trigger: ".final-cta-title", start: "top 88%" },
          y: 70,
          autoAlpha: 0,
          rotationX: -18,
          stagger: 0.06,
          ease: "expo.out",
        });
      }

      return () => {
        document.removeEventListener("mousemove", onMove);
        delayedCalls.forEach((call) => call.kill());
        splitHeadline?.revert();
        splitFinalCta?.revert();
        mm.revert();
        smoother?.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      id="smooth-wrapper"
      className="min-h-screen bg-[var(--pr-bg)] text-[var(--pr-text)] font-sans selection:bg-ring/30"
    >
      <div id="cursor-glow" />
      {/* Atmospheric orbs — same visual language as auth pages */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[500px] w-[500px] rounded-full bg-[rgba(16,185,129,0.18)] blur-[140px]" />
        <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-[rgba(99,102,241,0.16)] blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(139,92,246,0.10)] blur-[160px]" />
      </div>
      <div id="smooth-content" className="relative z-10">
        <header className="fixed top-0 z-50 w-full border-b border-[var(--pr-border)]/80 bg-[var(--pr-bg)]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-2 text-[15px] font-semibold">
              <svg
                className="h-5 w-5"
                viewBox="0 0 98 96"
                fill="none"
                aria-hidden="true"
              >
                <path
                  className="logo-path"
                  d="M49 1C22 1 1 22 1 49c0 22 14 40 34 47 2 0 3-1 3-3v-9c-14 3-17-6-17-6-2-5-5-7-5-7-4-3 0-3 0-3 4 0 6 4 6 4 4 6 10 5 12 4 0-3 1-5 2-6-11-1-22-5-22-24 0-5 2-9 4-12 0-1-2-6 1-12 0 0 4-1 13 4 4-1 8-2 12-2 4 0 8 1 12 2 9-5 13-4 13-4 3 6 1 11 1 12 2 3 4 7 4 12 0 19-11 23-22 24 1 1 3 4 3 9v13c0 2 1 3 3 3 20-7 34-25 34-47C97 22 76 1 49 1Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>GitInChat</span>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-[var(--pr-text-muted)] md:flex">
              <Link
                href="#features"
                className="transition-colors hover:text-[var(--pr-text)]"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="transition-colors hover:text-[var(--pr-text)]"
              >
                How it works
              </Link>
              <Link
                href="/auth/login"
                className="font-medium text-[var(--pr-text)] transition-colors hover:text-white/80"
              >
                Sign in
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="cta-btn btn-press btn-shimmer h-8 border border-white/10 bg-[var(--pr-accent)] px-4 font-semibold text-white hover:bg-[var(--pr-accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--pr-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pr-bg)]"
                >
                  Sign up
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 pt-20">
          {/* Hero — centered layout, terminal as centerpiece */}
          <section className="relative mx-auto max-w-6xl px-6 pb-0 pt-16 text-center">
            <div
              className="hero-grid bg-dot-grid pointer-events-none absolute inset-0 rounded-3xl"
              data-speed="0.95"
            />

            {/* Badge */}
            <div className="relative flex justify-center">
              <div
                className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--pr-accent)]/40 bg-[var(--pr-accent)]/10 px-3 py-1"
                data-speed="1.1"
              >
                <span className="h-2 w-2 animate-dot-pulse rounded-full bg-[var(--pr-accent)]" />
                <span className="text-xs text-[var(--pr-text)]">
                  Now in Beta
                </span>
              </div>
            </div>

            {/* Headline — controlled line break, no awkward wrapping */}
            <h1
              ref={headlineRef}
              className="relative mx-auto max-w-4xl font-display text-[clamp(2.6rem,5.5vw,5rem)] font-extrabold leading-[1.06] tracking-tight"
            >
              Ship GitHub work{" "}
              <span className="text-[var(--pr-accent)]">faster,</span>
              <br />
              <span className="text-[var(--pr-text-muted)]">
                without command overload.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="hero-subtitle relative mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[var(--pr-text-muted)]"
            >
              GitInChat turns plain-English prompts into safe repo operations,
              PR reviews, and code-aware answers with full context.
            </p>

            {/* CTAs */}
            <div className="hero-cta relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/signup">
                <Button className="cta-btn btn-press btn-shimmer h-11 border border-white/10 bg-[var(--pr-accent)] px-8 font-semibold text-white hover:bg-[var(--pr-accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--pr-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pr-bg)]">
                  Start free with GitHub
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  variant="outline"
                  className="btn-press btn-shimmer h-11 border-[var(--pr-border)] px-8 font-semibold text-[var(--pr-text)] hover:bg-[var(--pr-surface)] focus-visible:ring-2 focus-visible:ring-[var(--pr-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pr-bg)]"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Watch workflow
                </Button>
              </Link>
            </div>
            {/* Terminal — wide centerpiece with emerald glow */}
            <div
              className="hero-terminal relative mx-auto mt-14 max-w-3xl"
              data-speed="0.92"
            >
              <div
                ref={terminalCardRef}
                className="overflow-hidden rounded-2xl border border-[var(--pr-border-strong)] bg-[var(--pr-surface)] shadow-[0_0_80px_rgba(16,185,129,0.12),0_0_0_1px_rgba(16,185,129,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Window chrome */}
                <div className="hero-terminal-line flex items-center gap-2 border-b border-[var(--pr-border)] bg-[var(--pr-surface-elevated)] px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/30" />
                    <div className="h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/30" />
                    <div className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/30" />
                  </div>
                  <span className="ml-2 font-mono text-xs text-[var(--pr-text-muted)]">
                    gitinchat — agent session
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--pr-accent)]" />
                    <span className="font-mono text-[10px] text-[var(--pr-accent)]">
                      connected
                    </span>
                  </div>
                </div>
                {/* Terminal body */}
                <div className="hero-terminal-line space-y-3 p-6 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--pr-secondary)]">➜</span>
                    <span className="text-[var(--pr-text-muted)]">
                      ~/projects/myapp
                    </span>
                    <span className="text-[var(--pr-text-subtle)]">
                      git:(main)
                    </span>
                  </div>
                  <div className="rounded-lg border border-[var(--pr-border)] bg-[var(--pr-bg)]/60 p-3">
                    <p className="text-xs text-[var(--pr-text-muted)]">
                      Agent online · model gpt-4o-mini · 25 tools active
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-[var(--pr-accent)]">$</span>
                    <span className="break-all text-[var(--pr-text)]">
                      <span ref={terminalLineRef} />
                      <span className="ml-0.5 animate-pulse text-[var(--pr-accent)]">
                        ▌
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-10">
            <div className="section-divider mb-8" />
            <div className="grid gap-3 md:grid-cols-4">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item}
                  className="trust-chip reveal-card flex items-center gap-2 rounded-xl border border-[var(--pr-border)] bg-[var(--pr-surface-elevated)]/55 px-4 py-3 text-xs text-[var(--pr-text-muted)] transition-colors hover:border-[var(--pr-accent)]/20 hover:text-[var(--pr-text)]"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--pr-accent)]" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section id="demo" className="mx-auto max-w-7xl px-6 pb-16">
            <div className="reveal-card glass-card rounded-2xl p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--pr-text-muted)]">
                    Interactive workflow preview
                  </p>
                  <h2 className="text-2xl font-semibold md:text-3xl">
                    From request to PR in one guided loop.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--pr-text-muted)]">
                    Ask, inspect changes, run checks, and open a PR without
                    context switching between 6 tools.
                  </p>
                </div>
                <div ref={commandBurstRef} className="relative">
                  <Button
                    ref={commandButtonRef}
                    className="cta-btn btn-press btn-shimmer border border-[var(--pr-border)] bg-[var(--pr-surface)] text-[var(--pr-text)] hover:bg-[var(--pr-surface-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--pr-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pr-bg)]"
                  >
                    Trigger workflow simulation
                  </Button>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <span
                      key={index}
                      className="burst-particle pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--pr-accent)] opacity-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="mx-auto max-w-7xl px-6 pb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Built for repo velocity, not dashboard clutter.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--pr-text-muted)]">
                Bento layout highlights what matters most when shipping code
                with an AI copilot.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {FEATURE_TILES.map(({ title, body, icon: Icon, className }) => (
                <article
                  key={title}
                  className={`reveal-card glass-card rounded-2xl p-5 ${className}`}
                >
                  <div className="mb-4 inline-flex rounded-md border border-[var(--pr-accent)]/20 bg-[var(--pr-accent)]/10 p-2 text-[var(--pr-accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--pr-text-muted)]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="mx-auto max-w-7xl px-6 pb-16">
            <div className="workflow-grid grid gap-4 md:grid-cols-3">
              {HOW_IT_WORKS.map(({ title, body, icon: Icon }, idx) => (
                <article
                  key={title}
                  className="workflow-step glass-card relative rounded-2xl p-5"
                >
                  <span className="absolute right-4 top-4 font-mono text-xs text-[var(--pr-text-subtle)]">
                    0{idx + 1}
                  </span>
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--pr-accent)]/30 bg-[var(--pr-accent)]/10 text-[var(--pr-accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--pr-text-muted)]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-16">
            <article className="reveal-card rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-surface-elevated)]/65 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--pr-text-muted)]">
                Social proof
              </p>
              <blockquote className="mt-3 text-lg font-medium leading-relaxed md:text-xl">
                “GitInChat cut our release prep by 42%. We stopped
                context-switching between GitHub tabs and terminal scripts.”
              </blockquote>
              <p className="mt-4 text-sm text-[var(--pr-text-muted)]">
                Engineering Lead, SaaS infra team
              </p>
            </article>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-20">
            <div className="section-divider mb-10" />
            <div className="text-center">
              <h2 className="final-cta-title text-3xl font-semibold md:text-4xl">
                Ready to run GitHub in plain English?
              </h2>
              <p className="mt-3 text-sm text-[var(--pr-text-muted)]">
                Free during beta. Connect account, run first workflow in
                minutes.
              </p>
              <Link href="/auth/signup">
                <Button className="cta-btn btn-press btn-shimmer mt-8 h-11 border border-white/10 bg-[var(--pr-accent)] px-10 font-semibold text-white hover:bg-[var(--pr-accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--pr-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pr-bg)]">
                  Get started for free
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <footer className="relative border-t border-[var(--pr-border)] px-6 py-8 text-center text-xs text-[var(--pr-text-muted)]">
          <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--pr-accent)] to-[var(--pr-secondary)]" />
          <p>© 2026 GitInChat. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
