// Simulated scenarios applied to the demo data only. The JSON files in data/ are never changed.
// The output depends only on the input, so re-running `npm run db:seed:demo` gives the same result.

// A three-week rough patch: short nights, more events, worse mask seal, more mask removals.
const ROUGH_PATCH = { start: "2026-07-06", end: "2026-07-26" };

// Repeatable "random" number in [0, 1) for a date and a field, so each night varies but never changes.
function noise(date, field) {
  let hash = 2166136261;
  for (const char of `${date}:${field}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) / 2 ** 32;
}

function between(min, max, fraction) {
  return min + (max - min) * fraction;
}

const round1 = (value) => Math.round(value * 10) / 10;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Component scores, approximating the rules visible in the real myAir data.
function usageScore(minutes) {
  return clamp(Math.floor(minutes / 6), 0, 70);
}
function leakScore(leak) {
  return clamp(Math.round(((55 - leak) * 20) / 45), 0, 20);
}
function ahiScore(ahi) {
  if (ahi < 6) return 5;
  if (ahi < 10) return 4;
  if (ahi < 15) return 3;
  return 2;
}
function maskScore(pairs) {
  if (pairs <= 2) return 5;
  if (pairs === 3) return 4;
  if (pairs === 4) return 3;
  if (pairs === 5) return 1;
  return 0;
}

// 0 at the edges of the patch, 1 in the middle week, so the nights get worse and then recover.
function severity(date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const start = Date.parse(ROUGH_PATCH.start);
  const length = (Date.parse(ROUGH_PATCH.end) - start) / dayMs + 1;
  const position = (Date.parse(date) - start) / dayMs / (length - 1);
  return clamp(0.55 + 0.45 * Math.sin(Math.PI * position), 0, 1);
}

function roughNight(record) {
  const date = record.startDate;
  const level = severity(date);

  const totalUsage = Math.round(between(330, 150, level * between(0.7, 1, noise(date, "usage"))));
  const ahi = round1(between(4, 13, level * between(0.6, 1, noise(date, "ahi"))));
  const leakPercentile = round1(between(32, 64, level * between(0.6, 1, noise(date, "leak"))));
  const maskPairCount = Math.round(between(3, 7, level * noise(date, "pairs")));

  const scores = {
    usageScore: usageScore(totalUsage),
    ahiScore: ahiScore(ahi),
    maskScore: maskScore(maskPairCount),
    leakScore: leakScore(leakPercentile),
  };

  return {
    ...record,
    totalUsage,
    ahi,
    leakPercentile,
    maskPairCount,
    ...scores,
    sleepScore: scores.usageScore + scores.ahiScore + scores.maskScore + scores.leakScore,
  };
}

// Returns a new array and leaves the input records unchanged.
export function applyDemoScenarios(records) {
  return records.map((record) =>
    record.startDate >= ROUGH_PATCH.start && record.startDate <= ROUGH_PATCH.end ? roughNight(record) : record,
  );
}
