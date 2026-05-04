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
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    
    if (error) {
      // HR-05: Sanitize error message - don't expose internal details
      console.error('[Messages] DB error:', error);
      throw new Error('Failed to fetch messages from storage')
    }
    return data || []
  } catch (error) {
    // HR-05: Ensure generic error is thrown, not internal details
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw error; // Already sanitized
      }
    }
    console.error('[Messages] Unexpected error:', error);
    throw new Error('Failed to fetch messages from storage')
  }
}
