'use client'

import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <div className="flex flex-col space-y-4 mb-8">
      {/* Breadcrumbs / Back Navigation */}
      <div className="flex items-center text-sm text-[var(--pr-text-muted)]">
        <Link href="/" className="hover:text-[var(--pr-secondary)] transition-colors">
          Home
        </Link>
        {paths.map((path, index) => (
          <div key={path} className="flex items-center">
            <span className="mx-2">/</span>
            <span className={index === paths.length - 1 ? "text-white font-medium capitalize" : "capitalize"}>
              {path}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0 text-[var(--pr-text-muted)] hover:text-white hover:bg-[var(--pr-surface-elevated)]/50 -ml-2">
                <Link href="/">
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
            {description && (
                <p className="text-[var(--pr-text-muted)] mt-1">{description}</p>
            )}
            </div>
        </div>
        {children}
      </div>
    </div>
  )
}
