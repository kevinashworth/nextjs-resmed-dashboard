-- Visitors who use "Try the demo" share one account and get a normal session for it.
-- Without this, any visitor could call auth.updateUser() and change the demo password or email,
-- locking everyone else out. Users can't run SQL, so a trigger on auth.users blocks those changes.
-- Sign-ins still work, because they only update columns such as last_sign_in_at.
-- The email must match SUPABASE_DEMO_EMAIL in .env.local.

create function public.prevent_demo_credential_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.email = 'demo@example.com' and (
    new.encrypted_password is distinct from old.encrypted_password
    or new.email is distinct from old.email
    or new.email_change is distinct from old.email_change
    or new.phone is distinct from old.phone
    or new.phone_change is distinct from old.phone_change
  ) then
    raise exception 'The demo account''s credentials cannot be changed.';
  end if;
  return new;
end;
$$;

comment on function public.prevent_demo_credential_changes() is 'Blocks password, email and phone changes for the shared demo account.';

create trigger protect_demo_credentials
  before update on auth.users
  for each row
  execute function public.prevent_demo_credential_changes();
