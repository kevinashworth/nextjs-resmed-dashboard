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
