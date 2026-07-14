# Development

## Updating sleep data

When you have new myAir data to add to the dashboard:

1. Log in to [myAir](https://myair.resmed.com/history)
2. Open DevTools → Network tab
3. Navigate to the sleep history page
4. Find the GraphQL response containing `sleepRecords` (filter by `graphql`)
5. Right-click → **Copy Response**
6. In your terminal, run:

   ```bash
   ./scripts/update-data.sh
   ```

   That's it — it reads your clipboard and processes the data.

   If you don't have a clipboard utility (`pbpaste`, `xclip`, or `wl-paste`), save manually:

   ```bash
   cat > /tmp/myair.json
   # (paste the JSON here, then press Ctrl+D to finish)
   node scripts/process-data.mjs /tmp/myair.json
   ```

   You'll see output like:

   ```bash
   Wrote 2 file(s) (41 total records):
     2026-05.json  (20 records)
     2026-06.json  (21 records)
   ```

7. The script extracts the records, splits them by month, strips unused fields, and writes to `data/monthlySleepRecords/YYYY-MM.json` (overwriting existing files for those months)
8. Verify the build, then create a branch, commit, push, and open a PR.

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
| `./scripts/update-data.sh`                | Read clipboard, process, and write sleep data (macOS/Linux) |
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
