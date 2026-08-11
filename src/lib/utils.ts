import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function joinTags(tags: string[]): string {
  return tags.map((t) => t.trim()).filter(Boolean).join(",");
}

export type ChecklistItem = { id: string; text: string; done: boolean };

export function parseChecklist(raw: string): ChecklistItem[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "done", label: "Done" },
] as const;

export const TASK_STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
] as const;

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export function statusLabel(value: string, kind: "project" | "task" = "project") {
  const list = kind === "project" ? PROJECT_STATUSES : TASK_STATUSES;
  return list.find((s) => s.value === value)?.label ?? value;
}

export function priorityLabel(value: string) {
  return PRIORITIES.find((p) => p.value === value)?.label ?? value;
}
