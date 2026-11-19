import type { SupabaseClient } from "@supabase/supabase-js";

import type { TAllData, TChartData, TSleepRecord } from "@/lib/data-types";
import type { Database } from "@/lib/supabase/database.types";

const getData = async (supabase: SupabaseClient<Database>) => {
  const PAGE_SIZE = 1000;
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("sleep_records")
      .select("*")
      .order("start_date")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  if (rows.length === 0) {
    throw new Error("No sleep records found in the database.");
  }

  // Combine all months' data into a single array of sleep records.
  // For timestamp, we convert startDate to timestamp once here for efficiency.
  const combinedData: TSleepRecord[] = rows.map((row) => ({
    startDate: row.start_date,
    timestamp: new Date(row.start_date).getTime(),
    events: row.ahi,
    leak: row.leak_percentile,
    mask: row.mask_pair_count,
    score: row.sleep_score,
    hours: row.total_usage,
    usageScore: row.usage_score,
    ahiScore: row.ahi_score,
    maskScore: row.mask_score,
    leakScore: row.leak_score,
  }));

  const oldestDate = combinedData[0].startDate;
  const newestDate = combinedData[combinedData.length - 1].startDate;
  const totalDates = combinedData.length;

  const eventsData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.events,
  }));
  const leakData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.leak,
  }));
  const maskData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.mask,
  }));
  const scoreData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.score,
  }));
  const hoursData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.hours,
  }));

  // Score component series
  const usageData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.usageScore,
  }));
  const ahiScoreData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.ahiScore,
  }));
  const maskScoreData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.maskScore,
  }));
  const leakScoreData: TChartData[] = combinedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.leakScore,
  }));
  const allData: TAllData = {
    events: eventsData,
    hours: hoursData,
    mask: maskData,
    leak: leakData,
    score: scoreData,
    // include score breakdown component series
    scoreBreakdown: {
      usage: usageData,
      ahi: ahiScoreData,
      mask: maskScoreData,
      leak: leakScoreData,
    },
    oldestDate,
    newestDate,
    totalDates,
  };

  return allData;
};

export default getData;
