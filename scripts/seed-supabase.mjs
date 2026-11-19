#!/usr/bin/env node
// Load records from data/monthlySleepRecords into Supabase.
// Writes go through Row Level Security, so this script only uses the publishable key.
// Usage:
//   npm run db:seed        every record, as the owner user
//   npm run db:seed:demo   the most recent DEMO_RECORD_COUNT records, as the demo user

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { applyDemoScenarios } from "./demo-scenarios.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data", "monthlySleepRecords");
const DEMO_RECORD_COUNT = 365 * 2;

const isDemo = process.argv.includes("--demo");
const account = isDemo
  ? { label: "demo user", emailVar: "SUPABASE_DEMO_EMAIL", passwordVar: "SUPABASE_DEMO_PASSWORD" }
  : { label: "owner", emailVar: "SUPABASE_OWNER_EMAIL", passwordVar: "SUPABASE_OWNER_PASSWORD" };

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  account.emailVar,
  account.passwordVar,
];

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missing.length > 0) {
  fail(`missing environment variables: ${missing.join(", ")}`);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } }, // a script has no browser to store a session in
);

// 1. Sign in. Every row is written with this user's id.
const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
  email: process.env[account.emailVar],
  password: process.env[account.passwordVar],
});
if (signInError) {
  fail(`could not sign in as the ${account.label}: ${signInError.message}`);
}
const userId = signIn.user.id;

// 2. Read every monthly JSON file.
const fileNames = (await fs.readdir(DATA_DIR)).filter((name) => name.endsWith(".json")).sort();
const records = (
  await Promise.all(fileNames.map((fileName) => fs.readFile(path.join(DATA_DIR, fileName), "utf8").then(JSON.parse)))
).flat();
records.sort((a, b) => a.startDate.localeCompare(b.startDate));

// The demo gets only the most recent records, with simulated scenarios such as a rough patch in July 2026.
const selected = isDemo ? applyDemoScenarios(records.slice(-DEMO_RECORD_COUNT)) : records;

// 3. Convert each JSON record (camelCase) to a database row (snake_case).
const rows = selected.map((record) => ({
  user_id: userId,
  start_date: record.startDate,
  total_usage: record.totalUsage,
  sleep_score: record.sleepScore,
  usage_score: record.usageScore,
  ahi_score: record.ahiScore,
  mask_score: record.maskScore,
  leak_score: record.leakScore,
  ahi: record.ahi,
  mask_pair_count: record.maskPairCount,
  leak_percentile: record.leakPercentile,
}));

if (rows.length === 0) {
  fail(`no records found in ${DATA_DIR}`);
}
const firstDate = rows[0].start_date;
const lastDate = rows.at(-1).start_date;

// 4. The demo keeps only the selected date range, so remove rows left over from earlier runs.
//    The owner seed never deletes, because the database may hold data that isn't in the JSON files.
if (isDemo) {
  const { count: deleted, error: deleteError } = await supabase
    .from("sleep_records")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .or(`start_date.lt.${firstDate},start_date.gt.${lastDate}`);
  if (deleteError) {
    fail(`delete failed: ${deleteError.message}`);
  }
  if (deleted > 0) {
    console.log(`Removed ${deleted} rows outside ${firstDate} to ${lastDate}.`);
  }
}

// 5. Insert new rows, and update rows whose (user_id, start_date) already exists.
//    count is the number of rows actually written. RLS can block writes without an error,
//    so compare it with what was sent instead of trusting a missing error.
const { count: written, error: upsertError } = await supabase
  .from("sleep_records")
  .upsert(rows, { onConflict: "user_id,start_date", count: "exact" });
if (upsertError) {
  fail(`upsert failed: ${upsertError.message}`);
}
if (written !== rows.length) {
  fail(`sent ${rows.length} rows but only ${written} were written`);
}

const { count, error: countError } = await supabase.from("sleep_records").select("*", { count: "exact", head: true });
if (countError) {
  fail(`count failed: ${countError.message}`);
}

console.log(`Wrote ${written} of ${records.length} records (${firstDate} to ${lastDate}).`);
console.log(`The ${account.label} now has ${count} rows in sleep_records.`);
