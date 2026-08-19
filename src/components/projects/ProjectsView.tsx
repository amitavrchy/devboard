"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, ExternalLink, GitBranch } from "lucide-react";
import type { ProjectDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProjectForm } from "./ProjectForm";
import { parseTags, statusLabel, priorityLabel, PROJECT_STATUSES, PRIORITIES } from "@/lib/utils";

export function ProjectsView() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    const res = await fetch(`/api/projects?${params.toString()}`);
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, [q, status, priority]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function createProject(form: Record<string, unknown>) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Could not create project");
    setOpen(false);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">My projects</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            My builds, side projects, and personal plans in one place.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Search name, description, stackâ€¦"
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

      {loading ? (
        <p className="text-[var(--muted)]">Loading projectsâ€¦</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--muted)]">
          No projects match these filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold group-hover:text-indigo-300">{p.name}</h2>
                <Badge tone={p.status}>{statusLabel(p.status)}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                {p.description || "No description"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {parseTags(p.techStack).slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--hover)] px-1.5 py-0.5 text-[11px] text-[var(--muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>{p.progress}%</span>
                  <span>{p._count?.tasks ?? 0} tasks</span>
                </div>
                <ProgressBar value={p.progress} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                <Badge tone={p.priority}>{priorityLabel(p.priority)}</Badge>
                <div className="flex items-center gap-2">
                  {p.repoUrl && <GitBranch className="h-3.5 w-3.5" />}
                  {p.liveUrl && <ExternalLink className="h-3.5 w-3.5" />}
                  {p.deadline && <span>Due {format(new Date(p.deadline), "MMM d")}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New project">
        <ProjectForm
          onCancel={() => setOpen(false)}
          onSubmit={createProject}
          submitLabel="Create project"
        />
      </Modal>
    </div>
  );
}

