"use client";

import { useState } from "react";
import type { ComponentProps } from "react";

import clsx from "clsx";

type SwitchProps = Omit<ComponentProps<"button">, "children" | "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  label: string;
  onChange?: (checked: boolean) => void;
};

function Switch({
  checked: checkedProp, // Whether or not the switch is checked
  className,
  defaultChecked = false, // Default checked value when using as an uncontrolled component
  disabled = false,
  label,
  onChange,
  onClick,
  ...rest
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : internalChecked;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    const nextChecked = !checked;

    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    onChange?.(nextChecked);
    onClick?.(event);
  }

  return (
    <button
      {...rest}
      aria-checked={checked}
      className={clsx(
        checked ? "bg-accent-500" : "bg-gray-500",
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:outline-hidden",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      onClick={handleClick}
      role="switch"
      type="button"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={clsx(
          checked ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
        )}
      />
    </button>
  );
}

export default Switch;
