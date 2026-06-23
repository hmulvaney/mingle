"use client";

import { useState } from "react";
import Link from "next/link";

interface Created {
  id: string;
  name: string;
}

export default function NewGroupPage() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Groups created this session, newest first, so you can spin up several in a
  // row (e.g. one per LinkedIn post) and copy each shareable link.
  const [created, setCreated] = useState<Created[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      setCreated((prev) => [{ id: group.id, name: group.name }, ...prev]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function linkFor(id: string): string {
    if (typeof window === "undefined") return `/g/${id}`;
    return `${window.location.origin}/g/${id}`;
  }

  async function copyLink(id: string) {
    try {
      await navigator.clipboard.writeText(linkFor(id));
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800);
    } catch {
      /* clipboard unavailable — the link is shown for manual copy */
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
        Name your event and get a link to share. Make as many as you like — each
        has its own join page. Post a link on LinkedIn or drop it in a chat and
        anyone who opens it joins that group.
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
          {submitting
            ? "Creating…"
            : created.length
              ? "Create another group"
              : "Create group"}
        </button>
      </form>

      {created.length > 0 && (
        <div className="stack" style={{ marginTop: 20 }}>
          {created.map((g) => (
            <div className="card stack" key={g.id}>
              <span className="name">{g.name}</span>
              <p className="muted" style={{ wordBreak: "break-all" }}>
                {linkFor(g.id)}
              </p>
              <div className="row-between" style={{ gap: 10 }}>
                <button
                  className="btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => copyLink(g.id)}
                >
                  {copiedId === g.id ? "Link copied ✓" : "Copy link"}
                </button>
                <Link
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  href={`/g/${g.id}`}
                >
                  Open group →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="divider" />
      <p className="muted">
        <Link className="link" href="/">
          ← Back
        </Link>
      </p>
    </main>
  );
}
