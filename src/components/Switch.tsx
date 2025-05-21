"use client";

import { ComponentProps, useState } from "react";

import { Switch as LibSwitch } from "@headlessui/react";
import { cx } from "class-variance-authority";

export function Switch({
  defaultChecked,
  label,
  onChange,
  ...rest
}: { label: string } & ComponentProps<typeof LibSwitch>) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <LibSwitch
      {...rest}
      checked={checked}
      className={cx(
        checked ? "bg-accent-600" : "bg-gray-600",
        "focus:ring-accent-600 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
      )}
      onChange={(checked) => {
        setChecked(checked);
        onChange?.(checked);
      }}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={cx(
          checked ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
        )}
      />
    </LibSwitch>
  );
}
