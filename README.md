# Mingle

**Swap contacts at an event in one scan.** Print one QR code, drop it in a
holder on the table, and let everyone scan it to share their name, email, phone,
and LinkedIn. Each person instantly sees everyone else who joined — and the whole
group automatically disappears **48 hours** later.

Built for networking events, mixers, and meetups where typing each other's
details into your phone is the worst part of saying hello.

## How it works

- **One permanent QR code.** It points at the app's home page and never changes —
  print it once, reuse it at every event. Generate/print it at [`/qr`](#).
- **Rolling groups.** Whoever runs the event taps **Start a new group** and names
  it (e.g. "AI Founders Mixer · June"). That becomes the *active group*.
- **Scan → join → see everyone.** Everyone else scans the same QR, lands on the
  active group, adds their details, and immediately sees the live directory with
  tap-to-email / tap-to-call / LinkedIn links and a one-tap "Save contact" (vCard)
  download.
- **Auto-expiry.** Groups, members, and the active pointer all carry a 48-hour
  TTL, so contact data is gone two days after the event. No cleanup, no leftovers.

> **One event at a time.** Because the QR is permanent and always points to the
> *current* active group, a single printout supports one live event at a time.
> Start a new group and it becomes the active one.

## Try it locally (zero setup)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>:

1. **Start a new group** and name it.
2. In a second browser (or an incognito window), open <http://localhost:3000> —
   it shows **Join {your event}**. Add a contact and you'll see both people in
   the directory.
3. Visit <http://localhost:3000/qr> to see the printable QR.

With no database configured, Mingle uses an in-memory store, so data resets when
the dev server restarts. That's fine for trying the concept — wire up Upstash
below for real, shared, persistent storage.

## Deploy (Vercel + Upstash, free)

1. Push this repo to GitHub (already done if you're reading this there).
2. Import it into [Vercel](https://vercel.com/new).
3. In the Vercel project, add the **Upstash** integration from the Marketplace
   (Storage → Upstash Redis). It provisions a free database and automatically
   sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. Deploy. Your permanent URL (e.g. `https://mingle.vercel.app`) is what the QR
   encodes.
5. Open `/qr`, print it, and you're ready for the event.

Prefer to wire Upstash by hand? Create a database at
<https://console.upstash.com>, copy the REST URL + token into a `.env.local`
(see `.env.example`), and Mingle will use it in dev too.

## At a Silicon Valley mixer (the 30-second pitch)

You're hosting a happy hour for 40 founders. Before doors open you print the
Mingle QR and stand it in a little acrylic holder by the check-in table, then tap
**Start a new group** → "SF Founders Happy Hour". As people arrive they scan,
type their info once, and immediately have everyone's contacts — no "let me find
you on LinkedIn" fumbling. Two days later the list self-destructs, so nobody's
details linger in a random web app. Same printed QR works again at next month's
event.

## Privacy

- No accounts, no login — frictionless by design.
- Contact details are visible only to people who join the same group.
- Everything is deleted automatically 48 hours after the group is created (Redis
  TTL). Mingle stores no contact data in the repository or in long-term storage.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Upstash Redis](https://upstash.com) for storage with native TTL (in-memory
  fallback for local dev)
- [`qrcode`](https://www.npmjs.com/package/qrcode) for the printable QR
- Deployed on [Vercel](https://vercel.com)
