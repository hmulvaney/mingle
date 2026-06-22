import { NextResponse } from "next/server";
import { getGroup } from "@/lib/groups";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) {
    return NextResponse.json({ error: "Group not found or expired" }, { status: 404 });
  }
  return NextResponse.json({ group });
}
