import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('[OAuth Callback] Received request:', {
    url: requestUrl.toString(),
    code: code ? `${code.substring(0, 10)}...` : 'MISSING',
    origin
  })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[OAuth Callback] Error exchanging code:', error)
      return NextResponse.redirect(`${origin}/auth/error`)
    }

    console.log('[OAuth Callback] Session exchange successful, redirecting to /chat')
  } else {
    console.error('[OAuth Callback] No code parameter received')
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/chat`)
}
