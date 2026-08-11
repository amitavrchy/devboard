import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: { project: { select: { name: true } } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks.map(({ project, ...task }) => ({
    ...task,
    projectName: project.name,
  })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const projectId = body.projectId || (await prisma.project.upsert({
    where: { id: "personal-inbox" },
    create: { id: "personal-inbox", name: "Personal", description: "My everyday tasks and reminders", status: "active" },
    update: {},
  })).id;

  const maxPos = await prisma.task.aggregate({
    where: { projectId, status: body.status ?? "todo" },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      projectId,
      title: body.title?.trim() || "Untitled task",
      description: body.description ?? "",
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      labels: body.labels ?? "",
      checklist: body.checklist ?? "[]",
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  return NextResponse.json(task, { status: 201 });
}
