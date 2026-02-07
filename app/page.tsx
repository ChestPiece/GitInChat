import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  // Handle OAuth callback if code is present
  if (searchParams.code) {
    redirect(`/auth/callback?code=${searchParams.code}`)
  }

  const user = await getUser()

  if (user) {
    redirect('/chat')
  }

  redirect('/auth/login')
}
