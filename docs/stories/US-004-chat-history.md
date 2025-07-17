# User Story: Persist and Manage Chat Histories

## Story ID
US-004

## Priority & Effort
- Priority: Medium
- Effort Estimate: Medium (3-5 hours)

## Description
As a frequent user, I want chats saved with a "New Chat" button and history list so that I can resume old conversations or start fresh without losing context.

This enhances usability, allowing seamless debugging sessions over time.

## Acceptance Criteria
- Store chat sessions in backend DB (extend qa_sessions table) or localStorage for MVP.
- Add UI for history list (e.g., sidebar with timestamps/titles).
- "New Chat" button creates a new session ID, clears UI, and starts fresh.
- Auto-save messages after each turn; load selected history on click.
- Handle deletion of old chats.
- Test: History persists across reloads; switching chats updates the UI correctly.

## Dependencies
- Chat UI from US-003.
- Backend: New API endpoints for chat CRUD (e.g., /chats, /chats/:id).
- State management for loading/switching sessions.

## Additional Notes
- Backend storage preferred for multi-device sync; localStorage for quick win.
- Auto-title chats based on first question for easy scanning.
- Risks: Data privacy (logs in chats) – add anonymization if needed.

## Status
- Not Started
- Assigned To: TBD (Dev Agent) 