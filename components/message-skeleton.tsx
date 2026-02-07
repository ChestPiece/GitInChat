'use client'

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 mb-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 bg-slate-700 rounded" />
        <div className="h-10 w-full bg-slate-700 rounded-lg" />
      </div>
    </div>
  )
}
