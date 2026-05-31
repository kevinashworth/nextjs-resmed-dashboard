#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data", "monthlySleepRecords");

function usage() {
  console.error(`
Usage:
  node scripts/process-data.mjs [file]     Read JSON file (or stdin) and write monthly files
  node scripts/process-data.mjs --migrate   Convert all existing files to new format
  node scripts/process-data.mjs --help      Show this help

Examples:
  cat ~/Downloads/response.json | node scripts/process-data.mjs
  node scripts/process-data.mjs ~/Downloads/response.json
  node scripts/process-data.mjs --migrate
`);
}

function isOldFormat(value) {
  return (
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    value.data?.getPatientWrapper?.sleepRecords?.items
  );
}

function isNewFormat(value) {
  return Array.isArray(value);
}

function stripRecord(record) {
  const cleaned = { ...record };
  delete cleaned.__typename;
  delete cleaned.sleepRecordPatientId;
  return cleaned;
}

function groupByMonth(records) {
  const groups = {};
  for (const record of records) {
    const m = record.startDate?.slice(0, 7);
    if (!m || !/^\d{4}-\d{2}$/.test(m)) {
      console.warn(`  ⚠  Skipping record with unparseable startDate: ${record.startDate}`);
      continue;
    }
    if (!groups[m]) groups[m] = [];
    groups[m].push(stripRecord(record));
  }
  return groups;
}

async function writeMonthFile(month, records) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const fpath = path.join(DATA_DIR, `${month}.json`);
  const content = JSON.stringify(records, null, 2) + "\n";
  await fs.writeFile(fpath, content, "utf8");
  return { fpath, count: records.length };
}

async function processInput(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("Error: Invalid JSON input");
    process.exit(1);
  }

  let items;
  if (isOldFormat(data)) {
    items = data.data.getPatientWrapper.sleepRecords.items;
  } else if (isNewFormat(data)) {
    items = data;
  } else {
    console.error(
      "Error: Unrecognized format. Expected a GraphQL response with " +
        "data.getPatientWrapper.sleepRecords.items, or a bare array of records.",
    );
    process.exit(1);
  }

  if (!Array.isArray(items)) {
    console.error("Error: sleepRecords.items is not an array");
    process.exit(1);
  }

  const groups = groupByMonth(items);
  const months = Object.keys(groups).sort();
  if (months.length === 0) {
    console.log("No records found to write.");
    return;
  }

  const written = await Promise.all(months.map((m) => writeMonthFile(m, groups[m])));

  const total = written.reduce((s, f) => s + f.count, 0);
  console.log(`Wrote ${written.length} file(s) (${total} total records):`);
  for (const { fpath, count } of written) {
    console.log(`  ${path.basename(fpath)}  (${count} records)`);
  }
}

async function migrateAll() {
  let entries;
  try {
    entries = await fs.readdir(DATA_DIR);
  } catch {
    console.error(`Error: ${DATA_DIR} does not exist`);
    process.exit(1);
  }

  const jsonFiles = entries.filter((f) => f.endsWith(".json")).sort();

  let migrated = 0;
  let skipped = 0;
  let totalRecords = 0;

  for (const fname of jsonFiles) {
    const fpath = path.join(DATA_DIR, fname);
    const raw = await fs.readFile(fpath, "utf8");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.warn(`  ⚠  Skipping unparseable file: ${fname}`);
      skipped++;
      continue;
    }

    if (isNewFormat(data)) {
      skipped++;
      continue;
    }

    if (!isOldFormat(data)) {
      console.warn(`  ⚠  Skipping unrecognized format: ${fname}`);
      skipped++;
      continue;
    }

    const items = data.data.getPatientWrapper.sleepRecords.items.map(stripRecord);
    const content = JSON.stringify(items, null, 2) + "\n";
    await fs.writeFile(fpath, content, "utf8");
    migrated++;
    totalRecords += items.length;
    console.log(`  ✓ ${fname}  (${items.length} records)`);
  }

  console.log(`\nMigrated: ${migrated}, Skipped: ${skipped}, Total records: ${totalRecords}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    usage();
    return;
  }

  if (args.includes("--migrate")) {
    await migrateAll();
    return;
  }

  let raw;
  if (args.length > 0 && !args[0].startsWith("--")) {
    raw = await fs.readFile(args[0], "utf8");
  } else if (process.stdin.isTTY) {
    usage();
    process.exit(1);
  } else {
    raw = await new Promise((resolve) => {
      let d = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (c) => (d += c));
      process.stdin.on("end", () => resolve(d));
    });
  }

  await processInput(raw);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
