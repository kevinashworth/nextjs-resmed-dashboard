"use client";

import clsx from "clsx";

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
  const [first, second] = options;
  const isFirstActive = value === first.value;

  return (
    <div className="flex shadow-sm">
      <button
        disabled={disabled}
        onClick={() => {
          if (!isFirstActive) onChange(first.value);
        }}
        className={clsx(
          "relative px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          "rounded-l-md",
          isFirstActive
            ? "z-10 border border-accent-600 bg-accent-500 text-white"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        )}
      >
        {first.label}
      </button>
      <button
        disabled={disabled}
        onClick={() => {
          if (isFirstActive) onChange(second.value);
        }}
        className={clsx(
          "relative px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          "-ml-px rounded-r-md",
          !isFirstActive
            ? "z-10 border border-accent-600 bg-accent-500 text-white"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        )}
      >
        {second.label}
      </button>
    </div>
  );
}

export default SegmentedToggle;
