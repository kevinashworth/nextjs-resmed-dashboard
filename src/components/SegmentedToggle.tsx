"use client";

import clsx from "clsx";

interface Option {
  label: string;
  value: string;
}

interface SegmentedToggleProps {
  options: [Option, Option];
  value: string;
  onChange: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

function SegmentedToggle({ options, value, onChange, disabled }: SegmentedToggleProps) {
  const [first, second] = options;
  const isFirstActive = value === first.value;
  const isSecondActive = value === second.value;
  const isDisabled = disabled || (!isFirstActive && !isSecondActive);

  return (
    <div className="flex shadow-sm">
      <button
        disabled={isDisabled}
        onClick={onChange}
        className={clsx(
          "relative px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          "rounded-l-md",
          isFirstActive
            ? "z-10 border border-accent-600 bg-accent-500 text-white"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        )}
      >
        {first.label}
      </button>
      <button
        disabled={isDisabled}
        onClick={onChange}
        className={clsx(
          "relative px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          "-ml-px rounded-r-md",
          isSecondActive
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
