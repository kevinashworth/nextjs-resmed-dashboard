import { promises as fs } from "fs";
import path from "path";

import { glob } from "fast-glob";

import { DataFileSchema } from "@/lib/data-types";
import type { TAllData, TChartData, TDataFile, TSleepRecord } from "@/lib/data-types";

const getData = async () => {
  const dataPath = path.join(process.cwd(), "data");
  const months = await glob(`${dataPath}/monthlySleepRecords/*.json`);

  const allMonthsData: TDataFile[] = await Promise.all(
    months.map(async (month) => {
      const file = await fs.readFile(month, "utf8");
      const data = JSON.parse(file);
      const result = DataFileSchema.safeParse(data);
      if (!result.success) {
        console.error(`Error in file ${month}:`, result.error);
      }
      return data;
    }),
  );

  // Combine all months' data into a single array of sleep records.
  // For timestamp, we convert startDate to timestamp once here for efficiency.
  const combinedData: TSleepRecord[] = allMonthsData
    .flatMap((monthData) => monthData.data.getPatientWrapper.sleepRecords.items)
    .map((item) => ({
      startDate: item.startDate,
      timestamp: new Date(item.startDate).getTime(),
      events: item.ahi,
      leak: item.leakPercentile,
      mask: item.maskPairCount,
      score: item.sleepScore,
      hours: item.totalUsage,
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
  const allData: TAllData = {
    events: eventsData,
    hours: hoursData,
    mask: maskData,
    leak: leakData,
    score: scoreData,
    oldestDate,
    newestDate,
    totalDates,
  };

  return allData;
};

export default getData;
