"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your event a name.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Could not create the group.");
      const { group } = await res.json();
      router.push(`/g/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="wrap">
      <div className="brand">
        <span className="dot" />
        <span className="gradient-name">Mingle</span>
      </div>
      <h1>Start a new group</h1>
      <p className="lead">
        Name your event. Everyone who scans the QR will join this group and can
        see each other&apos;s contacts.
      </p>

      <form className="card stack" onSubmit={onSubmit}>
        <div>
          <label htmlFor="name">Event name</label>
          <input
            id="name"
            autoFocus
            placeholder="e.g. AI Founders Mixer · June"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create group"}
        </button>
      </form>

      <hr className="divider" />
      <p className="muted">
        <Link className="link" href="/">
          ← Back
        </Link>
      </p>
    </main>
  );
}
