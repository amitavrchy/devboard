"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Moon,
  Sun,
  Layers3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

const nav = [
  { href: "/", label: "My tasks", icon: LayoutDashboard },
  { href: "/projects", label: "My projects", icon: FolderKanban },
  { href: "/search", label: "Search", icon: Search },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--panel)] p-4 md:flex">
          <div className="mb-8 flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Amitav&apos;s Todo</div>
              <div className="text-[11px] text-[var(--muted)]">My day, one task at a time</div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30"
                      : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={toggle}
            className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-indigo-400" />
              <span className="font-semibold">Amitav&apos;s Todo</span>
            </div>
            <div className="flex items-center gap-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      "rounded-lg p-2",
                      active ? "bg-indigo-500/20 text-indigo-300" : "text-[var(--muted)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
              <button onClick={toggle} aria-label="Toggle theme" className="rounded-lg p-2 text-[var(--muted)]">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
