import { NextResponse } from "next/server";
import { addMember } from "@/lib/groups";

export const dynamic = "force-dynamic";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const name = str(body.name).trim();
  const email = str(body.email).trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const group = await addMember(id, {
    name,
    email,
    phone: str(body.phone),
    linkedin: str(body.linkedin),
  });
  if (!group) {
    return NextResponse.json({ error: "Group not found or expired" }, { status: 404 });
  }
  return NextResponse.json({ group }, { status: 201 });
}
