import { promises as fs } from "fs";
import path from "path";

import { glob } from "fast-glob";
import { z } from "zod";

const dataPath = path.join(process.cwd(), "data");
const months = await glob(`${dataPath}/monthlySleepRecords/*.json`);

const SleepRecordInput = z.object({
  startDate: z.string(),
  ahi: z.number(),
  leakPercentile: z.number(),
  maskPairCount: z.number(),
  sleepScore: z.number(),
  totalUsage: z.number(),
});
const DataFile = z.object({
  data: z.object({
    getPatientWrapper: z.object({
      sleepRecords: z.object({
        items: z.array(SleepRecordInput),
      }),
    }),
  }),
});
type DataFileType = z.infer<typeof DataFile>;

type SleepRecordType = {
  startDate: string;
  events: number;
  seal: number;
  mask: number;
  score: number;
  usage: number;
};

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
    seal: item.leakPercentile,
    mask: item.maskPairCount,
    score: item.sleepScore,
    usage: item.totalUsage,
  }));

const oldestDate = combinedData[0].startDate;
const newestDate = combinedData[combinedData.length - 1].startDate;
const dateRange = `${oldestDate} to ${newestDate}`;
const totalDays = combinedData.length;

const eventsData = combinedData.map((item) => ({
  date: item.startDate,
  value: item.events,
}));
const sealData = combinedData.map((item) => ({
  date: item.startDate,
  value: item.seal,
}));
const maskData = combinedData.map((item) => ({
  date: item.startDate,
  value: item.mask,
}));
const scoreData = combinedData.map((item) => ({
  date: item.startDate,
  value: item.score,
}));
const usageData = combinedData.map((item) => ({
  date: item.startDate,
  value: item.usage,
}));
const allData = {
  events: eventsData,
  seal: sealData,
  mask: maskData,
  score: scoreData,
  usage: usageData,
};

export { allData, dateRange, eventsData, maskData, newestDate, oldestDate, scoreData, sealData, totalDays, usageData };
