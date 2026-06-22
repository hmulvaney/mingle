"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Group, Member } from "@/lib/types";

function linkedinUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes("linkedin.com")) return `https://${v}`;
  return `https://www.linkedin.com/in/${v.replace(/^@/, "")}`;
}

function vcard(m: Member): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${m.name}`,
    m.email ? `EMAIL;TYPE=INTERNET:${m.email}` : "",
    m.phone ? `TEL;TYPE=CELL:${m.phone}` : "",
    linkedinUrl(m.linkedin) ? `URL:${linkedinUrl(m.linkedin)}` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}

function downloadVcard(m: Member) {
  const blob = new Blob([vcard(m)], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${m.name.replace(/[^a-z0-9]+/gi, "-") || "contact"}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

function useCountdown(expiresAt: number | undefined): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!expiresAt) return "";
  const ms = expiresAt - now;
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (hours >= 1) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export default function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const storageKey = `mingle:joined:${id}`;

  const [group, setGroup] = useState<Group | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [joined, setJoined] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const myId = useRef<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/groups/${id}`, { cache: "no-store" });
    if (res.status === 404) {
      setStatus("missing");
      return;
    }
    const { group: g } = await res.json();
    setGroup(g);
    setStatus("ready");
  }, [id]);

  useEffect(() => {
    myId.current = localStorage.getItem(storageKey);
    setJoined(Boolean(myId.current));
    load();
  }, [load, storageKey]);

  // Poll for new members once you've joined so the directory stays live.
  useEffect(() => {
    if (!joined) return;
    const t = setInterval(load, 5_000);
    return () => clearInterval(t);
  }, [joined, load]);

  const countdown = useCountdown(group?.expiresAt);

  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/groups/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not join.");
      setGroup(data.group);
      const mine = data.group.members[data.group.members.length - 1];
      myId.current = mine.id;
      localStorage.setItem(storageKey, mine.id);
      setJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="wrap">
        <div className="brand">
          <span className="dot" />
          Mingle
        </div>
        <p className="lead">Loading…</p>
      </main>
    );
  }

  if (status === "missing" || !group) {
    return (
      <main className="wrap">
        <div className="brand">
          <span className="dot" />
          Mingle
        </div>
        <h1>This group has expired</h1>
        <p className="lead">
          Mingle groups disappear 48 hours after they&apos;re created. Start a
          fresh one for your next event.
        </p>
        <Link className="btn btn-primary" href="/new">
          Start a new group
        </Link>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div className="row-between">
        <div className="brand">
          <span className="dot" />
          Mingle
        </div>
        {countdown && <span className="pill">⏳ {countdown}</span>}
      </div>

      <h1>{group.name}</h1>

      {!joined ? (
        <>
          <p className="lead">
            Add your details to see everyone else in the room.
          </p>
          <form className="card stack" onSubmit={onJoin}>
            <div>
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(optional)"
              />
            </div>
            <div>
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                id="linkedin"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                placeholder="username or full URL (optional)"
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Joining…" : "Join & see everyone"}
            </button>
            <p className="muted">
              🔒 Visible only to people in this group. Deleted automatically
              after 48 hours.
            </p>
          </form>
        </>
      ) : (
        <>
          <p className="lead">
            {group.members.length}{" "}
            {group.members.length === 1 ? "person" : "people"} here. Tap any
            contact to reach out, or save the card to your phone.
          </p>
          <div className="stack">
            {group.members.map((m) => {
              const li = linkedinUrl(m.linkedin);
              const isMe = m.id === myId.current;
              return (
                <div className="member" key={m.id}>
                  <div className="row-between">
                    <span className="name">
                      {m.name} {isMe && <span className="muted">(you)</span>}
                    </span>
                    <button
                      className="btn-ghost"
                      style={{ padding: "8px 12px", fontSize: 13 }}
                      onClick={() => downloadVcard(m)}
                    >
                      Save contact
                    </button>
                  </div>
                  <div className="contacts">
                    {m.email && (
                      <a className="chip" href={`mailto:${m.email}`}>
                        ✉️ {m.email}
                      </a>
                    )}
                    {m.phone && (
                      <a className="chip" href={`tel:${m.phone}`}>
                        📞 {m.phone}
                      </a>
                    )}
                    {li && (
                      <a
                        className="chip"
                        href={li}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        in LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <hr className="divider" />
      <p className="muted">
        <Link className="link" href="/">
          ← Mingle home
        </Link>
      </p>
    </main>
  );
}
