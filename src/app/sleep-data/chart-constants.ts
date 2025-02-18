"use client";

import { chartColors } from "@/lib/colors";

import type { TabNames } from "./data-types";
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
export const tabMap: { [key: number]: TabNames } = {
  0: "hours",
  1: "leak",
  2: "events",
  3: "mask",
  4: "score",
};

export const options: ApexOptions = {
  chart: {
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
    x: {
      show: false,
    },
  },
  // fill: {
  //   type: ["gradient", "solid"],
  //   opacity: [0.85, 1],
  //   gradient: {
  //     opacityFrom: 0.55,
  //     opacityTo: 0.25,
  //     shade: "#1C64F2",
  //     gradientToColors: ["#1C64F2"],
  //   },
  // },
  fill: {
    opacity: [0.75, 1],
  },
  // fill: {
  //   gradient: {
  //     opacityFrom: 0.55,
  //     opacityTo: 0.25,
  //     shade: "#1C64F2",
  //     gradientToColors: ["#1C64F2"],
  //   },
  // },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [1, 2],
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
    // categories: categories,
    labels: {
      formatter: function (d) {
        const date = new Date(d);
        return date.getDay() === 0 ? d.substring(5) : "";
      },
      style: {
        fontSize: "10px",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
};

export const series: Record<TabNames, { name?: string; type: string; data: number[]; color: string }[]> = {
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
