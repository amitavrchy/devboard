import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.projectId || !body.url) {
    return NextResponse.json({ error: "projectId and url required" }, { status: 400 });
  }
  const link = await prisma.quickLink.create({
    data: {
      projectId: body.projectId,
      label: body.label?.trim() || "Link",
      url: body.url.trim(),
    },
  });
  return NextResponse.json(link, { status: 201 });
}
