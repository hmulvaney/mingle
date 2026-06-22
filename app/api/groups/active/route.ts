import { NextResponse } from "next/server";
import { getActiveGroup } from "@/lib/groups";

export const dynamic = "force-dynamic";

export async function GET() {
  const group = await getActiveGroup();
  return NextResponse.json({ group });
}
