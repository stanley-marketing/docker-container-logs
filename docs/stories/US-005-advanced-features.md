# User Story: Demote Summaries/Search to Advanced Features

## Story ID
US-005

## Priority & Effort
- Priority: Medium
- Effort Estimate: Medium (2-4 hours)

## Description
As a general user, I want summaries and search hidden or de-emphasized, with the chat agent serving key data automatically so that I don't need manual tools – the agent handles everything intelligently.

This keeps the app simple, with the agent as the "do everything" entry point.

## Acceptance Criteria
- Move summaries/search to an "Advanced" route or collapsible UI section.
- Integrate search/summaries into the chat agent (e.g., agent queries them internally and presents digested results).
- Agent responds to queries like "Show recent errors" by fetching/summarizing key data.
- Ensure advanced features are accessible but not prominent in main nav.
- Test: General users see chat-first; advanced users can still access full tools.

## Dependencies
- Chat agent from US-003.
- Existing vector search in `src/vector_search.js`.
- UI updates to nav/routes from US-001.

## Additional Notes
- Emphasize agent smarts: E.g., if user asks for data, agent says "Pulling from logs..." and serves it.
- This story "hides" advanced functionality as requested, making the app more approachable.
- Risks: Over-reliance on agent – ensure fallbacks if AI fails.

## Status
- Not Started
- Assigned To: TBD (Dev Agent) 