# Design Document: Dedicated Routes for Dashboard Sections (US-001)

## Overview
Implement distinct Next.js App Router pages for `summaries`, `search`, and `ask` so users can deep-link directly to functionality (e.g., `/dashboard/ask`). This replaces the current tab-based local state.

## Goals & Success Criteria
- Route URLs:
  - `/dashboard/summaries`
  - `/dashboard/search`
  - `/dashboard/ask`
- Preserve auth protection (JWT) on every page.
- Browser back/forward and direct URL entry load the correct section without full refresh.
- Existing dashboard state moves cleanly into dedicated components.

## Component / File Structure
```
website/src/app/dashboard/
  layout.tsx        # shared auth/layout wrapper
  page.tsx          # redirect → /dashboard/ask (default)
  summaries/page.tsx
  search/page.tsx
  ask/page.tsx
components/
  navigation.tsx    # converts tabs to <Link> based nav
```

## Routing Logic
1. `layout.tsx` wraps all dashboard pages; uses `useEffect` on client to verify JWT in `localStorage` → redirect to `/login` if missing.
2. `page.tsx` (parent) simply `redirect('/dashboard/ask')` to make *Ask* the default.
3. Child routes render existing section components extracted from current tab switch.

## Data Handling
- Summaries & search pages fetch on load via existing REST endpoints with the bearer token.
- Ask page will later be converted into chat (US-003) but initially keeps current logic.

## Edge Cases
| Case | Handling |
|------|----------|
| User opens `/dashboard/search?q=error` | `search/page.tsx` reads `searchParams` to pre-fill and auto-query |
| Token expired | `layout.tsx` detects 401 → clears token → redirect `/login?redirect=<current>` |
| Unknown sub-route `/dashboard/foo` | 404 page from Next.js |

## Risks & Mitigations
- **Route collision**: Ensure no existing files clash with new folder names.
- **Auth flicker**: Use skeleton loader while JWT check runs.

## Estimated Effort
3–4 dev hours (frontend only).

## Minimal Path & Library Choices
- **Framework core**: Next.js 14 (App Router) with React Server Components – no extra routing libs.
- **Navigation**: built-in `<Link>` from `next/link` (no third-party router).
- **Styling**: Tailwind CSS v3.4 (already in repo) – keeps markup terse.
- **Data**: TanStack Query v5 optional for search page fetches; otherwise native `fetch` in Server Components.
- **Auth**: current JWT check in localStorage – no new auth provider.
- **Testing**: Vitest (already configured) + React Testing Library.

---

## Acceptance Test Checklist
- [ ] Direct navigation to each URL renders expected UI.
- [ ] Browser back/forward cycles between pages without full reload.
- [ ] Unauthenticated access redirects to login.
- [ ] Search query param pre-fills search box. 