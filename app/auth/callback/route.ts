import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/protected'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const requestUrl = new URL(request.url)
      requestUrl.pathname = next
      return NextResponse.redirect(requestUrl)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
