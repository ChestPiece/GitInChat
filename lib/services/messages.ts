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

export async function createMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  supabaseClient?: SupabaseClient
): Promise<Message> {
  const supabase = supabaseClient || createClient()
  
  // 🛡️ Redact PII before storage
  let safeContent = content;
  try {
    // Only redact user messages (assistants are trusted/already safe)
    if (role === 'user' && content) {
       const { safetyClient } = await import('@/lib/ai/safety'); 
       // Uses SuperAgent 'redact' method which requires an LLM provider key
       // We use a lightweight model for speed/cost.
       const result = await safetyClient.redact({
         input: content,
         model: "openai/gpt-4o-mini" 
       });
       safeContent = result.redacted;
    }
  } catch (error) {
    // Fail Open: If redaction fails (e.g. API error), save the original message
    // so the chat flow isn't broken.
    console.warn("[Privacy] Redaction failed (saving raw):", error);
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role,
      content: safeContent,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
