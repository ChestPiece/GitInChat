import { createClient } from '@/lib/supabase/client'

export interface Chat {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export async function fetchChats(): Promise<Chat[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createChat(title: string): Promise<Chat> {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('chats')
    .insert({ 
      user_id: user.id,
      title,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateChat(chatId: string, title: string): Promise<Chat> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chats')
    .update({ 
      title,
      updated_at: new Date().toISOString()
    })
    .eq('id', chatId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteChat(chatId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
  
  if (error) throw error
}
