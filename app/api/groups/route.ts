import { NextResponse } from "next/server";
import { createGroup } from "@/lib/groups";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "Event name is required" }, { status: 400 });
  }
  const group = await createGroup(name);
  return NextResponse.json({ group }, { status: 201 });
}
