'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function SimpleChat() {
  const router = useRouter()
  const [messages, setMessages] = useState<Array<{id: string; role: string; content: string}>>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to GitHub Chat! How can I help you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/auth/simple-login')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleSend = () => {
    if (!input.trim()) return

    setIsLoading(true)
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input }])

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I received your message: "${input}". This is a demo chat interface. To integrate with a real AI service, you would call your API here.`
      }])
      setInput('')
      setIsLoading(false)
    }, 500)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/auth/simple-login')
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">GitHub Chat</h1>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-4">
          New Chat
        </button>

        <div className="flex-1"></div>

        {user && (
          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm text-slate-400 mb-2">{user.email}</p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-sm bg-transparent"
            >
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-2 rounded ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4 bg-slate-800">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type a message..."
              disabled={isLoading}
              className="bg-slate-700 border-slate-600 text-white min-h-12"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
