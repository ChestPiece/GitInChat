-- Create messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- RLS Policies
create policy "Users can view messages from their chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can insert messages to their chats"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index messages_chat_id_idx on public.messages(chat_id);
create index messages_created_at_idx on public.messages(created_at);
