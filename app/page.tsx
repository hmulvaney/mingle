import Link from "next/link";
import { getActiveGroup } from "@/lib/groups";

export const dynamic = "force-dynamic";

export default async function Home() {
  const active = await getActiveGroup();

  return (
    <main className="wrap">
      <div className="brand">
        <span className="dot" />
        Mingle
      </div>

      {active ? (
        <>
          <h1>You&apos;re at {active.name}</h1>
          <p className="lead">
            Add your details once and instantly see everyone else in the room.
          </p>
          <div className="stack">
            <Link className="btn btn-primary" href={`/g/${active.id}`}>
              Join &amp; share my info →
            </Link>
            <span className="pill">
              {active.members.length}{" "}
              {active.members.length === 1 ? "person" : "people"} here so far
            </span>
          </div>
          <hr className="divider" />
          <p className="muted">
            Running a different event?{" "}
            <Link className="link" href="/new">
              Start a new group
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1>Swap contacts in one scan</h1>
          <p className="lead">
            No active event right now. Start one, print the QR, and let everyone
            scan to share their name, email, phone, and LinkedIn. It all
            disappears after 48 hours.
          </p>
          <div className="stack">
            <Link className="btn btn-primary" href="/new">
              Start a new group
            </Link>
            <Link className="btn btn-ghost" href="/qr">
              Get the printable QR code
            </Link>
          </div>
        </>
      )}

      <hr className="divider" />
      <p className="muted">
        🔒 No accounts. Contact info is shared only within the group and is
        automatically deleted 48 hours after the event.
      </p>
    </main>
  );
}
