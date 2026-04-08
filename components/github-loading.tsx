'use client'

import { useRef } from 'react'
import { gsap, useGSAP, DrawSVGPlugin } from '@/lib/gsap'

gsap.registerPlugin(useGSAP, DrawSVGPlugin)

export function GithubLoading() {
  const svgRef = useRef<SVGSVGElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Arc length pulses 0% → 70% → 0% (yoyo)
    gsap.fromTo(
      arcRef.current,
      { drawSVG: '0%' },
      {
        drawSVG: '70%',
        duration: 0.9,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      }
    )
    // SVG rotates continuously
    gsap.to(svgRef.current, {
      rotation: 360,
      duration: 1.1,
      ease: 'none',
      repeat: -1,
      transformOrigin: '50% 50%',
    })
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center min-h-[50vh] w-full bg-background"
    >
      <svg
        ref={svgRef}
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading"
        role="status"
      >
        {/* Track circle */}
        <circle
          cx="16"
          cy="16"
          r="13"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2.5"
          strokeOpacity="0.2"
        />
        {/* Animated arc — DrawSVG controls stroke length */}
        <circle
          ref={arcRef}
          cx="16"
          cy="16"
          r="13"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}
