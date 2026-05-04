import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const response = NextResponse.redirect(`${origin}/chat`)

  console.log('[OAuth Callback] Received request:', {
    url: requestUrl.toString(),
    code: code ? `${code.substring(0, 10)}...` : 'MISSING',
    origin
  })

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
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
  return response
}
