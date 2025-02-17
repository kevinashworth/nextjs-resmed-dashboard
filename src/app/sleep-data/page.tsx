import DisplayJSON from "@/components/DisplayJSON";

import {
  allData,
  dateRange,
  eventsData,
  // maskData,
  // newestDate,
  // oldestDate,
  // scoreData,
  // sealData,
  totalDays,
  // usageData,
} from "./get-data";

export default async function Page() {
  return (
    <div>
      <h1>{dateRange}</h1>
      <p>{totalDays} days</p>
      <DisplayJSON json={allData} options={{ maxWidth: 3 }} consoleLog />
      <DisplayJSON json={{ events: eventsData }} className="text-green-700" />
    </div>
  );
}
