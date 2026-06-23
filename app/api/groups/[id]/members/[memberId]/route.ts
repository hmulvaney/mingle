import { NextResponse } from "next/server";
import { removeMember, updateMember } from "@/lib/groups";

export const dynamic = "force-dynamic";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const { id, memberId } = await params;
  const body = await request.json().catch(() => ({}));

  const name = str(body.name).trim();
  const email = str(body.email).trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const group = await updateMember(id, memberId, {
    name,
    email,
    phone: str(body.phone),
    linkedin: str(body.linkedin),
    company: str(body.company),
    role: str(body.role),
  });
  if (!group) {
    return NextResponse.json({ error: "Group or member not found" }, { status: 404 });
  }
  return NextResponse.json({ group });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const { id, memberId } = await params;
  const group = await removeMember(id, memberId);
  if (!group) {
    return NextResponse.json({ error: "Group not found or expired" }, { status: 404 });
  }
  return NextResponse.json({ group });
}
