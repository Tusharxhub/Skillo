# Skillo Copilot Instructions

## Architecture Snapshot
- Monorepo with `backend` (Express + Mongo + Clerk + Stream + Inngest) and `frontend` (Vite + React 19 + Clerk + Stream + TanStack Query). Root npm scripts proxy to each folder; use `npm run start` for the API and `npm run dev --prefix frontend` for the UI during local work.
- Auth flows always go through Clerk. Server routes expect `clerkMiddleware` to run first (`src/server.js`), `protectRoute` (`middleware/protectRoute.js`) to resolve the Mongo `User`, then controllers can rely on `req.user` and `req.user.clerkId`.
- Real-time features use Stream: backend `lib/stream.js` manages the admin clients; frontend `hooks/useStreamClient.js` plus `VideoCallUI.jsx` join video calls and chat channels per `Session.callId`.
- Coding problems are static data under `frontend/src/data/problems.js`; both `ProblemsPage.jsx` and live sessions derive starter code/expected output from there.

## Backend Workflow
- `src/server.js` wires `cors({ origin: ENV.CLIENT_URL, credentials: true })`, Clerk middleware, Inngest webhook (`/api/inngest`), `chatRoutes`, and `sessionRoutes`. Keep any new route behind `protectRoute` unless it is a health or webhook endpoint.
- DB access goes through `lib/db.js`; it retries SRV failures by building a direct Mongo URI. Call `connectDB()` before any background job (see `lib/inngest.js`).
- `lib/env.js` centralizes required vars: `PORT`, `DB_URL`, `CLIENT_URL`, `STREAM_*`, `INNGEST_*`. Fail fast if you introduce new env values.
- Session lifecycle lives in `controllers/sessionController.js`. Respect status transitions (`active` → `completed`) and guardrails (host cannot join, participants max 2). Any mutation should mirror changes in Stream chat/video (see `createSession`, `joinSession`, `endSession`).
- `chatController.getStreamToken` assumes `req.user` already set and returns Stream token plus user metadata for the frontend to hydrate Stream SDKs.
- Inngest functions (`lib/inngest.js`) listen to Clerk webhooks to sync Mongo users and Stream profiles. When adding new events, reuse `connectDB()` and the existing Stream helpers.

## Frontend Workflow
- `src/main.jsx` wraps the app with `ClerkProvider`, `BrowserRouter`, and a shared `QueryClient`. Any hook that needs auth or React Query should assume these providers exist.
- Routing (`App.jsx`) gates every page except `/` on `useUser().isSignedIn`. Preserve the redirect pattern (`<Navigate />`) when adding routes.
- Network access goes through `lib/axios.js` which injects `baseURL = import.meta.env.VITE_API_URL` and `withCredentials: true`. Always add new endpoints to `api/` modules and consume them through React Query hooks in `hooks/useSessions.js` or new hook files.
- `useSessionById` refetches every 5s; `SessionPage.jsx` also auto-joins non-host users via `useJoinSession`. Keep those side effects idempotent and guard on `loadingSession` to avoid loops.
- Stream integration: `useStreamClient` fetches a token via `sessionApi.getStreamToken`, initializes `StreamVideoClient`, `StreamChat`, and cleans up on unmount. If you expand media/chat features, thread through `chatClient`/`channel` props into `VideoCallUI.jsx`.
- Coding panels use `react-resizable-panels` and `@monaco-editor/react`. `CodeEditorPanel.jsx` is language-agnostic; pass starter snippets from `PROBLEMS` (ProblemPage) or session-selected problem (SessionPage). `OutputPanel.jsx` expects `{ success, output, error }` from `lib/piston.executeCode`.
- `ProblemPage.jsx` normalizes runtime output before comparing against `PROBLEMS[problemId].expectedOutput`. If you add new languages, update `LANGUAGE_CONFIG`, `executeCode`, and expected outputs together.

## Dev & Ops Tips
- Env requirements: frontend `.env` needs `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_URL`, `VITE_STREAM_API_KEY`; backend needs the values defined in `lib/env.js` (set both Stream key & secret). Clerk cookies require matching `CLIENT_URL` and `withCredentials` on axios.
- Install deps per folder (`npm install`, `npm install --prefix backend`, `npm install --prefix frontend`). Run API with `npm run dev --prefix backend` (nodemon) and UI with `npm run dev --prefix frontend`.
- UI styling relies on Tailwind v4 + DaisyUI (`src/index.css`). Component classes assume those plugins; avoid older Tailwind syntax (no `@tailwind base` etc.).
- Before touching shared data, check for single sources of truth: sessions via `hooks/useSessions`, problems via `data/problems.js`, Stream clients via `hooks/useStreamClient`. Extending functionality elsewhere often causes inconsistencies.
- When debugging Stream issues, confirm the backend `chatController` token response, the frontend env key, and that `session.callId` matches Stream channel/call ids created in `createSession`.
