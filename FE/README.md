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

## Theming

All brand colors and design tokens live in `src/styles/theme.css`. Change the
`--brand-*` ramp there and the whole UI re-themes.
