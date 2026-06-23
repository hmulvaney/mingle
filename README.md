# Mingle

**Live at [getmingle.vercel.app](https://getmingle.vercel.app).**

**Swap contacts in one scan or one click.** At an in-person event, print one QR
code, drop it in a holder on the table, and let everyone scan it. Online, just
share a group link (e.g. post it on LinkedIn). Either way people add their name,
email, phone, and LinkedIn once and instantly see everyone else who joined — and
the whole group automatically disappears **48 hours** later.

Built for networking events, mixers, and meetups where typing each other's
details into your phone is the worst part of saying hello.

## How it works

Every group lives at its own URL (`/g/<id>`) and has its own live directory.
There are two ways to get people into one:

### In person — the permanent QR

- **One permanent QR code.** It points at the app's home page and never changes —
  print it once, reuse it at every event. Generate/print it at [`/qr`](#).
- **Rolling groups.** Whoever runs the event taps **Start a new group** and names
  it (e.g. "AI Founders Mixer · June"). That becomes the *active group* — the one
  the permanent QR sends people to.
- **Scan → join → see everyone.** Everyone else scans the same QR, lands on the
  active group, adds their details, and immediately sees the live directory with
  tap-to-email / tap-to-call / LinkedIn links and a one-tap "Save contact" (vCard)
  download.

> **One QR, one event at a time.** Because the printed QR always points to the
> *current* active group, a single printout supports one live in-person event at
> a time. Start a new group and it becomes the active one.

### Online — share a link per group

- On **Start a new group**, name your event and you get its own **shareable
  link** with a one-tap **Copy link**. The button then flips to **Create another
  group**, so you can spin up several at once — one per LinkedIn post, Slack
  channel, or community.
- Post or DM each link. Anyone who opens it lands straight on that group's join
  page — no scanning, no "active group" to compete over. **Multiple link-based
  groups can run simultaneously.**
- Inside a group, the **Share join link** button copies the same URL so members
  can pull more people in.

### Always

- **Auto-expiry.** Groups, members, and the active pointer all carry a 48-hour
  TTL, so contact data is gone two days after the event. No cleanup, no leftovers.

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

The live deployment is [getmingle.vercel.app](https://getmingle.vercel.app).

## At a Silicon Valley mixer (the 30-second pitch)

You're hosting a happy hour for 40 founders. Before doors open you print the
Mingle QR and stand it in a little acrylic holder by the check-in table, then tap
**Start a new group** → "SF Founders Happy Hour". As people arrive they scan,
type their info once, and immediately have everyone's contacts — no "let me find
you on LinkedIn" fumbling. Two days later the list self-destructs, so nobody's
details linger in a random web app. Same printed QR works again at next month's
event.

## On LinkedIn (running it online)

You post "Building in AI? Drop your info and meet the room 👇" with a Mingle
link. You made that link in seconds: **Start a new group** → "AI Builders ·
June", **Copy link**, paste into the post. Want a separate room for a different
audience the same week? Hit **Create another group**, grab its link, and post
that one elsewhere — both run side by side, each with its own directory, each
self-destructing 48 hours later.

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
