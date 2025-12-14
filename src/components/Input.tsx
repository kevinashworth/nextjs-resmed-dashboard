"use client";

import { cx } from "class-variance-authority";

const baseInputStyles =
  "block w-full rounded-md border-0 py-1.5 shadow-xs ring-1 ring-inset ring-accent-200 focus:ring-2 focus:ring-inset focus:ring-accent-500 sm:text-sm sm:leading-6";

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(baseInputStyles, className)} {...rest} />;
}

export function Select({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(baseInputStyles, "**:text-black", className)} {...rest} />;
}
