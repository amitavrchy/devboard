"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { TaskDTO } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import {
  TASK_STATUSES,
  PRIORITIES,
  parseChecklist,
  type ChecklistItem,
} from "@/lib/utils";

function TaskForm({
  task,
  projectId,
  defaultStatus,
  onClose,
  onSaved,
  onDeleted,
}: {
  task?: TaskDTO | null;
  projectId: string;
  defaultStatus?: string;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? defaultStatus ?? "todo");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : "");
  const [labels, setLabels] = useState(task?.labels ?? "");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    parseChecklist(task?.checklist ?? "[]"),
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload = {
      projectId,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      labels,
      checklist: JSON.stringify(checklist),
    };
    const res = await fetch(task ? `/api/tasks/${task.id}` : "/api/tasks", {
      method: task ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) return;
    onSaved();
    onClose();
  }

  async function remove() {
    if (!task) return;
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted?.();
    onClose();
  }

  function addCheckItem() {
    setChecklist((c) => [
      ...c,
      { id: crypto.randomUUID(), text: "", done: false },
    ]);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <Label>Labels (comma-separated)</Label>
          <Input value={labels} onChange={(e) => setLabels(e.target.value)} />
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Checklist</Label>
          <Button type="button" size="sm" variant="ghost" onClick={addCheckItem}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {checklist.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) =>
                  setChecklist((c) =>
                    c.map((x, i) => (i === idx ? { ...x, done: e.target.checked } : x)),
                  )
                }
              />
              <Input
                value={item.text}
                onChange={(e) =>
                  setChecklist((c) =>
                    c.map((x, i) => (i === idx ? { ...x, text: e.target.value } : x)),
                  )
                }
                placeholder="Checklist item"
              />
              <button
                type="button"
                className="text-[var(--muted)] hover:text-rose-400"
                onClick={() => setChecklist((c) => c.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        {task ? (
          <Button type="button" variant="danger" size="sm" onClick={remove}>
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={saving || !title.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TaskModal({
  open,
  onClose,
  task,
  projectId,
  defaultStatus,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  task?: TaskDTO | null;
  projectId: string;
  defaultStatus?: string;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? "Edit task" : "New task"}
      className="max-w-xl"
    >
      {open ? (
        <TaskForm
          key={`${task?.id ?? "new"}-${defaultStatus ?? "todo"}`}
          task={task}
          projectId={projectId}
          defaultStatus={defaultStatus}
          onClose={onClose}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      ) : null}
    </Modal>
  );
}
