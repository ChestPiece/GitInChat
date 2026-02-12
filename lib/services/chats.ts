import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export async function fetchChats(supabaseClient?: SupabaseClient): Promise<Chat[]> {
  const supabase = supabaseClient || createClient()
  
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createChat(
  title: string, 
  userId: string,
  supabaseClient?: SupabaseClient
): Promise<Chat> {
  const supabase = supabaseClient || createClient()
  
  const { data, error } = await supabase
    .from('chats')
    .insert({ 
      title, 
      user_id: userId 
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateChat(
  id: string, 
  title: string,
  supabaseClient?: SupabaseClient
): Promise<void> {
  const supabase = supabaseClient || createClient()
  
  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', id)

  if (error) throw error
}

export async function deleteChat(
  id: string,
  supabaseClient?: SupabaseClient
): Promise<void> {
  const supabase = supabaseClient || createClient()
  
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', id)

  if (error) throw error
}
