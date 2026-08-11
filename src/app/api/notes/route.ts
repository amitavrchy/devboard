import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }
  const note = await prisma.note.create({
    data: {
      projectId: body.projectId,
      title: body.title?.trim() || "Untitled note",
      content: body.content ?? "",
    },
  });
  return NextResponse.json(note, { status: 201 });
}
