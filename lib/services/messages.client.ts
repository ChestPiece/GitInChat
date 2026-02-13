import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function fetchMessages(chatId: string, supabaseClient?: SupabaseClient): Promise<Message[]> {
  const supabase = supabaseClient || createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}
