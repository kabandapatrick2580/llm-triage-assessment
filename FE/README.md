# Grounded Knowledge Assistant — Frontend

A production-ready frontend for a **Grounded Knowledge Assistant (RAG system)**. Users ask questions and get answers grounded strictly in uploaded documents, with citations and confidence. Administrators manage the knowledge base and resolve the gaps surfaced when the system can't answer something.

Built with **React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · TanStack Query · Axios · React Router · Recharts · Lucide**.

---

## Features

**Knowledge Assistant (Chat)**
- ChatGPT-style conversation with auto-scroll, typing indicator, and an empty state with example prompts
- Each answer card shows **Answer · Sources · Confidence · Timestamp**
- Expandable **citation cards** (document, page, chunk id)
- Professional **"Information Not Found"** warning card when an answer isn't grounded, with the recorded question ID and a *"Knowledge gap recorded"* toast
- Markdown rendering + on-demand syntax highlighting for code blocks
- Copy answer, regenerate answer, export conversation to PDF
- Chat history persisted in `localStorage`

**Documents (Knowledge Base)**
- Drag-and-drop PDF upload with live progress
- Document cards: name, upload date, pages, chunks, status
- Search and delete documents

**Unanswered Questions (Admin)**
- Table with ID, question, created-at, similarity score, status, resolved-by, actions
- Filters: All / Pending / Resolved / Ignored + search
- Question detail view (attempted answer, retrieved context summary, similarity, dates, resolving document)
- Resolve flow (select a document → `PATCH`) and ignore flow, with optimistic table refresh

**Dashboard**
- Stat cards: Total Documents, Total Chunks, Knowledge Gaps, Pending, Resolved
- Recharts: Questions Over Time, Gap Resolution breakdown, Document Growth

**Platform**
- Light / dark / system theme with persistence
- Fully responsive + mobile drawer navigation
- Loading skeletons, empty states, error boundaries, toast notifications
- Accessible: keyboard navigation, ARIA labels, focus rings, color-contrast-aware tokens
- Live backend health indicator

---

## Project structure

```
src/
├── api/              # Axios instance + typed API service layer
│   ├── axios.ts
│   ├── chatApi.ts
│   ├── documentApi.ts
│   └── adminApi.ts
├── components/
│   ├── chat/         # ChatWindow, ChatMessage, ChatInput, CitationCard, EmptyState, TypingIndicator
│   ├── documents/    # DocumentList, DocumentCard, UploadDialog
│   ├── admin/        # UnansweredQuestionTable, QuestionDetailsDialog, ResolveQuestionDialog, StatusBadge, SimilarityScore
│   ├── dashboard/    # StatCard, ChartCard, DashboardCharts
│   ├── layout/       # AppLayout, Sidebar, Header, PageContainer, navigation
│   ├── theme/        # ThemeProvider, ThemeToggle
│   ├── common/       # ErrorBoundary, MarkdownRenderer, BackendStatus
│   └── ui/           # shadcn/ui primitives (button, card, dialog, select, table, …)
├── hooks/            # useChat, useDocuments, useUnansweredQuestions, queryKeys
├── pages/            # DashboardPage, ChatPage, DocumentsPage, AdminPage, NotFoundPage
├── routes/           # AppRoutes
├── types/            # chat.ts, document.ts, admin.ts (mirror the backend)
├── utils/            # formatDate, notifications, confidence, analytics, exportChat
├── lib/              # utils (cn helper)
├── App.tsx
└── main.tsx
```

---

## Prerequisites

- **Node.js 18+** (developed on Node 22)
- The **Flask backend** running and reachable (default `http://localhost:5000`)

---

## Installation

```bash
cd FE
npm install
cp .env.example .env   # optional — defaults work for local dev
```

### Environment variables

| Variable             | Default                   | Purpose                                                                 |
| -------------------- | ------------------------- | ----------------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | `""` (same-origin)        | Base URL for the backend. Leave empty to use the dev proxy / reverse proxy. |
| `VITE_PROXY_TARGET`  | `http://localhost:5000`   | Dev-only: where Vite proxies `/api` and `/health`.                      |

> **API wiring:** In development, `vite.config.ts` proxies `/api` and `/health` to `VITE_PROXY_TARGET`, so the frontend uses same-origin relative URLs and you avoid CORS entirely. The backend also enables `CORS(app)`, so setting `VITE_API_BASE_URL=http://localhost:5000` directly works too.

---

## Running in development

```bash
# 1) Start the Flask backend (in BE/)
python app.py            # serves http://localhost:5000

# 2) Start the frontend (in FE/)
npm run dev              # serves http://localhost:5173
```

Open <http://localhost:5173>.

Other scripts:

```bash
npm run build       # type-check + production build to dist/
npm run preview     # preview the production build locally
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

---

## Backend API contract

The frontend targets these endpoints (all under the same origin / proxy):

| Method   | Endpoint                                              | Used by               |
| -------- | ----------------------------------------------------- | --------------------- |
| `POST`   | `/api/chat`                                           | Chat                  |
| `GET`    | `/api/documents`                                      | Documents list        |
| `POST`   | `/api/documents/upload` (multipart `file`)            | Upload                |
| `DELETE` | `/api/documents/:document_name`                       | Delete document       |
| `GET`    | `/api/admin/unanswered-questions?status=`             | Admin table           |
| `GET`    | `/api/admin/unanswered-questions/:id`                 | Question detail       |
| `PATCH`  | `/api/admin/unanswered-questions/:id/resolve`         | Resolve (`{ resolved_by_document_name }`) |
| `PATCH`  | `/api/admin/unanswered-questions/:id/ignore`          | Ignore                |
| `GET`    | `/health`                                             | Health indicator      |

**Chat response** is `{ answer, citations[], found_in_knowledge_base }`, plus `unanswered_question_id` when not found. Citations are `{ document, page, chunk_id }`.

### Notes on the contract
- **Delete is by document name**, not id (matches the backend route).
- The backend does **not** return a numeric confidence; the UI derives a coarse **High / Medium / Low** label from grounding strength (see `src/utils/confidence.ts`). Swap in a real value if the backend later provides one.
- There is **no dedicated dashboard/stats endpoint**; the Dashboard computes metrics and chart series client-side from the documents and unanswered-questions lists (`src/utils/analytics.ts`).
- The backend returns full JSON (no token streaming), so the UI shows a typing indicator while the request is in flight rather than streaming tokens.

---

## Build & deployment

### Static build

```bash
npm run build      # outputs to dist/
```

`dist/` is a static SPA — host it anywhere. Because it uses client-side routing, the host **must rewrite unknown paths to `index.html`**.

### Docker (frontend + nginx reverse proxy)

A multi-stage `Dockerfile` and `nginx.conf` are included. nginx serves the SPA and proxies `/api` + `/health` to a backend service named `backend:5000` (adjust as needed).

```bash
docker build -t gka-frontend .
docker run -p 8080:80 gka-frontend
# open http://localhost:8080
```

Example `docker-compose.yml` snippet:

```yaml
services:
  backend:
    build: ../BE
    expose: ["5000"]
  frontend:
    build: ./FE
    ports: ["8080:80"]
    depends_on: ["backend"]
```

### Vercel / Netlify

- SPA rewrites are preconfigured: `vercel.json` (Vercel) and `public/_redirects` (Netlify).
- Build command: `npm run build` · Output dir: `dist`.
- Set `VITE_API_BASE_URL` to your backend's public URL (the backend must allow CORS, which it does via `CORS(app)`).

---

## Tech stack

| Concern         | Choice                              |
| --------------- | ----------------------------------- |
| Framework       | React 18 + TypeScript               |
| Build           | Vite 6                              |
| Styling         | Tailwind CSS 3 + CSS variables      |
| Components      | shadcn/ui (Radix primitives)        |
| Data fetching   | TanStack Query 5 + Axios            |
| Routing         | React Router 6 (lazy-loaded routes) |
| Charts          | Recharts                            |
| Icons           | Lucide                              |
| Markdown / code | react-markdown + react-syntax-highlighter |
| Toasts          | Sonner                              |
| PDF export      | jsPDF                               |

---

## Accessibility & UX details

- All interactive controls are keyboard reachable with visible focus rings.
- Dialogs trap focus and restore it on close (Radix).
- Icons that convey meaning have `aria-label`s; decorative ones are hidden.
- Color tokens are theme-aware and chosen for adequate contrast in both modes.
- Long-running RAG calls use a 5-minute Axios timeout with friendly timeout messaging.
```
