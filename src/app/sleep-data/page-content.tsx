"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import Chart from "react-apexcharts";
import AutoSizer from "react-virtualized-auto-sizer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { options, series } from "./chart-constants";
import { movingAverage } from "./chart-utils";
import { AllData } from "./data-types";
import MyTabTriggerTitle from "./my-tab-trigger-title";

import type { SelectedPreset, TabNames } from "./data-types";

function PageContent({ data }: { data: AllData }) {
  const [selectedPreset, setSelectedPreset] = useState<SelectedPreset>("last60");
  const [startDate, setStartDate] = useState(data.oldestDate);
  const [endDate, setEndDate] = useState(data.newestDate);

  const [chartOptions, setChartOptions] = useState(options);

  // run once on mount
  useEffect(() => {
    const sixtyDaysAgo = new Date(data.newestDate).getTime() - 60 * 24 * 60 * 60 * 1000;
    setStartDate(new Date(sixtyDaysAgo).toISOString().split("T")[0]);

    setChartOptions((prev) => ({
      ...prev,
      xaxis: {
        ...prev.xaxis,
        categories: categories,
      },
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter data based on selected date range
  const dateFilter = (d: { date: string | number | Date }): boolean => {
    const date = new Date(d.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  };
  const filteredData = {
    events: data.events.filter(dateFilter),
    hours: data.hours.filter(dateFilter),
    leak: data.leak.filter(dateFilter),
    mask: data.mask.filter(dateFilter),
    score: data.score.filter(dateFilter),
  };
  const categories = filteredData.events.map((d) => d.date);

  const getSeries = (tab: TabNames) => {
    return [
      {
        ...series[tab][0],
        data: filteredData[tab].map((d) => d.value),
      },
      {
        ...series[tab][1],
        data: movingAverage(filteredData[tab], 7).map((d) => d.value),
      },
    ];
  };

  function handlePresetChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextPreset = event.target.value as SelectedPreset;
    setSelectedPreset(nextPreset);

    const newestDate = new Date(data.newestDate);
    let end = data.newestDate;
    let start = data.oldestDate;

    switch (nextPreset) {
      case "last30": {
        const thirtyDaysAgo = new Date(newestDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        start = thirtyDaysAgo.toISOString().split("T")[0];
        break;
      }
      // default
      case "last60": {
        const sixtyDaysAgo = new Date(newestDate.getTime() - 60 * 24 * 60 * 60 * 1000);
        start = sixtyDaysAgo.toISOString().split("T")[0];
        break;
      }
      case "last90": {
        const ninetyDaysAgo = new Date(newestDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        start = ninetyDaysAgo.toISOString().split("T")[0];
        break;
      }
      case "last180": {
        const oneEightyDaysAgo = new Date(newestDate.getTime() - 180 * 24 * 60 * 60 * 1000);
        start = oneEightyDaysAgo.toISOString().split("T")[0];
        break;
      }
      case "lastMonth": {
        const firstDayLastMonth = new Date(newestDate.getFullYear(), newestDate.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(newestDate.getFullYear(), newestDate.getMonth(), 0);
        start = firstDayLastMonth.toISOString().split("T")[0];
        end = lastDayLastMonth.toISOString().split("T")[0];
        break;
      }
      case "lastYear": {
        const firstDayLastYear = new Date(newestDate.getFullYear() - 1, 0, 1);
        const lastDayLastYear = new Date(newestDate.getFullYear(), 0, 0);
        start = firstDayLastYear.toISOString().split("T")[0];
        end = lastDayLastYear.toISOString().split("T")[0];
        break;
      }
      case "thisMonth": {
        const firstDayThisMonth = new Date(newestDate.getFullYear(), newestDate.getMonth(), 1);
        const lastDayThisMonth = new Date(newestDate.getFullYear(), newestDate.getMonth() + 1, 0);
        start = firstDayThisMonth.toISOString().split("T")[0];
        end = lastDayThisMonth.toISOString().split("T")[0];
        break;
      }
      case "thisYear": {
        const firstDayThisYear = new Date(newestDate.getFullYear(), 0, 1);
        start = firstDayThisYear.toISOString().split("T")[0];
        // end = newestDate.toISOString().split("T")[0];
        break;
      }
      case "allTime": {
        start = new Date(data.oldestDate).toISOString().split("T")[0];
        // end = newestDate.toISOString().split("T")[0];
        break;
      }
      case "custom": {
        setSelectedPreset(nextPreset);
        return;
      }
    }
    setStartDate(start);
    setEndDate(end);
  }

  function handleCustomDateChange() {
    setSelectedPreset("custom");
  }

  return (
    <div className="">
      {/* <!-- Date Range Controls --> */}
      <div className="mb-6 inline-block rounded-lg p-4">
        <h1 className="mb-4 text-xl font-bold text-accent-500">ResMed Sleep Data</h1>
        <div className="flex flex-row items-start gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="preset-range" className="whitespace-nowrap text-sm font-semibold text-accent-500">
              Date Range
            </label>
            <select
              id="preset-range"
              className="rounded border-gray-300 text-sm shadow focus:border-blue-500 focus:ring-blue-500"
              value={selectedPreset}
              onChange={handlePresetChange}
            >
              <option value="last30">Last 30 Days</option>
              <option value="last60">Last 60 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="last180">Last 180 Days</option>
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
              className="rounded border-gray-300 text-sm shadow focus:border-blue-500 focus:ring-blue-500"
              value={startDate}
              onChange={handleCustomDateChange}
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
              className="rounded border-gray-300 text-sm shadow focus:border-blue-500 focus:ring-blue-500"
              value={endDate}
              onChange={handleCustomDateChange}
              min={data.oldestDate}
              max={data.newestDate}
            />
          </div>
        </div>
      </div>

      <div className="h-[60vh] w-full">
        <AutoSizer>
          {({ height, width }) => (
            <div className="flex flex-row justify-between">
              <Tabs defaultValue="hours" className="w-[400px]">
                <TabsList>
                  <TabsTrigger
                    value="hours"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-hours/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="hours" title="Usage Hours" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="events"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-events/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="events" title="Events" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="leak"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-leak/80 data-[state=active]:p-4"
                  >
                    <MyTabTriggerTitle name="leak" title="Leak" />
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
                  <Chart options={chartOptions} series={getSeries("hours")} height={height} width={width} />
                </TabsContent>
                <TabsContent value="events">
                  <Chart options={chartOptions} series={getSeries("events")} height={height} width={width} />
                </TabsContent>
                <TabsContent value="leak">
                  <Chart options={chartOptions} series={getSeries("leak")} height={height} width={width} />
                </TabsContent>
                <TabsContent value="mask">
                  <Chart options={chartOptions} series={getSeries("mask")} height={height} width={width} />
                </TabsContent>
                <TabsContent value="score">
                  <Chart options={chartOptions} series={getSeries("score")} height={height} width={width} />
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
