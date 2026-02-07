-- Create profiles table to store user metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on chats
alter table public.chats enable row level security;

-- Create policies for chats
create policy "chats_select_own" on public.chats for select using (auth.uid() = user_id);
create policy "chats_insert_own" on public.chats for insert with check (auth.uid() = user_id);
create policy "chats_update_own" on public.chats for update using (auth.uid() = user_id);
create policy "chats_delete_own" on public.chats for delete using (auth.uid() = user_id);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  role text not null check (role in ('user', 'assistant')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on messages
alter table public.messages enable row level security;

-- Create policies for messages
create policy "messages_select_own_chat" on public.messages for select 
  using (chat_id in (select id from public.chats where user_id = auth.uid()));
create policy "messages_insert_own_chat" on public.messages for insert 
  with check (chat_id in (select id from public.chats where user_id = auth.uid()) and user_id = auth.uid());
create policy "messages_update_own" on public.messages for update 
  using (user_id = auth.uid());
create policy "messages_delete_own" on public.messages for delete 
  using (user_id = auth.uid());

-- Create trigger function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger to call the function after user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
