import type { TChartData } from "@/lib/data-types";

export const movingAverage = (data: TChartData[], windowSize: number) => {
  return data.map((row, index, total) => {
    const start = Math.max(0, index - windowSize);
    const end = index;
    const subset = total.slice(start, end + 1);
    const sum = subset.reduce((a, b) => {
      return a + b.value;
    }, 0);
    return {
      date: row.date,
      value: sum / subset.length,
    };
  });
};
