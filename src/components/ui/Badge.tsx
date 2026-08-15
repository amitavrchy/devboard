import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  planning: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  active: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  on_hold: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  done: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  todo: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  in_progress: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  review: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  low: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/20",
  medium: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  high: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  urgent: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  default: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone] || tones.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
