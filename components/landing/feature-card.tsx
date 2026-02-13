'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  className?: string
  color?: string
}

export function FeatureCard({ title, description, icon: Icon, className, color = "blue" }: FeatureCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 via-transparent to-transparent",
    purple: "from-purple-500/20 via-transparent to-transparent",
    green: "from-green-500/20 via-transparent to-transparent",
    orange: "from-orange-500/20 via-transparent to-transparent",
  }
  
  const iconColorMap: Record<string, string> = {
      blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      green: "text-green-500 bg-green-500/10 border-green-500/20",
      orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  }

  return (
    <div
      className={cn(
        "group relative border border-white/10 bg-gray-900/50 px-8 py-10 overflow-hidden rounded-xl",
        className
      )}
      onMouseMove={onMouseMove}
    >
      <motion.div
        className={`pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br ${colorMap[color]}`}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className={`mb-4 inline-flex items-center justify-center rounded-lg p-3 border w-fit ${iconColorMap[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  )
}
