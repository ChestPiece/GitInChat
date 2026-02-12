'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Segment Error:', error)
  }, [error])

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="bg-destructive/10 p-4 rounded-full">
            <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground">
          We couldn't load this section. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
             <p className="font-mono text-xs text-destructive max-w-md break-all">{error.message}</p>
        )}
      </div>
      <Button onClick={() => reset()} variant="outline">
        Try again
      </Button>
    </div>
  )
}
