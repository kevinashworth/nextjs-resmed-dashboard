"use client";

import clsx from "clsx";

const baseInputStyles =
  "rounded border-gray-300 bg-white text-sm text-black shadow-sm focus:border-blue-500 focus:ring-blue-500";
const baseLabelStyles = "text-sm font-semibold whitespace-nowrap text-accent-600";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  labelClassName?: string;
  selectClassName?: string;
}

export function Select({ labelClassName, selectClassName, id, name, ...rest }: SelectProps) {
  const selectName = name || id || undefined;
  const showLabel = !!name;
  const ariaLabel = showLabel ? undefined : selectName || "Select an option";

  return (
    <div className="flex items-center gap-3 bg-white">
      {showLabel && (
        <label className={clsx(baseLabelStyles, labelClassName)} htmlFor={selectName}>
          {selectName}
        </label>
      )}
      <select id={selectName} aria-label={ariaLabel} className={clsx(baseInputStyles, selectClassName)} {...rest} />
    </div>
  );
}
