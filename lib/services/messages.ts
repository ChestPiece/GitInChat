import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Message } from './messages.client'
import { redactContent } from '@/lib/safety'

export { fetchMessages, type Message } from './messages.client'


export async function createMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  supabaseClient?: SupabaseClient
): Promise<Message> {
  const supabase = supabaseClient || createClient()
  const isProduction = process.env.NODE_ENV === 'production'
  
  // 🛡️ Redact PII before storage
  let safeContent = content;
  try {
    if (content) {
      const result = await redactContent(content)
      safeContent = result.redacted
    }
  } catch (error) {
    if (isProduction) {
      throw new Error('[Privacy] Redaction failed in production; refusing raw persistence')
    }
    console.warn('[Privacy] Redaction failed in development (saving raw):', error)
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        role,
        content: safeContent,
      })
      .select()
      .single()
    
    if (error) {
      // HR-05: Sanitize error - don't expose DB details to caller
      console.error('[Messages] Insert error:', error);
      throw new Error('Failed to save message')
    }
    return data
  } catch (error) {
    // HR-05: Ensure generic error is thrown
    if (error instanceof Error) {
      if (error.message.includes('Failed to save')) {
        throw error; // Already sanitized
      }
    }
    console.error('[Messages] Unexpected error:', error);
    throw new Error('Failed to save message')
  }
}
