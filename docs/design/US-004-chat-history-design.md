# Design Document: Chat History Persistence & Management (US-004)

## Overview
Add persistent chat sessions so users can review past conversations and start fresh ones with a *New Chat* button. Chats are stored server-side (SQLite) and exposed via REST endpoints; the frontend shows a sidebar list and loads messages on selection.

## Goals & Success Criteria
- Chats persist across page reloads and devices.
- Sidebar lists previous sessions ordered by most recent.
- "New Chat" button clears current conversation and starts a fresh session.
- Automatic session creation on first message; auto-title based on first user prompt.

## Data Model
```
Table: chats
-------------------------------------------
| id INTEGER PK AUTOINCREMENT            |
| title TEXT NOT NULL                    |
| messages TEXT  -- JSON array [{role,content,ts}] |
| created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP |
```
- **messages** column stores full turn history as JSON; ok for MVP scale.
- Add index `idx_chats_created` on `created_at` for ordering.

## API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/chats`          | List chats (latest first) |
| POST   | `/chats`          | Create empty chat – returns `{id}` |
| GET    | `/chats/:id`      | Fetch messages for chat |
| PUT    | `/chats/:id`      | Replace messages array (auto-save) |
| DELETE | `/chats/:id`      | (future) delete chat |

All endpoints require Bearer JWT.

## Backend Flow
1. At WebSocket connect, client sends `sessionId` (if any).
2. If missing, backend creates new chat via DB and returns `sessionId`.
3. On every turn, append `{role, content, ts}` to in-memory array; after assistant response, persist via `PUT /chats/:id` or direct DB call.

## Frontend Flow
1. Zustand store: `{ sessionId, messages[], chats[], loadChats(), startNewChat(), selectChat(id) }`.
2. Sidebar (`<aside>`): lists `chats` titles; clicking calls `selectChat` which fetches messages and sets store.
3. "New Chat" button: calls `startNewChat()` → `POST /chats`, clears messages.
4. Auto-title: first user message truncated to 50 chars → `PUT /chats/:id` once available.

## Component / File Changes
```
website/src/app/dashboard/ask/
  page.tsx          # add sidebar + history state
  ChatSidebar.tsx   # new list component
  useChatStore.ts   # Zustand store (shared)
```

## Edge Cases
| Case | Handling |
|------|----------|
| Network loss during save | UI marks chat "unsaved", retry on reconnect |
| Large messages array | Truncate or page older turns; future optimisation: separate `chat_messages` table |
| Deleted chat selected | 404 → show toast “Chat not found” and load latest |

## Security & Privacy
- Sanitize content before rendering (markdown / HTML injection).
- Consider per-user chat isolation (add `user_id` column when multi-user supported).

## Risks & Mitigations
- **DB Bloat**: Monitor `messages` column size; consider separate table later.
- **Concurrent edits**: For now single-client per chat; conflict unlikely.

## Minimal Path & Library Choices
- **DB**: reuse existing better-sqlite3; single `chats` table (no ORM).
- **API**: implement chat CRUD as Next.js Route Handlers (`app/api/chats/route.ts`) instead of standalone Fastify endpoints.
- **State**: Zustand store `useChatStore`.
- **Data fetching**: TanStack Query for list + messages with stale-while-revalidate.
- **UI**: Headless UI `<Disclosure>` for collapsible sidebar; Tailwind for styling.
- **Storage fallback**: if server DB unavailable (offline dev), persist to `localStorage` behind a feature flag.
- **Testing**: Vitest for store logic; Playwright for sidebar interactions.

---

## Estimated Effort
3–5 dev hours (2 BE, 2 FE, 1 buffer).

## Acceptance Test Checklist
- [ ] “New Chat” creates empty session and UI clears.
- [ ] Chats list updates after each session.
- [ ] Reload page – last chat reloads automatically.
- [ ] Selecting old chat loads its messages.
- [ ] Sessions persist in SQLite file. 