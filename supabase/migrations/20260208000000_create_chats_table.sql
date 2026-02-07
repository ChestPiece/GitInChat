-- Create chats table
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.chats enable row level security;

-- RLS Policies
create policy "Users can view their own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chats"
  on public.chats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

-- Index for performance
create index chats_user_id_idx on public.chats(user_id);
create index chats_created_at_idx on public.chats(created_at desc);
