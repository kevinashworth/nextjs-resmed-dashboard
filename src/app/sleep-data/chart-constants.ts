"use client";

import { chartColors } from "@/lib/colors";
import type { TTabNames } from "@/lib/data-types";

import type { ApexOptions } from "apexcharts";

// https://stackoverflow.com/a/35970186/7082724
function invertColor(hex: string) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  // invert color components
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str: string, len: number = 2) {
  const zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}
export const tabMap: { [key: number]: TTabNames } = {
  0: "hours",
  1: "leak",
  2: "events",
  3: "mask",
  4: "score",
};

const yAxisOptionsBase = {
  axisTicks: { show: true },
  axisBorder: { show: true },
  labels: {
    formatter: function formatter(d: number) {
      return `${Math.floor(d)}`;
    },
  },
};

const yAxisOptionsHours = {
  max: 600,
  min: 0,
  labels: {
    formatter: function (d: number) {
      return `${Math.floor(d / 60)}`;
    },
  },
  title: {
    text: "Hours",
  },
};

const yAxisOptionsLeak = {
  title: {
    text: "Leak (L/min)",
  },
};

const yAxisOptionsEvents = {
  title: {
    text: "Events",
  },
};

const yAxisOptionsMask = {
  title: {
    text: "On/Off",
  },
};

const yAxisOptionsScore = {
  title: {
    text: "Score",
  },
};

const yAxisOptions = {
  hours: {
    ...yAxisOptionsBase,
    ...yAxisOptionsHours,
  },
  leak: {
    ...yAxisOptionsBase,
    ...yAxisOptionsLeak,
  },
  events: {
    ...yAxisOptionsBase,
    ...yAxisOptionsEvents,
  },
  mask: {
    ...yAxisOptionsBase,
    ...yAxisOptionsMask,
  },
  score: {
    ...yAxisOptionsBase,
    ...yAxisOptionsScore,
  },
};

export const options: ApexOptions = {
  chart: {
    animations: {
      enabled: true,
      speed: 500,
      animateGradually: {
        enabled: false,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
    fontFamily: "Inter, sans-serif",
    dropShadow: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    enabled: true,
  },
  fill: {
    type: "solid",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [0, 4],
  },
  grid: {
    show: true,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: 0,
    },
  },
  xaxis: {
    type: "datetime",
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
};

function getChartOptions(tab: TTabNames): ApexOptions {
  return {
    ...options,
    yaxis: yAxisOptions[tab],
  };
}

export const chartOptions: Record<TTabNames, ApexOptions> = {
  hours: getChartOptions("hours"),
  leak: getChartOptions("leak"),
  events: getChartOptions("events"),
  mask: getChartOptions("mask"),
  score: getChartOptions("score"),
};

export const series: Record<TTabNames, { name?: string; type: string; data: number[]; color: string }[]> = {
  hours: [
    {
      name: "Usage Hours",
      type: "column",
      data: [],
      color: chartColors.hours,
    },
    {
      name: "Usage Hours Moving Average",
      type: "line",
      data: [],
      color: invertColor(chartColors.hours),
    },
  ],
  events: [
    {
      name: "Events",
      type: "column",
      data: [],
      color: chartColors.events,
    },
    {
      name: "Events Moving Average",
      type: "line",
      data: [],
      color: invertColor(chartColors.events),
    },
  ],
  leak: [
    {
      name: "Leak",
      type: "column",
      data: [],
      color: chartColors.leak,
    },
    {
      name: "Leak Moving Average",
      type: "line",
      data: [],
      color: invertColor(chartColors.leak),
    },
  ],
  mask: [
    {
      name: "Mask On/Off",
      type: "column",
      data: [],
      color: chartColors.mask,
    },
    {
      name: "Mask On/Off Moving Average",
      type: "line",
      data: [],
      color: invertColor(chartColors.mask),
    },
  ],
  score: [
    {
      name: "myAir Score",
      type: "column",
      data: [],
      color: chartColors.score,
    },
    {
      name: "myAir Score Moving Average",
      type: "line",
      data: [],
      color: invertColor(chartColors.score),
    },
  ],
};
