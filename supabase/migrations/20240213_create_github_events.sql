-- Create table for storing GitHub events
create table if not exists github_events (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'push', 'pull_request', etc.
  payload jsonb not null, -- The simplified broadcast payload
  repo_name text,
  actor text,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table github_events enable row level security;

-- Policy: Allow Service Role to do everything (implicit, but good to be explicit if using dashboard)
-- Policy: Allow authenticated users to read events (for the AI/feed)
create policy "Allow authenticated users to read events"
on github_events for select
to authenticated
using (true);

-- Create index for faster querying by type and recency
create index idx_github_events_type_created_at on github_events(type, created_at desc);
create index idx_github_events_repo on github_events(repo_name);
