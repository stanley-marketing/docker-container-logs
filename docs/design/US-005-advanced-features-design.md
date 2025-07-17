# Design Document: Advanced Features Demotion & Agent Integration (US-005)

## Overview
Reposition summaries and search as “Advanced” utilities while empowering the chat agent to surface important data automatically. The UI hides these sections by default, and the ReAct agent gains internal tools to leverage them when needed.

## Goals & Success Criteria
- Main navigation shows only *Ask* (chat) for typical users.
- Summaries & search accessible via an *Advanced* menu or `/dashboard/advanced` route.
- Agent answers user questions using internal calls to summaries/search without user intervention.

## UI/UX Changes
1. **Navigation**
   - Replace nav links with single "Chat" (Ask) entry.
   - Add hamburger/ellipsis button ➜ dropdown with “Advanced Tools”.
2. **Advanced Route**
   - `/dashboard/advanced` layout with tabs for Summaries & Search (reusing existing components).
   - Display banner: “These tools are intended for advanced troubleshooting; most users can rely on the chat assistant.”

## Agent Enhancements
### New Internal Tools
| Tool Name | Description |
|-----------|------------|
| `search_logs(query, topK)` | Wrapper around `vector_search.search` returning IDs + snippets. |
| `get_summary(id)` | Fetch summary text from DB. |
| `get_chunk(id)` | Fetch raw chunk content (first N KB). |

Implement in `react_agent.js` (used by US-003) and register in tool registry. The agent decides when to call these based on the user question.

### Prompt Update
System prompt (chat init):
```
You are a log analysis assistant.
You have internal tools (search_logs, get_summary, get_chunk).
Use them to answer accurately. If the user asks for something you cannot answer, think and decide whether to call a tool.
Do NOT expose tool call JSON to the user; respond with natural language.
```

## Backend Changes
- Expose helper functions in agent context (no new HTTP endpoints required – agent uses DB adapters directly).
- Rate-limit tool usage per session to prevent runaway loops.

## Frontend Changes
- Update navigation component to hide advanced links behind dropdown.
- Implement `/dashboard/advanced` route that lazy-loads existing summaries/search pages.

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User pastes `/dashboard/summaries` link | Page loads; banner explains advanced nature. |
| Agent fails to find data | Responds with apology and suggests user open advanced tools manually. |
| User with no advanced tools permission (future) | 403 or hide links entirely. |

## Security Considerations
- Ensure JWT auth still required for advanced routes.
- Possible future role-based access control (RBAC) to restrict advanced tools.

## Risks & Mitigations
- **User Confusion**: Provide clear guidance/tooltip about advanced tools.
- **Agent Hallucination**: Constrain prompt and limit number of tool calls.

## Minimal Path & Library Choices
- **UI toggle**: simple Tailwind + Headless UI `Menu` component for Advanced dropdown (no custom animations).
- **Advanced route**: `/dashboard/advanced` in Next.js App Router; reuse existing pages via `import` – no new bundler config.
- **Agent tools**: small JS functions inside `react_agent.js`; no external LangChain or OpenAI function-calling API.
- **Search**: existing `vector_search.js` remains in-memory; acceptable for MVP.
- **Summary parsing**: leverage already stored JSON; no extra NLP libs.
- **RBAC (future)**: flag in JWT payload; skip for MVP.
- **Testing**: Vitest for tool integration; Playwright for nav visibility toggle.

---

## Estimated Effort
2–4 dev hours (1 FE, 1 BE, 1 buffer).

## Acceptance Test Checklist
- [ ] Default nav shows only Chat; advanced dropdown present.
- [ ] Summaries/search accessible via `/dashboard/advanced`.
- [ ] Chat agent can answer ‘Show recent errors’ by internally using search_logs & get_summary.
- [ ] No auth bypass on advanced routes. 