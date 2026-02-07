import { createClient } from '@/lib/supabase/client'

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function fetchMessages(chatId: string): Promise<Message[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role,
      content,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
