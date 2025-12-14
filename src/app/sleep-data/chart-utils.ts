import type { TChartData } from "@/lib/data-types";

// Optimized moving average using sliding window - O(n) instead of O(n²)
export const movingAverage = (data: TChartData[], windowSize: number) => {
  if (data.length === 0) return [];

  const result: TChartData[] = [];
  let sum = 0;
  let count = 0;

  // Initialize the first window
  for (let i = 0; i < Math.min(windowSize, data.length); i++) {
    sum += data[i].value;
    count++;
    result.push({
      date: data[i].date,
      value: sum / count,
    });
  }

  // Slide the window
  for (let i = windowSize; i < data.length; i++) {
    sum = sum + data[i].value - data[i - windowSize].value;
    result.push({
      date: data[i].date,
      value: sum / windowSize,
    });
  }

  return result;
};
