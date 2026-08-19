"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { PROJECT_STATUSES, PRIORITIES } from "@/lib/utils";
import type { ProjectDTO } from "@/lib/types";

type FormState = {
  name: string;
  description: string;
  status: string;
  techStack: string;
  repoUrl: string;
  liveUrl: string;
  deadline: string;
  priority: string;
  progress: number;
};

function toForm(p?: ProjectDTO | null): FormState {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    status: p?.status ?? "planning",
    techStack: p?.techStack ?? "",
    repoUrl: p?.repoUrl ?? "",
    liveUrl: p?.liveUrl ?? "",
    deadline: p?.deadline ? p.deadline.slice(0, 10) : "",
    priority: p?.priority ?? "medium",
    progress: p?.progress ?? 0,
  };
}

export function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save project",
}: {
  initial?: ProjectDTO | null;
  onSubmit: (data: FormState) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<FormState>(toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormState, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="PeopleOS"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What is this project about?"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label>Tech stack (comma-separated)</Label>
        <Input
          value={form.techStack}
          onChange={(e) => set("techStack", e.target.value)}
          placeholder="Next.js, Prisma, MongoDB"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Repo URL</Label>
          <Input
            value={form.repoUrl}
            onChange={(e) => set("repoUrl", e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <Label>Live URL</Label>
          <Input
            value={form.liveUrl}
            onChange={(e) => set("liveUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Deadline</Label>
          <Input
            type="date"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </div>
        <div>
          <Label>Progress ({form.progress}%)</Label>
          <Input
            type="range"
            min={0}
            max={100}
            value={form.progress}
            onChange={(e) => set("progress", Number(e.target.value))}
          />
        </div>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
