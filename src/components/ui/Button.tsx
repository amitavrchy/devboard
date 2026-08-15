import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-indigo-500 text-white hover:bg-indigo-400 shadow-sm shadow-indigo-500/20",
  secondary:
    "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 ring-1 ring-zinc-700",
  ghost: "bg-transparent text-zinc-300 hover:bg-zinc-800/80",
  danger: "bg-rose-500/90 text-white hover:bg-rose-500",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
