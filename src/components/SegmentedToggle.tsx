"use client";

import clsx from "clsx";

import logger from "@/lib/logger";

interface Option {
  label: string;
  value: string;
}

interface SegmentedToggleProps {
  options: [Option, Option];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function SegmentedToggle({ options, value, onChange, disabled }: SegmentedToggleProps) {
  const [optionA, optionB] = options;
  const isOptionAActive = value === optionA.value;
  const isOptionBActive = value === optionB.value;
  const isInvalidValue = !isOptionAActive && !isOptionBActive;
  const isDisabled = disabled || isInvalidValue;

  if (isInvalidValue) {
    logger.warn(`SegmentedToggle: Invalid value provided - ${value}`);
  }

  const sharedButtonClass = clsx(
    "cursor-pointer border px-3 py-1.5 text-sm font-medium transition-all duration-200 select-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:outline-none",
  );

  return (
    <div role="radiogroup" aria-label="Select option" className="isolate flex rounded-md shadow-sm">
      <button
        aria-checked={isOptionAActive}
        disabled={isDisabled}
        role="radio"
        type="button"
        onClick={() => {
          if (!isOptionAActive) onChange(optionA.value);
        }}
        className={clsx(
          sharedButtonClass,
          "relative z-0 -mr-px rounded-l-md",
          isOptionAActive
            ? "z-10 border-accent-600 bg-accent-500 text-white shadow-sm"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        )}
      >
        {optionA.label}
      </button>
      <button
        aria-checked={isOptionBActive}
        disabled={isDisabled}
        role="radio"
        type="button"
        onClick={() => {
          if (!isOptionBActive) onChange(optionB.value);
        }}
        className={clsx(
          sharedButtonClass,
          "relative z-0 -ml-px rounded-r-md",
          isOptionBActive
            ? "z-10 border-accent-600 bg-accent-500 text-white shadow-sm"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        )}
      >
        {optionB.label}
      </button>
    </div>
  );
}

export default SegmentedToggle;
