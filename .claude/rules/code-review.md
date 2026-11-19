# Code review: project-specific checks

Apply these when writing or reviewing code in this project, in addition to general correctness.

## Supabase and data

- Every new table enables RLS and has policies using `(select auth.uid())`.
- Never use the secret key in app code. Secrets never start with `NEXT_PUBLIC_`.
- Queries that can exceed 1,000 rows must page with `.range()`.
- Verify writes by checking rows affected or counts, because RLS can block writes without an error.
- Never edit a migration that has been applied in a shared database. Add a new one instead.

## Next.js

- Create Supabase clients per request, never at module level.
- Pages that load private data verify the user with `getClaims()`, not just the proxy.
- Server actions re-check every condition their button depends on, such as `DEMO_MODE`.

## Data and tests

- Never edit `data/monthlySleepRecords` to simulate data. Use `scripts/demo-scenarios.mjs`.
- New shared components get stories with play tests.
