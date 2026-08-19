"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, isBefore, isSameDay, startOfDay } from "date-fns";
import { CheckCircle2, ListTodo, Plus } from "lucide-react";
import type { ProjectDTO, TaskDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { TaskModal } from "@/components/tasks/TaskModal";
import { cn, priorityLabel, statusLabel } from "@/lib/utils";

type PersonalTask = TaskDTO & { projectName: string };
const filters = ["All tasks", "Today", "Overdue", "Upcoming", "Completed"] as const;
type Filter = typeof filters[number];
const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function DashboardView() {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [filter, setFilter] = useState<Filter>("All tasks");
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PersonalTask | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const [taskRes, projectRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/projects")]);
      if (!taskRes.ok || !projectRes.ok) throw new Error("Couldn't load your tasks. Please try again.");
      const [nextTasks, nextProjects] = await Promise.all([taskRes.json(), projectRes.json()]);
      setTasks(nextTasks);
      setProjects(nextProjects);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your tasks.");
    } finally {
      setToday(startOfDay(new Date()));
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), projectId: projectId || undefined, dueDate: dueDate || null }),
      });
      if (!res.ok) throw new Error("Couldn't add this task. Please try again.");
      setTitle("");
      setDueDate("");
      setFilter("All tasks");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: PersonalTask) {
    setPending((ids) => [...ids, task.id]);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: task.status === "done" ? "todo" : "done" }),
      });
      if (!res.ok) throw new Error("Couldn't update this task. Please try again.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update this task.");
    } finally {
      setPending((ids) => ids.filter((id) => id !== task.id));
    }
  }

  if (!today) return <p className="text-sm text-[var(--muted)]">Loading your tasks…</p>;
  // Deadlines are date-only values stored at midnight UTC.
  const taskDay = (task: PersonalTask) => task.dueDate ? new Date(`${task.dueDate.slice(0, 10)}T00:00:00`) : null;
  const matches = (task: PersonalTask, tab: Filter) => {
    const day = taskDay(task);
    if (tab === "Completed") return task.status === "done";
    if (task.status === "done") return false;
    if (tab === "Today") return !!day && isSameDay(day, today);
    if (tab === "Overdue") return !!day && isBefore(day, today);
    if (tab === "Upcoming") return !!day && day > today;
    return true;
  };
  const visible = tasks.filter((t) => matches(t, filter)).sort((a, b) => {
    const dateOrder = (taskDay(a)?.getTime() ?? Infinity) - (taskDay(b)?.getTime() ?? Infinity);
    return (Number.isNaN(dateOrder) ? 0 : dateOrder) || (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
  });
  const stats = [
    { label: "Left to do", value: tasks.filter((t) => t.status !== "done").length },
    { label: "For today", value: tasks.filter((t) => matches(t, "Today")).length },
    { label: "Overdue", value: tasks.filter((t) => matches(t, "Overdue")).length },
    { label: "Completed", value: tasks.filter((t) => t.status === "done").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-[var(--muted)]">{format(today, "EEEE, MMMM d")}</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Let&apos;s get things done, Amitav.</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Your personal tasks, side projects, and everyday reminders. One thing at a time.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{loading ? "—" : stat.value}</p>
          </div>
        ))}
      </div>
      <form onSubmit={addTask} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <label htmlFor="quick-task" className="block text-sm font-medium">What do you need to do?</label>
        <div className="flex flex-col gap-3 xl:flex-row">
          <Input id="quick-task" placeholder="Add something to your list…" value={title} onChange={(e) => setTitle(e.target.value)} required className="min-w-0 flex-1" />
          <Select aria-label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="xl:w-52">
            <option value="">Personal</option>
            {projects.filter((p) => p.id !== "personal-inbox").map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input type="date" aria-label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="xl:w-44" />
          <Button type="submit" disabled={saving || !title.trim()}><Plus className="h-4 w-4" />{saving ? "Adding…" : "Add task"}</Button>
        </div>
      </form>
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-500/30 p-4 text-sm text-rose-400">{error}<Button variant="ghost" size="sm" onClick={() => void load()}>Retry</Button></div>}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] p-4" role="group" aria-label="Filter tasks">
          {filters.map((tab) => <button key={tab} onClick={() => setFilter(tab)} aria-pressed={filter === tab} className={cn("rounded-lg px-3 py-2 text-sm transition", filter === tab ? "bg-indigo-500/15 text-indigo-400" : "text-[var(--muted)] hover:bg-[var(--hover)]")}>
            {tab} <span className="ml-1 text-xs opacity-70">{tasks.filter((t) => matches(t, tab)).length}</span>
          </button>)}
        </div>
        {loading ? <p className="p-8 text-sm text-[var(--muted)]">Loading your tasks…</p> : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
            {filter === "Completed" ? <CheckCircle2 className="h-8 w-8 text-emerald-400" /> : <ListTodo className="h-8 w-8 text-indigo-400" />}
            <p className="font-medium">{filter === "Overdue" ? "All caught up." : filter === "Today" ? "A clear day ahead." : filter === "Completed" ? "Your wins will show up here." : "A little space to plan what’s next."}</p>
            <p className="text-sm text-[var(--muted)]">{filter === "Overdue" ? "You have no overdue tasks." : "Add a task above or choose another filter."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {visible.map((task) => {
              const day = taskDay(task);
              const overdue = task.status !== "done" && !!day && isBefore(day, today);
              return <li key={task.id} className="flex items-start gap-3 px-4 py-4 transition hover:bg-[var(--hover)] md:px-5">
                <input type="checkbox" checked={task.status === "done"} disabled={pending.includes(task.id)} onChange={() => void toggleTask(task)} aria-label={`Mark ${task.title} as ${task.status === "done" ? "to do" : "done"}`} className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-indigo-500" />
                <div className="min-w-0 flex-1">
                  <button onClick={() => setEditing(task)} className={cn("break-words text-left text-sm font-medium hover:text-indigo-400", task.status === "done" && "text-[var(--muted)] line-through")}>{task.title}</button>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                    <Link href={`/projects/${task.projectId}`} className="hover:text-indigo-400">{task.projectName}</Link>
                    {day && <span className={overdue ? "text-rose-400" : ""}>{overdue ? "Overdue · " : ""}{isSameDay(day, today) ? "Today" : format(day, "MMM d, yyyy")}</span>}
                    <span>{statusLabel(task.status, "task")}</span>
                  </div>
                </div>
                <Badge tone={task.priority}>{priorityLabel(task.priority)}</Badge>
              </li>;
            })}
          </ul>
        )}
      </section>
      {editing && <TaskModal open onClose={() => setEditing(null)} task={editing} projectId={editing.projectId} onSaved={() => void load()} onDeleted={() => void load()} />}
    </div>
  );
}
