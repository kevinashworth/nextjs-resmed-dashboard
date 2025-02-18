import { z } from "zod";

const SleepRecordInput = z.object({
  startDate: z.string(),
  ahi: z.number(),
  leakPercentile: z.number(),
  maskPairCount: z.number(),
  sleepScore: z.number(),
  totalUsage: z.number(),
});
export const DataFile = z.object({
  data: z.object({
    getPatientWrapper: z.object({
      sleepRecords: z.object({
        items: z.array(SleepRecordInput),
      }),
    }),
  }),
});
export type DataFileType = z.infer<typeof DataFile>;

export type SleepRecordType = {
  startDate: string;
  events: number;
  hours: number;
  leak: number;
  mask: number;
  score: number;
};

export type AllData = {
  events: ChartData[];
  leak: ChartData[];
  mask: ChartData[];
  score: ChartData[];
  hours: ChartData[];
  oldestDate: string;
  newestDate: string;
  totalDates: number;
};

export interface ChartData {
  date: string;
  value: number;
}

export type TabNames = "events" | "hours" | "leak" | "mask" | "score";

export type SelectedPreset =
  | "last30"
  | "last60"
  | "last90"
  | "last180"
  | "lastMonth"
  | "lastYear"
  | "thisMonth"
  | "thisYear"
  | "allTime"
  | "custom";
