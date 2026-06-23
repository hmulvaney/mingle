"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EndEventButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="btn-ghost"
      style={{ fontSize: 13, padding: "8px 14px" }}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/groups/active", { method: "DELETE" });
        router.refresh();
      }}
    >
      {busy ? "Ending…" : "End this event"}
    </button>
  );
}
