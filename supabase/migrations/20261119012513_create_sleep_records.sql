CREATE TABLE public.sleep_records (
  user_id         uuid not null references auth.users (id) on delete cascade,
  start_date      date not null,
  total_usage     integer not null check (total_usage between 0 and 1440),
  sleep_score     integer not null check (sleep_score between 0 and 100),
  usage_score     integer not null check (usage_score between 0 and 70),
  ahi_score       integer not null check (ahi_score between 0 and 5),
  mask_score      integer not null check (mask_score between 0 and 5),
  leak_score      integer not null check (leak_score between 0 and 20),
  ahi             numeric(4,1) not null check (ahi >= 0),
  mask_pair_count integer not null check (mask_pair_count >= 0),
  leak_percentile numeric(4,1) not null check (leak_percentile >= 0),
  created_at      timestamptz not null default now(),
  primary key (user_id, start_date),
  check (sleep_score = usage_score + ahi_score + mask_score + leak_score)
);
