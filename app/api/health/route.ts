import { NextResponse } from "next/server";
import { storageBackend } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ storage: storageBackend });
}
