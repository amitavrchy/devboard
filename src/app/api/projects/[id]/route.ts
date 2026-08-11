import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: [{ status: "asc" }, { position: "asc" }, { updatedAt: "desc" }] },
      notes: { orderBy: { updatedAt: "desc" } },
      links: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of [
    "name",
    "description",
    "status",
    "techStack",
    "repoUrl",
    "liveUrl",
    "priority",
  ] as const) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.deadline !== undefined) {
    data.deadline = body.deadline ? new Date(body.deadline) : null;
  }
  if (body.progress !== undefined) {
    data.progress = Math.max(0, Math.min(100, Number(body.progress) || 0));
  }

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
