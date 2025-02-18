import { promises as fs } from "fs";
import path from "path";

import { glob } from "fast-glob";

import { DataFile } from "./data-types";

import type { AllData, ChartData, DataFileType, SleepRecordType } from "./data-types";

const getData = async () => {
  const dataPath = path.join(process.cwd(), "data");
  const months = await glob(`${dataPath}/monthlySleepRecords/*.json`);

  const allMonthsData: DataFileType[] = await Promise.all(
    months.map(async (month) => {
      const file = await fs.readFile(month, "utf8");
      const data = JSON.parse(file);
      const result = DataFile.safeParse(data);
      if (!result.success) {
        console.error(`Error in file ${month}:`, result.error);
      }
      return data;
    }),
  );

  const combinedData: SleepRecordType[] = allMonthsData
    .flatMap((monthData) => monthData.data.getPatientWrapper.sleepRecords.items)
    .map((item) => ({
      startDate: item.startDate,
      events: item.ahi,
      leak: item.leakPercentile,
      mask: item.maskPairCount,
      score: item.sleepScore,
      hours: item.totalUsage,
    }));

  const oldestDate = combinedData[0].startDate;
  const newestDate = combinedData[combinedData.length - 1].startDate;
  const totalDates = combinedData.length;

  const eventsData: ChartData[] = combinedData.map((item) => ({
    date: item.startDate,
    value: item.events,
  }));
  const leakData: ChartData[] = combinedData.map((item) => ({
    date: item.startDate,
    value: item.leak,
  }));
  const maskData: ChartData[] = combinedData.map((item) => ({
    date: item.startDate,
    value: item.mask,
  }));
  const scoreData: ChartData[] = combinedData.map((item) => ({
    date: item.startDate,
    value: item.score,
  }));
  const hoursData: ChartData[] = combinedData.map((item) => ({
    date: item.startDate,
    value: item.hours,
  }));
  const allData: AllData = {
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
