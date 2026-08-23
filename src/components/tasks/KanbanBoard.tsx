"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { TaskDTO } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";

function Column({
  status,
  label,
  tasks,
  onAdd,
  onOpen,
}: {
  status: string;
  label: string;
  tasks: TaskDTO[];
  onAdd: () => void;
  onOpen: (task: TaskDTO) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] w-72 shrink-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--panel)] ${
        isOver ? "ring-2 ring-indigo-500/40" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-3">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-[11px] text-[var(--muted)]">{tasks.length} tasks</div>
        </div>
        <Button size="sm" variant="ghost" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onOpen(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({
  projectId,
  tasks,
  onChange,
}: {
  projectId: string;
  tasks: TaskDTO[];
  onChange: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byStatus = useMemo(() => {
    const map: Record<string, TaskDTO[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const t of tasks) {
      (map[t.status] || map.todo).push(t);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [tasks]);

  const activeTask = tasks.find((t) => t.id === activeId) || null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let nextStatus = task.status;
    const overId = String(over.id);

    if (TASK_STATUSES.some((s) => s.value === overId)) {
      nextStatus = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) nextStatus = overTask.status;
    }

    if (nextStatus === task.status && overId === taskId) return;

    const columnTasks = tasks
      .filter((t) => t.id !== taskId && t.status === nextStatus)
      .sort((a, b) => a.position - b.position);

    let newIndex = columnTasks.length;
    if (!TASK_STATUSES.some((s) => s.value === overId)) {
      const idx = columnTasks.findIndex((t) => t.id === overId);
      if (idx >= 0) newIndex = idx;
    }

    columnTasks.splice(newIndex, 0, { ...task, status: nextStatus });

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, position: newIndex }),
    });

    await Promise.all(
      columnTasks.map((t, i) =>
        t.id === taskId
          ? Promise.resolve()
          : fetch(`/api/tasks/${t.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ position: i }),
            }),
      ),
    );

    onChange();
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {TASK_STATUSES.map((col) => (
            <Column
              key={col.value}
              status={col.value}
              label={col.label}
              tasks={byStatus[col.value] || []}
              onAdd={() => {
                setEditing(null);
                setDefaultStatus(col.value);
                setModalOpen(true);
              }}
              onOpen={(task) => {
                setEditing(task);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-72 rounded-xl border border-indigo-500/40 bg-[var(--panel)] p-3 shadow-xl">
              <div className="text-sm font-medium">{activeTask.title}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editing}
        projectId={projectId}
        defaultStatus={defaultStatus}
        onSaved={onChange}
        onDeleted={onChange}
      />
    </div>
  );
}
