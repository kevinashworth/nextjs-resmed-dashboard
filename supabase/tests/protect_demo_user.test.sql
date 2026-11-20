-- The protect_demo_credentials trigger: the shared demo account's password, email and phone
-- cannot change, but sign-ins and other users are unaffected.
-- Runs in a transaction that is rolled back. It replaces any existing demo user only inside
-- that transaction, so the real local demo user is restored afterward.

begin;

select plan(7);

delete from auth.users where email = 'demo@example.com';

insert into auth.users (id, email, encrypted_password) values
  ('33333333-3333-3333-3333-333333333333', 'demo@example.com', 'demo-hash'),
  ('44444444-4444-4444-4444-444444444444', 'someone@test.local', 'someone-hash');

select throws_ok(
  $$update auth.users set encrypted_password = 'changed-hash' where email = 'demo@example.com'$$,
  'P0001',
  'The demo account''s credentials cannot be changed.',
  'the demo password cannot be changed'
);

select throws_ok(
  $$update auth.users set email = 'attacker@test.local' where email = 'demo@example.com'$$,
  'P0001',
  'The demo account''s credentials cannot be changed.',
  'the demo email cannot be changed'
);

select throws_ok(
  $$update auth.users set email_change = 'attacker@test.local' where email = 'demo@example.com'$$,
  'P0001',
  'The demo account''s credentials cannot be changed.',
  'a demo email change cannot be requested'
);

select throws_ok(
  $$update auth.users set phone = '15555550100' where email = 'demo@example.com'$$,
  'P0001',
  'The demo account''s credentials cannot be changed.',
  'a phone number cannot be added to the demo account'
);

select lives_ok(
  $$update auth.users set last_sign_in_at = now() where email = 'demo@example.com'$$,
  'signing in as the demo user still works'
);

select is(
  (select encrypted_password from auth.users where email = 'demo@example.com'),
  'demo-hash',
  'the demo password is unchanged'
);

select lives_ok(
  $$update auth.users set encrypted_password = 'new-hash' where email = 'someone@test.local'$$,
  'other users can still change their password'
);

select * from finish();

rollback;
