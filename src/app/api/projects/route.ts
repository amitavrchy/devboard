import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const projects = await prisma.project.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
                { techStack: { contains: q } },
              ],
            }
          : {},
        status ? { status } : {},
        priority ? { priority } : {},
      ],
    },
    include: {
      _count: { select: { tasks: true, notes: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name?.trim() || "Untitled Project",
      description: body.description ?? "",
      status: body.status ?? "planning",
      techStack: body.techStack ?? "",
      repoUrl: body.repoUrl ?? "",
      liveUrl: body.liveUrl ?? "",
      deadline: body.deadline ? new Date(body.deadline) : null,
      priority: body.priority ?? "medium",
      progress: Number.isFinite(body.progress) ? body.progress : 0,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
