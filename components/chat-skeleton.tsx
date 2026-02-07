import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Message Skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="h-10 w-10 rounded-full bg-[#30363d]" />
          <div className={`space-y-2 flex-1 max-w-[80%] ${i % 2 === 0 ? 'items-end flex flex-col' : ''}`}>
            <Skeleton className="h-4 w-24 bg-[#30363d]" />
            <Skeleton className="h-20 w-full rounded-md bg-[#161b22] border border-[#30363d]" />
          </div>
        </div>
      ))}
    </div>
  )
}
