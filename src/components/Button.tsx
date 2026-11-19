import { cn } from "@/lib/utils";

const baseButtonStyles =
  "cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 select-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const variantStyles = {
  primary: "border-accent-700 bg-accent-600 text-white hover:bg-accent-700",
  secondary: "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantStyles;
};

export function Button({ variant = "primary", type = "button", className, ...rest }: ButtonProps) {
  return <button type={type} className={cn(baseButtonStyles, variantStyles[variant], className)} {...rest} />;
}
