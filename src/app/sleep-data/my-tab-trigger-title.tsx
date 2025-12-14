import React, { ComponentType } from "react";

import { cx } from "class-variance-authority";

import type { TTabNames } from "@/lib/data-types";

import EventsIcon from "./icons/icon-events";
import HoursIcon from "./icons/icon-hours";
import LeakIcon from "./icons/icon-leak";
import MaskIcon from "./icons/icon-mask";
import ScoreIcon from "./icons/icon-score";

type FillClassMap = {
  [key in TTabNames]: string;
};
const fillClass: FillClassMap = {
  events: "fill-events",
  hours: "fill-hours",
  leak: "fill-leak",
  mask: "fill-mask",
  score: "fill-score",
};

type IconComponentMap = {
  [key in TTabNames]: ComponentType<{ className?: string }>;
};
const iconComponent: IconComponentMap = {
  events: EventsIcon,
  hours: HoursIcon,
  leak: LeakIcon,
  mask: MaskIcon,
  score: ScoreIcon,
};

interface Props {
  name: TTabNames;
  title: string;
}

function MyTabTriggerTitle({ name = "events", title = "Events" }: Props) {
  const IconComponent = iconComponent[name];
  return (
    <div className="flex flex-col items-center justify-start">
      <IconComponent className={cx(fillClass[name], "size-12")} />
      <h2 className="text-xs font-medium whitespace-nowrap text-gray-500 uppercase">{title}</h2>
      <div className="h-0 w-24 bg-white in-[.active]:bg-gray-50"></div>
    </div>
  );
}

export default MyTabTriggerTitle;
