create table public.sleep_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  total_usage integer not null check (total_usage between 0 and 1440),
  sleep_score integer not null check (sleep_score between 0 and 100),
  usage_score integer not null check (usage_score between 0 and 70),
  ahi_score integer not null check (ahi_score between 0 and 5),
  mask_score integer not null check (mask_score between 0 and 5),
  leak_score integer not null check (leak_score between 0 and 20),
  ahi numeric(4, 1) not null check (ahi >= 0),
  mask_pair_count integer not null check (mask_pair_count >= 0),
  leak_percentile numeric(4, 1) not null check (leak_percentile >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, start_date),
  check (sleep_score = usage_score + ahi_score + mask_score + leak_score)
);

comment on table public.sleep_records is 'One row per user per night of ResMed CPAP therapy data, including the myAir sleep score and its component scores.';

-- Enable RLS in the same migration that creates the table, so the table is never exposed without it.
alter table public.sleep_records enable row level security;

create policy "Users can read their own sleep records" on public.sleep_records
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own sleep records" on public.sleep_records
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own sleep records" on public.sleep_records
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Lets a re-seed remove rows that are no longer in the selected range.
create policy "Users can delete their own sleep records" on public.sleep_records
  for delete to authenticated
  using ((select auth.uid()) = user_id);
