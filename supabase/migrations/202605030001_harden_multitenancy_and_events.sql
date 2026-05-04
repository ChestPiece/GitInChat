-- Harden multitenancy for vector search and GitHub events visibility.

-- 1) Documents tenancy and vector search contract
alter table if exists public.documents
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists documents_user_id_idx on public.documents(user_id);

alter table if exists public.documents enable row level security;

drop policy if exists "Users can view own documents" on public.documents;
create policy "Users can view own documents"
on public.documents for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents"
on public.documents for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents"
on public.documents for delete
to authenticated
using (auth.uid() = user_id);

-- Replace legacy function signature with user-scoped variant.
drop function if exists public.match_documents(vector(1536), float, int);

create or replace function public.match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from public.documents
  where documents.user_id = filter_user_id
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 2) Events scoping by GitHub owner identity.
alter table if exists public.github_events
  add column if not exists repo_owner text;

create index if not exists idx_github_events_repo_owner on public.github_events(repo_owner);

drop policy if exists "Allow authenticated users to read events" on public.github_events;
create policy "Allow users to read owner-scoped events"
on public.github_events for select
to authenticated
using (
  lower(coalesce(repo_owner, '')) = lower(
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'user_name',
      auth.jwt() -> 'user_metadata' ->> 'preferred_username',
      ''
    )
  )
);
