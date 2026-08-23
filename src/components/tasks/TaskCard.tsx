"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Calendar, GripVertical, CheckSquare } from "lucide-react";
import type { TaskDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { parseChecklist, parseTags, priorityLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  onClick,
}: {
  task: TaskDTO;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checklist = parseChecklist(task.checklist);
  const doneCount = checklist.filter((c) => c.done).length;
  const labels = parseTags(task.labels);
  const overdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-sm",
        isDragging && "opacity-60 ring-2 ring-indigo-500/40",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-[var(--muted)] active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onClick} className="min-w-0 flex-1 text-left">
          <div className="text-sm font-medium leading-snug">{task.title}</div>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={task.priority}>{priorityLabel(task.priority)}</Badge>
            {labels.slice(0, 2).map((l) => (
              <span
                key={l}
                className="rounded-md bg-[var(--hover)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]"
              >
                {l}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--muted)]">
            {task.dueDate && (
              <span className={cn("inline-flex items-center gap-1", overdue && "text-rose-400")}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
            {checklist.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {doneCount}/{checklist.length}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
