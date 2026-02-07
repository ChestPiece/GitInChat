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

export function signInWithGithub() {
  // Mock GitHub sign in
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', 'mock_token_' + Date.now())
    localStorage.setItem('user', JSON.stringify(MOCK_USER))
    window.location.href = '/simple-chat'
  }
}

export function signOut() {
  // Sign out
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    window.location.href = '/auth/simple-login'
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('auth_token')
  }
  return false
}
