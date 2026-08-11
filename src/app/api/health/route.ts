import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.project.count();
    return NextResponse.json({ ok: true, projects: count });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : "Error";
    return NextResponse.json({ ok: false, name, message }, { status: 500 });
  }
}
