"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ProjectDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProjectForm } from "./ProjectForm";
import { LinksPanel } from "./LinksPanel";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { parseTags, statusLabel, priorityLabel } from "@/lib/utils";

type Tab = "overview" | "board" | "notes" | "links";

export function ProjectDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [tab, setTab] = useState<Tab>("board");
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) {
      setError("Project not found");
      return;
    }
    setProject(await res.json());
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (cancelled) return;
      if (!res.ok) {
        setError("Project not found");
        return;
      }
      setProject(await res.json());
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function saveProject(form: Record<string, unknown>) {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Update failed");
    setEditOpen(false);
    await load();
  }

  async function deleteProject() {
    if (!confirm("Delete this project and all its tasks/notes?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  }

  if (error) return <p className="text-rose-400">{error}</p>;
  if (!project) return <p className="text-[var(--muted)]">Loading project…</p>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "board", label: "Board" },
    { id: "notes", label: "Notes" },
    { id: "links", label: "Links" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/projects"
            className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--fg)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {project.name}
            </h1>
            <Badge tone={project.status}>{statusLabel(project.status)}</Badge>
            <Badge tone={project.priority}>{priorityLabel(project.priority)}</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            {project.description || "No description"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                <GitBranch className="h-4 w-4" />
                Repo
              </Button>
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4" />
                Live
              </Button>
            </a>
          )}
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={deleteProject}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
          {project.deadline && (
            <span>Deadline {format(new Date(project.deadline), "MMM d, yyyy")}</span>
          )}
          <span>{project.tasks?.length ?? 0} tasks</span>
          <span>{project.notes?.length ?? 0} notes</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {parseTags(project.techStack).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[var(--hover)] px-1.5 py-0.5 text-[11px] text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-indigo-500/15 text-indigo-300"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <h3 className="mb-3 font-semibold">Task breakdown</h3>
            {["todo", "in_progress", "review", "done"].map((s) => {
              const count = (project.tasks || []).filter((t) => t.status === s).length;
              return (
                <div key={s} className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">{statusLabel(s, "task")}</span>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <h3 className="mb-3 font-semibold">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Created</dt>
                <dd>{format(new Date(project.createdAt), "MMM d, yyyy")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Updated</dt>
                <dd>{format(new Date(project.updatedAt), "MMM d, yyyy")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Priority</dt>
                <dd>{priorityLabel(project.priority)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {tab === "board" && (
        <KanbanBoard
          projectId={project.id}
          tasks={project.tasks || []}
          onChange={load}
        />
      )}

      {tab === "notes" && (
        <NotesPanel
          projectId={project.id}
          notes={project.notes || []}
          onChange={load}
        />
      )}

      {tab === "links" && (
        <LinksPanel
          projectId={project.id}
          links={project.links || []}
          onChange={load}
        />
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project" className="max-w-xl">
        <ProjectForm
          initial={project}
          onCancel={() => setEditOpen(false)}
          onSubmit={saveProject}
        />
      </Modal>
    </div>
  );
}
