"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import AutoSizer from "react-virtualized-auto-sizer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AllData, SelectedPreset, TabNames } from "@/lib/data-types";

import { chartOptions, series } from "./chart-constants";
import { movingAverage } from "./chart-utils";
import MyTabTriggerTitle from "./my-tab-trigger-title";

function PageContent({ data }: { data: AllData }) {
  const [selectedPreset, setSelectedPreset] = useState<SelectedPreset>("last60");
  const [startDate, setStartDate] = useState(() => {
    const newestDate = new Date(data.newestDate);
    const sixtyDaysAgo = new Date(newestDate.getTime() - 60 * 24 * 60 * 60 * 1000);
    return sixtyDaysAgo.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(data.newestDate);

  const filteredData = useMemo(() => {
    const dateFilter = (d: { date: string | number | Date }): boolean => {
      const date = new Date(d.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    };

    return {
      events: data.events.filter(dateFilter),
      hours: data.hours.filter(dateFilter),
      leak: data.leak.filter(dateFilter),
      mask: data.mask.filter(dateFilter),
      score: data.score.filter(dateFilter),
    };
  }, [data, startDate, endDate]);

  const categories = useMemo(() => filteredData.events.map((d) => d.date), [filteredData.events]);

  const chartSeries = useMemo(
    () => ({
      hours: [
        {
          ...series.hours[0],
          data: filteredData.hours.map((d) => d.value),
        },
        {
          ...series.hours[1],
          data: movingAverage(filteredData.hours, 7).map((d) => d.value),
        },
      ],
      leak: [
        {
          ...series.leak[0],
          data: filteredData.leak.map((d) => d.value),
        },
        {
          ...series.leak[1],
          data: movingAverage(filteredData.leak, 7).map((d) => d.value),
        },
      ],
      events: [
        {
          ...series.events[0],
          data: filteredData.events.map((d) => d.value),
        },
        {
          ...series.events[1],
          data: movingAverage(filteredData.events, 7).map((d) => d.value),
        },
      ],
      mask: [
        {
          ...series.mask[0],
          data: filteredData.mask.map((d) => d.value),
        },
        {
          ...series.mask[1],
          data: movingAverage(filteredData.mask, 7).map((d) => d.value),
        },
      ],
      score: [
        {
          ...series.score[0],
          data: filteredData.score.map((d) => d.value),
        },
        {
          ...series.score[1],
          data: movingAverage(filteredData.score, 7).map((d) => d.value),
        },
      ],
    }),
    [filteredData],
  );

  const options = useMemo(() => {
    const getChartOptions = (tab: TabNames) => {
      const base = { ...chartOptions[tab] };
      return {
        ...base,
        xaxis: {
          ...base.xaxis,
          categories,
        },
      };
    };
    return {
      hours: getChartOptions("hours"),
      leak: getChartOptions("leak"),
      events: getChartOptions("events"),
      mask: getChartOptions("mask"),
      score: getChartOptions("score"),
    };
  }, [categories]);

  function handlePresetChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextPreset = event.target.value as SelectedPreset;
    setSelectedPreset(nextPreset);

    const newestDate = new Date(data.newestDate);
    let end = new Date(data.newestDate);
    let start = new Date(data.oldestDate);

    switch (nextPreset) {
      case "last30": {
        const thirtyDaysAgo = new Date(newestDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        start = thirtyDaysAgo;
        break;
      }
      // default
      case "last60": {
        const sixtyDaysAgo = new Date(newestDate.getTime() - 60 * 24 * 60 * 60 * 1000);
        start = sixtyDaysAgo;
        break;
      }
      case "last90": {
        const ninetyDaysAgo = new Date(newestDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        start = ninetyDaysAgo;
        break;
      }
      case "last180": {
        const oneEightyDaysAgo = new Date(newestDate.getTime() - 180 * 24 * 60 * 60 * 1000);
        start = oneEightyDaysAgo;
        break;
      }
      case "last365": {
        const oneYearAgo = new Date(newestDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        start = oneYearAgo;
        break;
      }
      case "lastMonth": {
        const firstDayLastMonth = new Date(newestDate.getFullYear(), newestDate.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(newestDate.getFullYear(), newestDate.getMonth(), 0);
        start = firstDayLastMonth;
        end = lastDayLastMonth;
        break;
      }
      case "lastYear": {
        const firstDayLastYear = new Date(newestDate.getFullYear() - 1, 0, 1);
        const lastDayLastYear = new Date(newestDate.getFullYear(), 0, 0);
        start = firstDayLastYear;
        end = lastDayLastYear;
        break;
      }
      case "thisMonth": {
        const firstDayThisMonth = new Date(newestDate.getFullYear(), newestDate.getMonth(), 1);
        const lastDayThisMonth = new Date(newestDate.getFullYear(), newestDate.getMonth() + 1, 0);
        start = firstDayThisMonth;
        end = lastDayThisMonth;
        break;
      }
      case "thisYear": {
        const firstDayThisYear = new Date(newestDate.getFullYear(), 0, 1);
        start = firstDayThisYear;
        break;
      }
      case "allTime": {
        start = new Date(data.oldestDate);
        break;
      }
      case "custom": {
        // setSelectedPreset(nextPreset);
        return;
      }
    }
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }

  function handleStartDateChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedPreset("custom");
    setStartDate(event.target.value);
  }

  function handleEndDateChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedPreset("custom");
    setEndDate(event.target.value);
  }

  return (
    <div>
      {/* <!-- Date Range Controls --> */}
      <div className="mb-6 inline-block rounded-lg p-4">
        <h1 className="mb-4 text-xl font-bold text-accent-500">
          My{" "}
          <span className="text-accent-600">
            Resmed <span className="font-normal">my</span>Air
          </span>{" "}
          Sleep Data
        </h1>
        <div className="flex flex-row items-start gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="preset-range" className="whitespace-nowrap text-sm font-semibold text-accent-500">
              Date Range
            </label>
            <select
              id="preset-range"
              className="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedPreset}
              onChange={handlePresetChange}
            >
              <option value="last30">Last 30 Days</option>
              <option value="last60">Last 60 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="last180">Last 180 Days</option>
              <option value="last365">Last 365 Days</option>
              <option value="lastMonth">Last Calendar Month</option>
              <option value="lastYear">Last Calendar Year</option>
              <option value="thisMonth">This Calendar Month</option>
              <option value="thisYear">This Calendar Year</option>
              <option value="allTime">All Days</option>
              <option value="custom">Custom Range →</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="start-date" className="whitespace-nowrap text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              className="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={startDate}
              onChange={handleStartDateChange}
              min={data.oldestDate}
              max={data.newestDate}
            />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="end-date" className="whitespace-nowrap text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              className="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={endDate}
              onChange={handleEndDateChange}
              min={data.oldestDate}
              max={data.newestDate}
            />
          </div>
        </div>
      </div>

      <div className="h-[60vh] w-full px-8">
        <AutoSizer>
          {({ height, width }) => (
            <div>
              <Tabs defaultValue="hours" className="w-[400px]">
                <TabsList>
                  <TabsTrigger
                    value="hours"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-hours/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="hours" title="Usage Hours" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="leak"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-leak/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="leak" title="Mask Seal" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="events"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-events/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="events" title="Events" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="mask"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-mask/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="mask" title="Mask On/Off" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="score"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-score/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="score" title="myAir Score" />
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hours">
                  <Chart options={options.hours} series={chartSeries.hours} height={height} width={width} />
                </TabsContent>
                <TabsContent value="leak">
                  <Chart options={options.leak} series={chartSeries.leak} height={height} width={width} />
                </TabsContent>
                <TabsContent value="events">
                  <Chart options={options.events} series={chartSeries.events} height={height} width={width} />
                </TabsContent>
                <TabsContent value="mask">
                  <Chart options={options.mask} series={chartSeries.mask} height={height} width={width} />
                </TabsContent>
                <TabsContent value="score">
                  <Chart options={options.score} series={chartSeries.score} height={height} width={width} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

export default PageContent;
