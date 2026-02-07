'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask me anything...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState(1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const height = Math.min(textarea.scrollHeight, 200)
      textarea.style.height = `${height}px`
      const newRows = Math.min(Math.ceil(height / 24), 8)
      setRows(newRows)
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
      setRows(1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 md:gap-3 items-end">
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex text-slate-400 hover:text-slate-300 hover:bg-slate-800 flex-shrink-0"
      >
        <Paperclip className="w-5 h-5" />
      </Button>

      <div className="flex-1 min-w-0">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="resize-none bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-h-48 text-sm md:text-base"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white flex-shrink-0"
        size="icon"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}
