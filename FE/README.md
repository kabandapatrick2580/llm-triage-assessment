# Triage Frontend

React + TypeScript + Vite dashboard for the Smart Intake Triage API. Paste an
inbound message, the model classifies it and drafts a reply, and results show up
in a filterable list.

## Features

Each feature is tied to a requirement of the brief — graceful handling of model
output, a filterable dashboard, and a UX that fits a self-hosted model whose
latency and availability vary.

- **Two views — Dashboard + Triage Inbox.** A sidebar (react-router) splits the
  at-a-glance overview from the working queue.
  *Why it matters:* operators triage from the inbox but need the dashboard to see
  load and what's urgent without scanning every row.
- **Dashboard metrics.** Stat cards (total, *Needs attention* = High + Urgent,
  Urgent, Today), breakdowns by category and priority, plus "Recent" and "Needs
  attention" lists — all derived client-side in `lib/metrics.ts`.
  *Why it matters:* turns a flat list of tickets into an operational picture;
  surfaces the high-priority items first.
- **Intake form with sample + inline validation.** Paste a message (or load a
  realistic sample), submit is disabled until there's text, and the new ticket is
  prepended optimistically.
  *Why it matters:* it's the core action; the sample makes the demo one click, and
  optimistic insert gives instant feedback.
- **Triaging loader with rotating status messages (~2.6s).** Shown while the model
  runs.
  *Why it matters:* a self-hosted/CPU model (or a cold free instance) can take
  several seconds — the loader sets expectations and cuts perceived latency instead
  of looking frozen.
- **Structured ticket detail in a drawer.** Category/priority badges, issue
  summary, customer name, the extracted key fields (transaction, email, phone,
  student ID), a collapsible **suggested reply with copy-to-clipboard**, and the
  original message.
  *Why it matters:* presents the validated JSON as something an agent can act on —
  copy the draft reply and send.
- **Search, category/priority filters, and an "X of Y" count.**
  *Why it matters:* this is the brief's "filterable dashboard"; it keeps the inbox
  usable as ticket volume grows.
- **Deep-linkable tickets** — `/inbox?ticket=ID` opens that ticket's detail.
  *Why it matters:* a specific ticket can be shared or bookmarked.
- **Model status indicator.** The sidebar probes `/api/health` and shows
  checking / online / offline.
  *Why it matters:* with a self-hosted model the endpoint can be down or a tunnel
  offline — users see that before submitting, not after a failed triage.
- **Failure-mode-aware error handling.** A typed API client (`api/client.ts`)
  classifies responses — `422` validation (model produced an invalid
  category/priority/shape), `502` model-unavailable, network, server — and the
  intake form maps each to a plain-language message and hint.
  *Why it matters:* directly satisfies "handle malformed model output gracefully" —
  the user is told *what* went wrong and what to do, never shown a raw 500.

## Requirements

- Node 20+
- The backend running on http://localhost:5000 (see `../BE`)

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. `/api` is proxied to the backend during dev.

```bash
npm run build    # type-check + production bundle into dist/
```

## Deploy (production)

Build is a static bundle — host it free on Cloudflare Pages / Vercel / Netlify
(build command `npm run build`, output `dist/`). Two things differ from local:

- Set `VITE_API_BASE_URL` to your deployed backend URL (see `.env.example`).
  Locally it's left empty so the dev proxy handles `/api`.
- Client-side routes (`/inbox`) must resolve on refresh: `vercel.json` rewrites
  every path to `index.html` on **Vercel**, and `public/_redirects` does the same
  on **Netlify / Cloudflare Pages**.

## Theming

All brand colors and design tokens live in `src/styles/theme.css`. Change the
`--brand-*` ramp there and the whole UI re-themes.
