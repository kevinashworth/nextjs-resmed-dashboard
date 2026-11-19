import { cn } from "@/lib/utils";

const baseInputStyles =
  "rounded-md border border-gray-300 bg-white py-1.5 text-sm font-normal text-gray-900 shadow-xs transition-all duration-200 focus:ring-accent-500 focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseInputStyles, className)} {...rest} />;
}
