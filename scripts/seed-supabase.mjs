#!/usr/bin/env node
// Load every record in data/monthlySleepRecords into Supabase as the owner user.
// Writes go through Row Level Security, so this script only uses the publishable key.
// Usage: npm run db:seed

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data", "monthlySleepRecords");

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_OWNER_EMAIL",
  "SUPABASE_OWNER_PASSWORD",
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

// 1. Sign in as the owner. Every row is written with this user's id.
const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
  email: process.env.SUPABASE_OWNER_EMAIL,
  password: process.env.SUPABASE_OWNER_PASSWORD,
});
if (signInError) {
  fail(`could not sign in as the owner: ${signInError.message}`);
}
const userId = signIn.user.id;

// 2. Read every monthly JSON file.
const fileNames = (await fs.readdir(DATA_DIR)).filter((name) => name.endsWith(".json")).sort();
const records = [];
for (const fileName of fileNames) {
  const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf8");
  records.push(...JSON.parse(raw));
}

// 3. Convert each JSON record (camelCase) to a database row (snake_case).
const rows = records.map((record) => ({
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

// 4. Insert new rows, and update rows whose (user_id, start_date) already exists.
const { error: upsertError } = await supabase.from("sleep_records").upsert(rows, { onConflict: "user_id,start_date" });
if (upsertError) {
  fail(`upsert failed: ${upsertError.message}`);
}

// 5. Verify. RLS can block writes without returning an error, so count what is actually there.
const { count, error: countError } = await supabase.from("sleep_records").select("*", { count: "exact", head: true });
if (countError) {
  fail(`count failed: ${countError.message}`);
}

console.log(`Read ${rows.length} records from ${fileNames.length} files.`);
console.log(`The owner now has ${count} rows in sleep_records.`);
if (count < rows.length) {
  fail(`expected at least ${rows.length} rows, so some records did not load`);
}
