import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

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

  redirect('/auth/login')
}
