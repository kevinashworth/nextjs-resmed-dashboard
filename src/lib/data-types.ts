import { z } from "zod";

const SleepRecordInputSchema = z.object({
  startDate: z.string(),
  ahi: z.number(),
  leakPercentile: z.number(),
  maskPairCount: z.number(),
  sleepScore: z.number(),
  totalUsage: z.number(),
  // Component scores
  usageScore: z.number(),
  ahiScore: z.number(),
  maskScore: z.number(),
  leakScore: z.number(),
});

export const DataFileSchema = z.object({
  data: z.object({
    getPatientWrapper: z.object({
      sleepRecords: z.object({
        items: z.array(SleepRecordInputSchema),
      }),
    }),
  }),
});
export type TDataFile = z.infer<typeof DataFileSchema>;

export type TSleepRecord = {
  startDate: string;
  timestamp: number;
  events: number;
  hours: number;
  leak: number;
  mask: number;
  score: number;
  // Component scores
  usageScore: number;
  ahiScore: number;
  maskScore: number;
  leakScore: number;
};

export type TAllData = {
  events: TChartData[];
  leak: TChartData[];
  mask: TChartData[];
  score: TChartData[];
  hours: TChartData[];
  // Score breakdown components
  scoreBreakdown: {
    usage: TChartData[];
    ahi: TChartData[];
    mask: TChartData[];
    leak: TChartData[];
  };
  oldestDate: string;
  newestDate: string;
  totalDates: number;
};

export interface TChartData {
  timestamp: number;
  value: number;
}

export interface TChartDataPoint {
  x: number;
  y: number;
}

export type TTabNames = "events" | "hours" | "leak" | "mask" | "score" | "scoreBreakdown";

export type TSelectedPreset =
  | "last30"
  | "last60"
  | "last90"
  | "last180"
  | "last365"
  | "lastMonth"
  | "lastYear"
  | "thisMonth"
  | "thisYear"
  | "allTime"
  | "custom";
