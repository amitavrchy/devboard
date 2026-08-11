import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, addDays } from "date-fns";

export async function GET() {
  const now = startOfDay(new Date());
  const soon = addDays(now, 14);

  const [projects, tasks, overdueTasks, upcomingProjects] = await Promise.all([
    prisma.project.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.task.findMany(),
    prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: "done" },
      },
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.project.findMany({
      where: {
        deadline: { gte: now, lte: soon },
        status: { not: "done" },
      },
      orderBy: { deadline: "asc" },
    }),
  ]);

  const projectCounts: Record<string, number> = {};
  for (const p of projects) {
    projectCounts[p.status] = (projectCounts[p.status] || 0) + 1;
  }

  const tasksByStatus: Record<string, number> = {};
  for (const t of tasks) {
    tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
  }

  return NextResponse.json({
    projectCounts,
    totalProjects: projects.length,
    totalTasks: tasks.length,
    tasksByStatus,
    overdueTasks: overdueTasks.map((t) => ({
      ...t,
      projectName: t.project.name,
    })),
    upcomingDeadlines: upcomingProjects.map((p) => ({
      id: p.id,
      name: p.name,
      deadline: p.deadline,
      progress: p.progress,
      status: p.status,
    })),
    projectsProgress: projects.map((p) => ({
      id: p.id,
      name: p.name,
      progress: p.progress,
      status: p.status,
    })),
  });
}
