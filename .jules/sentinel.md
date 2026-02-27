## 2026-02-05 - Missing Auth on Internal Endpoints
**Vulnerability:** The `/api/internal/claude-generate` and `/api/internal/save-content` endpoints were accessible without authentication, allowing any user (or unauthenticated attacker) to generate AI content (costing money) or write files to the server.
**Learning:** Placing API routes in an `internal/` folder does not automatically protect them. Middleware protection can be bypassed or misconfigured. Defense-in-depth requires explicit `getServerSession` checks within the route handlers themselves.
**Prevention:** Always verify `session.user.role` inside sensitive API routes using `getServerSession`. Do not rely solely on middleware.
