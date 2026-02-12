'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className={`${geist.className} ${geistMono.className} antialiased`}>
        <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-4 bg-background p-4 text-foreground">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-destructive/10 p-4 rounded-full">
                <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-md">
              A critical error occurred. We apologize for the inconvenience.
            </p>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-muted rounded-md text-left w-full max-w-lg overflow-auto">
                    <p className="font-mono text-xs text-destructive">{error.message}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-2 break-all">{error.digest}</p>
                </div>
            )}
          </div>
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}
