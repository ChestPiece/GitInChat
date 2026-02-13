import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  
  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }

  const user = await getUser()

  if (user) {
    redirect('/chat')
  }

  return <LandingPage />
}
