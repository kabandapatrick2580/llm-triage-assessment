# Triage Frontend

React + TypeScript + Vite dashboard for the Smart Intake Triage API. Paste an
inbound message, the model classifies it and drafts a reply, and results show up
in a filterable list.

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
- `public/_redirects` is included so client-side routes (`/inbox`) resolve on
  static hosts.

## Theming

All brand colors and design tokens live in `src/styles/theme.css`. Change the
`--brand-*` ramp there and the whole UI re-themes.
