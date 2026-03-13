-- Run this in the Supabase SQL Editor to create the leads table

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_type text,
  message text not null,
  urgency text default 'normal',
  ai_response text,
  status text default 'pending' check (status in ('responded', 'pending', 'failed', 'responded_email_failed')),
  response_time_ms integer,
  created_at timestamptz default now()
);

-- Index for dashboard queries (newest first)
create index leads_created_at_idx on leads (created_at desc);

-- Enable Row Level Security (required by Supabase)
alter table leads enable row level security;

-- Allow the anon key to insert and read leads (for demo purposes)
create policy "Allow anonymous insert" on leads for insert with check (true);
create policy "Allow anonymous select" on leads for select using (true);
