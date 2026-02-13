'use client'

import React, { useState, useRef, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...', // Chat phasing
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rows, setRows] = useState(3) // Start slightly taller like GitHub
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const height = Math.min(textarea.scrollHeight, 400) // Allow taller growth
      textarea.style.height = `${Math.max(height, 100)}px` // Min height
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
    }
  }

  /* 
    Global keydown listener to focus input on typing.
    This mimics GitHub's ability to just start typing to comment.
  */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is already on an input, textarea, or contenteditable
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement as HTMLElement).isContentEditable
      ) {
        return
      }

      // Ignore modifier keys, function keys, etc.
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
        return
      }

      // Focus the textarea
      textareaRef.current?.focus()
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { // GitHub is Ctrl+Enter to submit
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full">
      <div className="border border-input rounded-md bg-background overflow-hidden relative focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-shadow">
        {/* Header Tabs */}
        <Tabs defaultValue="write" className="w-full">
          <div className="bg-muted/40 border-b border-border px-2 pt-2">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger 
                value="write" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:border-b-transparent border border-transparent rounded-t-md px-3 py-2 text-xs font-medium text-foreground hover:text-foreground/80 relative top-[1px]"
              >
                Write
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:border-b-transparent border border-transparent rounded-t-md px-3 py-2 text-xs font-medium text-foreground hover:text-foreground/80 relative top-[1px]"
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="write" className="p-0 m-0 bg-background ring-0 focus-visible:ring-0">
             <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full min-h-[100px] bg-background border-none focus-visible:ring-0 resize-y p-3 text-sm font-mono placeholder:text-muted-foreground/60"
            />
            <div className="flex items-center justify-between px-2 pb-2 bg-background border-t border-border border-dashed pt-2 mx-2 mb-2">
               <div className="flex items-center text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                 <Paperclip className="w-3.5 h-3.5 mr-1" />
                 <span>Attach files</span>
               </div>
               {/* Markdown hint */}
               <a href="#" className="hidden sm:flex items-center text-xs text-muted-foreground hover:text-blue-500 transition-colors">
                 <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15V4.15C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"></path></svg>
                 Markdown supported
               </a>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="p-4 m-0 min-h-[140px] text-foreground prose prose-invert prose-sm max-w-none bg-background">
             {message ? (
               <div className="whitespace-pre-wrap">{message}</div>
             ) : (
               <p className="text-muted-foreground italic">Nothing to preview</p>
             )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end items-center mt-2">
           <Button
             onClick={handleSend}
             disabled={disabled || !message.trim()}
             className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold px-4 py-1.5 h-auto text-sm"
           >
             Comment
           </Button>
      </div>
    </div>
  )
}
