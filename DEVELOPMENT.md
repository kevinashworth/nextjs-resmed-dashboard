# Development

## Prerequisites

Local development runs against a local Supabase stack, which runs in Docker. Before running `npm run dev`, `npm run db:seed`, `npm run db:test` or `npm run db:types`:

1. Start Docker Desktop (or another Docker runtime).
2. Start Supabase:

   ```bash
   npx supabase start
   ```

Stop it with `npx supabase stop` when you're done. `npm run db:seed:prod` writes to the hosted project, so it doesn't need Docker.

## Updating sleep data

The dashboard reads sleep data from the `sleep_records` table in Supabase. The JSON files in `data/monthlySleepRecords/` hold a copy of every night, and the seed script loads them into the database. Adding new myAir data takes two steps: save it to JSON, then seed it.

### 1. Save the myAir data to JSON

1. Log in to [myAir](https://myair.resmed.com/history)
2. Open DevTools → Network tab
3. Navigate to the sleep history page
4. Find the GraphQL response containing `sleepRecords` (filter by `graphql`)
5. Right-click → **Copy Response**
6. In your terminal, run:

   ```bash
   ./scripts/update-data.sh
   ```

   It reads your clipboard, splits the records by month, strips unused fields, and writes `data/monthlySleepRecords/YYYY-MM.json`, overwriting the files for those months. You'll see output like:

   ```bash
   Wrote 2 file(s) (41 total records):
     2026-05.json  (20 records)
     2026-06.json  (21 records)
   ```

   If you don't have a clipboard utility (`pbpaste`, `xclip`, or `wl-paste`), save the response manually:

   ```bash
   cat > /tmp/myair.json
   # (paste the JSON here, then press Ctrl+D to finish)
   node scripts/process-data.mjs /tmp/myair.json
   ```

### 2. Load the data into Supabase

```bash
npm run db:seed
```

This signs in as `SUPABASE_OWNER_EMAIL` and upserts every record from the JSON files. Nights already in the database are updated and new nights are added. Nothing is deleted, so it's safe to run again. The script stops with an error if any row is rejected or not written.

`npm run db:seed` writes to the local project in `.env.local`, which must be running (see [Prerequisites](#prerequisites)). To update the hosted project, run:

```bash
npm run db:seed:prod
```

This reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_OWNER_EMAIL` and `SUPABASE_OWNER_PASSWORD` from `.env.production.local`. Use the hosted project's values and the owner account in that project.

Reload `/sleep-data` to see the new nights. You don't need to rebuild or redeploy the app.

If demo mode is on, run `npm run db:seed:demo` as well. It moves the demo's 730-night window forward to include the new data.

### 3. Commit the JSON files

Create a branch, commit the changed files in `data/monthlySleepRecords/`, push, and open a PR. The JSON files are what you rebuild the database from, for example after `npx supabase db reset`.

## Available scripts

| Command                                   | Description                                                 |
| ----------------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                             | Start dev server on port 3030                               |
| `npm run build`                           | Production build                                            |
| `npm run lint`                            | Run oxlint                                                  |
| `npm run fmt`                             | Format with oxfmt                                           |
| `npm run check:types`                     | TypeScript type-check                                       |
| `npm run storybook`                       | Start Storybook on port 6006                                |
| `npm run build-storybook`                 | Build a static Storybook bundle                             |
| `npx http-server ./storybook-static`      | Serve the static Storybook build locally for preview        |
| `npm run chromatic`                       | Publish the current Storybook to Chromatic                  |
| `npm run chromatic:dry-run`               | Validate the local Chromatic setup without publishing       |
| `./scripts/update-data.sh`                | Read clipboard, process, and write sleep JSON (macOS/Linux) |
| `npm run db:seed`                         | Load the sleep JSON into Supabase as the owner              |
| `npm run db:seed:demo`                    | Reload the demo user's 730 most recent nights               |
| `npm run db:seed:prod`                    | Load the sleep JSON into the hosted Supabase project        |
| `npm run db:test`                         | Run the pgTAP database tests                                |
| `npm run db:types`                        | Regenerate TypeScript types from the local database         |
| `node scripts/process-data.mjs --help`    | Data processing script help                                 |
| `node scripts/process-data.mjs --migrate` | Convert all existing files to current format                |

## Component development with Storybook and Chromatic

### Storybook

To browse and test UI components locally, run:

```bash
npm run storybook
```

Then open <http://localhost:6006>.

Build a static Storybook bundle with:

```bash
npm run build-storybook
```

Preview the static Storybook build locally with:

```bash
npx http-server ./storybook-static
```

Then open <http://127.0.0.1:8080> (default `http-server` port).

### Chromatic

Chromatic is part of the UI review path for Storybook changes.

- GitHub Actions runs Chromatic automatically on every push using the repo secret `CHROMATIC_PROJECT_TOKEN`.
- Local Chromatic runs are optional, but useful when you want faster feedback before pushing a UI or story change.

To enable local runs, set `CHROMATIC_PROJECT_TOKEN` in your shell or in `.env`:

```bash
CHROMATIC_PROJECT_TOKEN=your-project-token
```

Then you can run:

```bash
npm run chromatic:dry-run
```

Use `npm run chromatic` only when you intentionally want to publish from your local machine. In normal development, pushing your branch is enough to trigger the authoritative Chromatic run in GitHub Actions.

## Database tests

`npm run db:test` runs the pgTAP tests in `supabase/tests/` against the local database. They cover the Row Level Security policies, the demo account protection and the table's checks. Each test runs in a transaction that is rolled back, so it leaves your data unchanged. Supabase must be running (`npx supabase start`).

## Demo mode

Demo mode adds a **Try the demo** button to `/login`. It signs visitors in as a shared demo user, which has its own copy of 730 recent nights. Row Level Security keeps the demo user away from the owner's data.

1. In `.env.local`, set `DEMO_MODE=true`, `SUPABASE_DEMO_EMAIL` and `SUPABASE_DEMO_PASSWORD`. These are server-only.
2. Create the demo user in Studio under **Authentication → Users → Add user**, using that email and password. `npx supabase db reset` deletes all users, so repeat this after every reset.
3. Run `npm run db:seed:demo` to load the demo data. Run it again at any time to restore the data.

The login page reads `DEMO_MODE` on each request, so turning demo mode on or off only needs a server restart, not a rebuild.

Visitors share the demo account, so the migration `protect_demo_user` stops anyone from changing its password, email or phone. That migration names the account `demo@example.com`, so keep `SUPABASE_DEMO_EMAIL` set to that address. Visitors can still change the demo's sleep records; `npm run db:seed:demo` restores them.
