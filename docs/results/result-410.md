Result: feat: Add upcoming reading sessions API

Issue: #410
Branch: feat/410-add-upcoming-reading-sessions-api

## What changed

- src/reading-sessions/dto/reading-session/find-upcoming-reading-sessions-query.dto.ts: new query DTO with `withinHours` (default 24, 1-168) and `limit` (default 5, 1-50) validation and Swagger metadata.
- src/reading-sessions/dto/reading-session/upcoming-reading-session-response.dto.ts: minimal response DTOs for the session, counterpart, and `meta`.
- src/reading-sessions/reading-session.repository.ts: new `findUpcoming` query scoped to approved sessions where the caller is a participant, still not ended, and starting within the window, ordered by `startedAt asc, id asc`.
- src/reading-sessions/reading-sessions.service.ts: new `findUpcomingSessions` that computes the server time once, resolves the counterpart relative to the caller, and returns `{ data, meta }`.
- src/reading-sessions/reading-sessions.controller.ts: new authenticated `GET /reading-sessions/upcoming` route declared before `:id`.
- src/reading-sessions/reading-sessions.controller.spec.ts: controller delegation coverage.
- src/reading-sessions/reading-sessions.service.spec.ts: default/forwarded params, counterpart resolution for both roles, minimal fields, and metadata coverage.
- src/reading-sessions/reading-session.repository.spec.ts: filter, ordering, limit, and participant-include coverage.
- test/reading-sessions/reading-sessions.e2e-spec.ts: auth, query validation, and response-shape coverage.

## What was done

Added an upcoming-sessions endpoint that returns only approved sessions the authenticated user participates in, from now until `withinHours` ahead (default 24h). Results are sorted by start time ascending and capped by `limit` (default 5). Each item exposes only the session id, status, start/end times, and the other participant using the system's existing `fullName` and `photo` shape plus `role`. The response includes `meta.count` and a UTC `serverTime`. Soft-deleted sessions are not filtered out, matching the existing reading-session list query.

## Notes / follow-up

- Tests and Prisma commands were not run per instruction. The local Prisma client is stale (it lacks the `startTime`/`endTime` fields that are already in `schema.prisma`), so typecheck/test runs show unrelated pre-existing errors until `prisma generate` runs on the server.
- The endpoint intentionally returns the raw `photo` object (`{ id, path }`) used by notification payloads rather than resolving a signed URL.
- E2E coverage assumes an approved session exists in the test window; it asserts the envelope and per-item shape without requiring a seeded session.
