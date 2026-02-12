import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-4 bg-background p-4 text-foreground">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="bg-muted p-4 rounded-full">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
        <p className="text-muted-foreground">
          Could not find requested resource. It might have been moved or deleted.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/chat">Return to Chat</Link>
      </Button>
    </div>
  )
}
