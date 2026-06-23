"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Group, Member } from "@/lib/types";
import { track } from "@/lib/analytics";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  company: "",
  role: "",
};
type FormState = typeof EMPTY_FORM;

function linkedinUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes("linkedin.com")) return `https://${v}`;
  return `https://www.linkedin.com/in/${v.replace(/^@/, "")}`;
}

function LinkedInIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="#0A66C2"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

// Short, legible handle for the chip label (e.g. "adalovelace"), tolerating
// full URLs, trailing slashes, and ?tracking= junk.
function linkedinHandle(value: string): string {
  const url = linkedinUrl(value);
  if (!url) return "LinkedIn";
  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || "LinkedIn";
  } catch {
    return "LinkedIn";
  }
}

function vcard(m: Member): string {
  const li = linkedinUrl(m.linkedin);
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${m.name}`,
    m.company ? `ORG:${m.company}` : "",
    m.role ? `TITLE:${m.role}` : "",
    m.email ? `EMAIL;TYPE=INTERNET:${m.email}` : "",
    m.phone ? `TEL;TYPE=CELL:${m.phone}` : "",
    li ? `URL:${li}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
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
  return hours >= 1 ? `${hours}h ${mins}m left` : `${mins}m left`;
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
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

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

  // Keep the directory live once you've joined.
  useEffect(() => {
    if (!joined || editing) return;
    const t = setInterval(load, 5_000);
    return () => clearInterval(t);
  }, [joined, editing, load]);

  const countdown = useCountdown(group?.expiresAt);

  const showForm = !joined || editing;

  const filtered = useMemo(() => {
    const members = group?.members ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.company, m.role, m.email].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [group, query]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const editingId = editing ? myId.current : null;
      const url = editingId
        ? `/api/groups/${id}/members/${editingId}`
        : `/api/groups/${id}/members`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      setGroup(data.group);
      if (!editingId) {
        const mine = data.group.members[data.group.members.length - 1];
        myId.current = mine.id;
        localStorage.setItem(storageKey, mine.id);
        setJoined(true);
        track("member_joined", {
          group_id: id,
          member_count: data.group.members.length,
        });
      }
      setEditing(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(m: Member) {
    setForm({
      name: m.name,
      email: m.email,
      phone: m.phone,
      linkedin: m.linkedin,
      company: m.company,
      role: m.role,
    });
    setEditing(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onRemove() {
    if (!myId.current) return;
    if (!confirm("Remove yourself from this group?")) return;
    const res = await fetch(`/api/groups/${id}/members/${myId.current}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const { group: g } = await res.json();
      setGroup(g);
      localStorage.removeItem(storageKey);
      myId.current = null;
      setJoined(false);
      setEditing(false);
      setForm(EMPTY_FORM);
    }
  }

  async function shareLink() {
    const link = window.location.href;
    track("link_copied", { group_id: id, source: "group_page" });
    if (navigator.share) {
      try {
        await navigator.share({ title: group?.name ?? "Mingle", url: link });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadAll() {
    const members = group?.members ?? [];
    if (!members.length) return;
    track("csv_downloaded", { group_id: id, member_count: members.length });
    const header = ["Name", "Company", "Role", "Email", "Phone", "LinkedIn"];
    const rows = members.map((m) =>
      [
        m.name,
        m.company,
        m.role,
        m.email,
        m.phone,
        linkedinUrl(m.linkedin) ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
    const slug = (group?.name ?? "mingle").replace(/[^a-z0-9]+/gi, "-");
    download(`${slug}-contacts.csv`, [header.join(","), ...rows].join("\n"), "text/csv");
  }

  if (status === "loading") {
    return (
      <main className="wrap">
        <div className="brand">
          <span className="dot" />
          <span className="gradient-name">Mingle</span>
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
          <span className="gradient-name">Mingle</span>
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
          <span className="gradient-name">Mingle</span>
        </div>
        {countdown && <span className="pill">⏳ {countdown}</span>}
      </div>

      <h1>{group.name}</h1>

      {showForm ? (
        <>
          <p className="lead">
            {editing
              ? "Update your details."
              : "Add your details to see everyone else in the room."}
          </p>
          <form className="card stack" onSubmit={onSubmit}>
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
            <div className="row-between" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  placeholder="(optional)"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="role">Role</label>
                <input
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="(optional)"
                />
              </div>
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
              {submitting
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Join & see everyone"}
            </button>
            {editing && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setEditing(false);
                  setForm(EMPTY_FORM);
                  setError("");
                }}
              >
                Cancel
              </button>
            )}
            {!editing && (
              <p className="muted">
                🔒 Visible only to people in this group. Deleted automatically
                after 48 hours.
              </p>
            )}
          </form>
        </>
      ) : (
        <>
          <p className="lead">
            {group.members.length}{" "}
            {group.members.length === 1 ? "person" : "people"} here. Tap a
            contact to reach out, or grab everyone at once.
          </p>

          <div className="stack">
            <div className="row-between" style={{ gap: 10 }}>
              <button className="btn-ghost" onClick={shareLink} style={{ flex: 1 }}>
                {copied ? "Link copied ✓" : "Share join link"}
              </button>
              <button
                className="btn-ghost"
                onClick={downloadAll}
                style={{ flex: 1 }}
              >
                Download all (CSV)
              </button>
            </div>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, company, or role…"
            />

            {filtered.map((m) => {
              const li = linkedinUrl(m.linkedin);
              const isMe = m.id === myId.current;
              const sub = [m.role, m.company].filter(Boolean).join(" · ");
              return (
                <div className="member" key={m.id}>
                  <div className="row-between">
                    <span className="name">
                      {m.name} {isMe && <span className="muted">(you)</span>}
                    </span>
                    <button
                      className="btn-ghost"
                      style={{ padding: "8px 12px", fontSize: 13 }}
                      onClick={() => downloadVcardFor(m)}
                    >
                      Save contact
                    </button>
                  </div>
                  {sub && <span className="muted">{sub}</span>}
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
                        <LinkedInIcon /> {linkedinHandle(m.linkedin)}
                      </a>
                    )}
                  </div>
                  {isMe && (
                    <div className="row-between" style={{ gap: 8 }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: "8px 12px", fontSize: 13, flex: 1 }}
                        onClick={() => startEdit(m)}
                      >
                        Edit my info
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: "8px 12px", fontSize: 13, flex: 1 }}
                        onClick={onRemove}
                      >
                        Remove me
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {!filtered.length && (
              <p className="muted center">No one matches “{query}”.</p>
            )}
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

  function downloadVcardFor(m: Member) {
    download(
      `${m.name.replace(/[^a-z0-9]+/gi, "-") || "contact"}.vcf`,
      vcard(m),
      "text/vcard",
    );
  }
}
