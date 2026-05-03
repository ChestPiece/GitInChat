import { GithubLoading } from '@/components/github-loading'

export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[var(--pr-bg)]">
      <GithubLoading />
    </div>
  )
}
