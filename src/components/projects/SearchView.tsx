"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProjectDTO } from "@/lib/types";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PROJECT_STATUSES, PRIORITIES, statusLabel, priorityLabel, parseTags } from "@/lib/utils";

export function SearchView() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      const res = await fetch(`/api/projects?${params.toString()}`);
      setProjects(await res.json());
    }, 200);
    return () => clearTimeout(t);
  }, [q, status, priority]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Search</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Filter across project names, descriptions, and tech stacks.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          autoFocus
          placeholder="Type to search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 transition hover:border-indigo-500/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{p.name}</h2>
              <div className="flex gap-2">
                <Badge tone={p.status}>{statusLabel(p.status)}</Badge>
                <Badge tone={p.priority}>{priorityLabel(p.priority)}</Badge>
              </div>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {parseTags(p.techStack).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--hover)] px-1.5 py-0.5 text-[11px] text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <ProgressBar value={p.progress} className="mt-3" />
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No matches.</p>
        )}
      </div>
    </div>
  );
}
