# User Story: Set Dashboard as Application Homepage

## Story ID  
US-002  

## Priority & Effort  
- Priority: High  
- Effort Estimate: Low (1-2 hours)  

## Description  
As a logged-in user, I want the root URL (/) to redirect to the dashboard so that I immediately access core functionality without extra navigation.  

This streamlines the user flow, making the app feel more like a dedicated tool for log debugging.  

## Acceptance Criteria  
- In root `page.tsx`, check authentication and redirect to /dashboard if logged in.  
- For unauthenticated users, display a login page or simple landing (merge any existing homepage content).  
- Update server-side logic (e.g., middleware) if needed for SEO or performance.  
- Test: Post-login, users land on dashboard; direct / access doesn't show dashboard without auth.  
- Ensure no infinite redirect loops.  

## Dependencies  
- Authentication logic (e.g., JWT/token checks in `auth.js`).  
- Next.js middleware or getServerSideProps for redirects.  

## Additional Notes  
- If there's valuable landing page content (e.g., marketing), preserve it for non-logged-in users.  
- This pairs well with story US-001 for a cohesive routing experience.  
- Risks: Auth edge cases (e.g., expired tokens) – add handling.  

## Status  
- Not Started  
- Assigned To: TBD (Dev Agent) 