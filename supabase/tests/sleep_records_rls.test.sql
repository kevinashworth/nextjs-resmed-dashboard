-- Row Level Security on public.sleep_records: each user can read and change only their own rows.
-- Runs in a transaction that is rolled back, so it leaves no data behind.

begin;

select plan(14);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'rls-owner@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'rls-other@test.local');

insert into public.sleep_records (
  user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score,
  ahi, mask_pair_count, leak_percentile
) values (
  '11111111-1111-1111-1111-111111111111', '2026-01-01', 480, 0, 0, 0, 0, 0, 1.0, 1, 10.0
);

-- Signed-out visitors use the anon role, which has no policies.
set local role anon;

select is(
  (select count(*)::int from public.sleep_records),
  0,
  'signed-out visitors see no rows'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('11111111-1111-1111-1111-111111111111', '2026-01-02', 0, 0, 0, 0, 0, 0, 0, 0, 0)$$,
  '42501',
  null,
  'signed-out visitors cannot insert rows'
);

-- Another signed-in user.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.sleep_records),
  0,
  'other users see none of the owner''s rows'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('11111111-1111-1111-1111-111111111111', '2026-01-02', 0, 0, 0, 0, 0, 0, 0, 0, 0)$$,
  '42501',
  null,
  'other users cannot insert rows for the owner'
);

-- RLS hides the owner's rows from these statements, so they succeed but change nothing.
select lives_ok(
  $$update public.sleep_records set total_usage = 1 where user_id = '11111111-1111-1111-1111-111111111111'$$,
  'an update of the owner''s rows by another user runs without error'
);

select lives_ok(
  $$delete from public.sleep_records where user_id = '11111111-1111-1111-1111-111111111111'$$,
  'a delete of the owner''s rows by another user runs without error'
);

-- The owner.
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select total_usage from public.sleep_records where start_date = '2026-01-01'),
  480,
  'the other user''s update and delete did not touch the owner''s row'
);

select lives_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('11111111-1111-1111-1111-111111111111', '2026-01-02', 0, 0, 0, 0, 0, 0, 0, 0, 0)$$,
  'the owner can insert their own rows'
);

select is(
  (select count(*)::int from public.sleep_records),
  2,
  'the owner sees their own rows'
);

select lives_ok(
  $$update public.sleep_records set total_usage = 500 where start_date = '2026-01-02'$$,
  'the owner can update their own rows'
);

select is(
  (select total_usage from public.sleep_records where start_date = '2026-01-02'),
  500,
  'the owner''s update was applied'
);

select throws_ok(
  $$update public.sleep_records set user_id = '22222222-2222-2222-2222-222222222222' where start_date = '2026-01-01'$$,
  '42501',
  null,
  'the owner cannot give a row to another user'
);

select lives_ok(
  $$delete from public.sleep_records where start_date = '2026-01-02'$$,
  'the owner can delete their own rows'
);

select is(
  (select count(*)::int from public.sleep_records),
  1,
  'the owner''s delete was applied'
);

select * from finish();

rollback;
