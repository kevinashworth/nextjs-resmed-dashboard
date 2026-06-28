"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { AutoSizer } from "react-virtualized-auto-sizer";

import SegmentedToggle from "@/components/SegmentedToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LONG_RANGE_THRESHOLD, chartOptions, series } from "./chart-constants";
import { movingAverage } from "./chart-utils";
import MyTabTriggerTitle from "./my-tab-trigger-title";

import type { ApexOptions } from "apexcharts";

import type { TAllData, TSelectedPreset, TTabNames } from "@/lib/data-types";

const INITIAL_STARTDATE_DAYS_AGO = 90; // 30, 60, 90, 180, 365
const INITIAL_SELECTED_PRESET = ("last" + INITIAL_STARTDATE_DAYS_AGO) as TSelectedPreset;
const INITIAL_TAB: TTabNames = "score";

function PageContent({ data }: { data: TAllData }) {
  const [selectedPreset, setSelectedPreset] = useState<TSelectedPreset>(INITIAL_SELECTED_PRESET);
  const [startDate, setStartDate] = useState(() => {
    const newestDate = new Date(data.newestDate);
    const xDaysAgo = new Date(newestDate.getTime() - INITIAL_STARTDATE_DAYS_AGO * 24 * 60 * 60 * 1000);
    return xDaysAgo.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(data.newestDate);
  const [useColumnsOverride, setUseColumnsOverride] = useState(() => INITIAL_STARTDATE_DAYS_AGO < LONG_RANGE_THRESHOLD);
  const [currentTab, setCurrentTab] = useState<TTabNames>(INITIAL_TAB);
  const startTs = new Date(startDate).getTime();
  const endTs = new Date(endDate).getTime();

  const dayCount = Math.round((endTs - startTs) / (24 * 60 * 60 * 1000));
  const isLongRange = dayCount >= LONG_RANGE_THRESHOLD;

  function toggleColumn() {
    setUseColumnsOverride((prev) => !prev);
  }

  function resetColumnsForRange(start: Date, end: Date) {
    const rangeDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    setUseColumnsOverride(rangeDays < LONG_RANGE_THRESHOLD);
  }

  function renderTabChart(tab: TTabNames, height: number, width: number) {
    if (currentTab !== tab) return null;

    return (
      <Chart key={tab} options={dynamicChartOptions[tab]} series={chartSeries[tab]} height={height} width={width} />
    );
  }

  const filteredData = useMemo(() => {
    const timestampFilter = (record: { timestamp: number }): boolean => {
      if (startTs === undefined || endTs === undefined) return true;
      return record.timestamp >= startTs && record.timestamp <= endTs;
    };

    return {
      events: data.events.filter(timestampFilter),
      hours: data.hours.filter(timestampFilter),
      leak: data.leak.filter(timestampFilter),
      mask: data.mask.filter(timestampFilter),
      score: data.score.filter(timestampFilter),
      scoreBreakdown: {
        usage: data.scoreBreakdown.usage.filter(timestampFilter),
        ahi: data.scoreBreakdown.ahi.filter(timestampFilter),
        mask: data.scoreBreakdown.mask.filter(timestampFilter),
        leak: data.scoreBreakdown.leak.filter(timestampFilter),
      },
    };
  }, [data, startTs, endTs]);

  const dynamicChartOptions: Record<TTabNames, ApexOptions> = useMemo(() => {
    const getOpts = (key: TTabNames): ApexOptions => {
      const opts = chartOptions[key];
      if (key === "scoreBreakdown") {
        return {
          ...opts,
          chart: { ...opts.chart, stackOnlyBar: false },
        };
      }
      return opts;
    };

    return {
      hours: getOpts("hours"),
      leak: getOpts("leak"),
      events: getOpts("events"),
      mask: getOpts("mask"),
      score: getOpts("score"),
      scoreBreakdown: getOpts("scoreBreakdown"),
    };
  }, []);

  const chartSeries = useMemo(() => {
    const typeFor = (tab: TTabNames) => {
      if (useColumnsOverride && tab === currentTab) return "column";
      return "area";
    };

    const xy = (data: { timestamp: number; value: number }[]) => data.map((p) => ({ x: p.timestamp, y: p.value }));

    return {
      hours: [
        { ...series.hours[0], type: typeFor("hours"), data: xy(filteredData.hours) },
        { ...series.hours[1], data: xy(movingAverage(filteredData.hours, 7)) },
      ],
      leak: [
        { ...series.leak[0], type: typeFor("leak"), data: xy(filteredData.leak) },
        { ...series.leak[1], data: xy(movingAverage(filteredData.leak, 7)) },
      ],
      events: [
        { ...series.events[0], type: typeFor("events"), data: xy(filteredData.events) },
        { ...series.events[1], data: xy(movingAverage(filteredData.events, 7)) },
      ],
      mask: [
        { ...series.mask[0], type: typeFor("mask"), data: xy(filteredData.mask) },
        { ...series.mask[1], data: xy(movingAverage(filteredData.mask, 7)) },
      ],
      score: [
        { ...series.score[0], type: typeFor("score"), data: xy(filteredData.score) },
        { ...series.score[1], data: xy(movingAverage(filteredData.score, 7)) },
      ],
      scoreBreakdown: [
        { ...series.scoreBreakdown[0], type: typeFor("scoreBreakdown"), data: xy(filteredData.scoreBreakdown.usage) },
        { ...series.scoreBreakdown[1], type: typeFor("scoreBreakdown"), data: xy(filteredData.scoreBreakdown.ahi) },
        { ...series.scoreBreakdown[2], type: typeFor("scoreBreakdown"), data: xy(filteredData.scoreBreakdown.mask) },
        { ...series.scoreBreakdown[3], type: typeFor("scoreBreakdown"), data: xy(filteredData.scoreBreakdown.leak) },
        { ...series.scoreBreakdown[4], data: xy(movingAverage(filteredData.score, 7)) },
      ],
    };
  }, [filteredData, useColumnsOverride, currentTab]);

  function handlePresetChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextPreset = event.target.value as TSelectedPreset;
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
    resetColumnsForRange(start, end);
  }

  function handleStartDateChange(event: ChangeEvent<HTMLInputElement>) {
    const newStart = new Date(event.target.value);
    setSelectedPreset("custom");
    setStartDate(event.target.value);
    resetColumnsForRange(newStart, new Date(endDate));
  }

  function handleEndDateChange(event: ChangeEvent<HTMLInputElement>) {
    const newEnd = new Date(event.target.value);
    setSelectedPreset("custom");
    setEndDate(event.target.value);
    resetColumnsForRange(new Date(startDate), newEnd);
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
            <label htmlFor="preset-range" className="text-sm font-semibold whitespace-nowrap text-accent-500">
              Date Range
            </label>
            <select
              id="preset-range"
              autoComplete="off"
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
            <label htmlFor="start-date" className="text-sm font-medium whitespace-nowrap text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              autoComplete="off"
              className="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={startDate}
              onChange={handleStartDateChange}
              min={data.oldestDate}
              max={data.newestDate}
            />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="end-date" className="text-sm font-medium whitespace-nowrap text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              autoComplete="off"
              className="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={endDate}
              onChange={handleEndDateChange}
              min={data.oldestDate}
              max={data.newestDate}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold whitespace-nowrap text-accent-500">Chart Type</label>
            <SegmentedToggle
              options={[
                { label: "Area", value: "area" },
                { label: "Columns", value: "columns" },
              ]}
              value={useColumnsOverride ? "columns" : "area"}
              onChange={() => toggleColumn()}
            />
          </div>
        </div>
      </div>

      <div className="h-[60vh] w-full pr-8 2xl:h-[65vh] 3xl:h-[70vh]">
        <AutoSizer
          renderProp={({ height, width }) => (
            <div>
              <Tabs
                value={currentTab}
                onValueChange={(v) => {
                  setCurrentTab(v as TTabNames);
                  if (isLongRange) setUseColumnsOverride(!isLongRange);
                }}
              >
                <div className="pl-10">
                  <TabsList>
                    <TabsTrigger
                      value="hours"
                      className="rounded-none transition-transform duration-100 hover:rounded-t-2xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-90 active:bg-gray-100/50 data-[state=active]:border-b-2 data-[state=active]:border-hours/80 data-[state=active]:p-4"
                    >
                      <MyTabTriggerTitle name="hours" title="Usage Hours" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="leak"
                      className="rounded-none transition-transform duration-100 hover:rounded-t-2xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-90 active:bg-gray-100/50 data-[state=active]:border-b-2 data-[state=active]:border-leak/80 data-[state=active]:p-4"
                    >
                      <MyTabTriggerTitle name="leak" title="Mask Seal" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="events"
                      className="rounded-none transition-transform duration-100 hover:rounded-t-2xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-90 active:bg-gray-100/50 data-[state=active]:border-b-2 data-[state=active]:border-events/80 data-[state=active]:p-4"
                    >
                      <MyTabTriggerTitle name="events" title="Events" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="mask"
                      className="rounded-none transition-transform duration-100 hover:rounded-t-2xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-90 active:bg-gray-100/50 data-[state=active]:border-b-2 data-[state=active]:border-mask/80 data-[state=active]:p-4"
                    >
                      <MyTabTriggerTitle name="mask" title="Mask On/Off" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="score"
                      className="rounded-none transition-transform duration-100 hover:rounded-t-2xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-90 active:bg-gray-100/50 data-[state=active]:border-b-2 data-[state=active]:border-score/80 data-[state=active]:p-4"
                    >
                      <MyTabTriggerTitle name="score" title="myAir Score" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="scoreBreakdown"
                      className="rounded-none transition-transform duration-100 hover:rounded-t-2xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-90 active:bg-gray-100/50 data-[state=active]:border-b-2 data-[state=active]:border-score/80 data-[state=active]:p-4"
                    >
                      <MyTabTriggerTitle name="scoreBreakdown" title="(Breakdown)" />
                    </TabsTrigger>
                  </TabsList>
                </div>
                {!height || !width ? null : (
                  <>
                    <TabsContent value="hours" className="relative">
                      {renderTabChart("hours", height, width)}
                    </TabsContent>
                    <TabsContent value="leak" className="relative">
                      {renderTabChart("leak", height, width)}
                    </TabsContent>
                    <TabsContent value="events" className="relative">
                      {renderTabChart("events", height, width)}
                    </TabsContent>
                    <TabsContent value="mask" className="relative">
                      {renderTabChart("mask", height, width)}
                    </TabsContent>
                    <TabsContent value="score" className="relative">
                      {renderTabChart("score", height, width)}
                    </TabsContent>
                    <TabsContent value="scoreBreakdown" className="relative">
                      {renderTabChart("scoreBreakdown", height, width)}
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default PageContent;
