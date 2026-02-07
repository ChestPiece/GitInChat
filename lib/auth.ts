'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

const MOCK_USER: User = {
  id: '1',
  email: 'demo@github.com',
  name: 'Demo User',
  avatar: 'https://api.github.com/users/torvalds/avatar_url',
}

export async function signInWithGithub() {
  // Mock GitHub sign in - in production, use actual OAuth
  const cookieStore = await cookies()
  cookieStore.set('auth_token', 'mock_token_123', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
  redirect('/chat')
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  redirect('/auth/login')
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    return token ? { user: MOCK_USER } : null
  } catch {
    return null
  }
}

export async function getUser() {
  try {
    const session = await getSession()
    return session?.user || null
  } catch {
    return null
  }
}
