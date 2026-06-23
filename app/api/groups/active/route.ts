import { NextResponse } from "next/server";
import { clearActiveGroup, getActiveGroup } from "@/lib/groups";

export const dynamic = "force-dynamic";

export async function GET() {
  const group = await getActiveGroup();
  return NextResponse.json({ group });
}

export async function DELETE() {
  await clearActiveGroup();
  return NextResponse.json({ ok: true });
}
