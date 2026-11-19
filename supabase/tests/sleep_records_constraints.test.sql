-- Check constraints and the primary key on public.sleep_records.
-- Runs as the database owner, so RLS doesn't apply, and in a transaction that is rolled back.

begin;

select plan(8);

insert into auth.users (id, email) values ('55555555-5555-5555-5555-555555555555', 'constraints@test.local');

select lives_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-01', 480, 100, 70, 5, 5, 20, 1.2, 1, 10.5)$$,
  'a valid night is accepted'
);

select lives_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-02', 1440, 0, 0, 0, 0, 0, 0, 0, 0)$$,
  'a full day of usage (1,440 minutes) is accepted'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-03', 1441, 0, 0, 0, 0, 0, 0, 0, 0)$$,
  '23514',
  null,
  'usage over one day is rejected'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-03', -50, 0, 0, 0, 0, 0, 0, 0, 0)$$,
  '23514',
  null,
  'negative usage is rejected'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-03', 0, 0, 0, 0, 0, 0, -1, 0, 0)$$,
  '23514',
  null,
  'a negative AHI is rejected'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-03', 0, 0, 0, 0, 0, 21, 0, 0, 0)$$,
  '23514',
  null,
  'a component score above its maximum is rejected'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-03', 0, 50, 0, 0, 0, 0, 0, 0, 0)$$,
  '23514',
  null,
  'a sleep score that is not the sum of its components is rejected'
);

select throws_ok(
  $$insert into public.sleep_records (user_id, start_date, total_usage, sleep_score, usage_score, ahi_score, mask_score, leak_score, ahi, mask_pair_count, leak_percentile)
    values ('55555555-5555-5555-5555-555555555555', '2026-01-01', 0, 0, 0, 0, 0, 0, 0, 0, 0)$$,
  '23505',
  null,
  'a second record for the same user and night is rejected'
);

select * from finish();

rollback;
