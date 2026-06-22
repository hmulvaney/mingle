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

## Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy

1. Import the repo into [Vercel](https://vercel.com/new).
2. Add the **Upstash Redis** integration (Storage → Upstash Redis).
3. Deploy, open `/qr`, and print it.

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
