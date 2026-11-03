# Plan: feat: Add upcoming reading sessions API

Issue: #410
Branch: feat/410-add-upcoming-reading-sessions-api

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Add `FindUpcomingReadingSessionsQueryDto` with `withinHours` (default 24, min 1, max 168) and `limit` (default 5, min 1, max 50), plus Swagger metadata | Invalid values return 400; omitted values fall back to the defaults |
| 2 | Add `ReadingSessionRepository.findUpcoming` scoped to `APPROVED`, caller as `humanBookId` or `readerId`, `endedAt >= now`, `startedAt <= now + withinHours`, ordered by `startedAt asc, id asc`, `take limit`, with both participants included | Only matching sessions are returned, in ascending start order |
| 3 | Add minimal response DTOs: session `id`, `sessionStatus`, `startedAt`, `endedAt`, counterpart `{ id, fullName, photo, role }`, and `meta { count, serverTime }` | Response matches the issue contract using the system's existing `fullName` + `photo` user shape |
| 4 | Add `ReadingSessionsService.findUpcomingSessions` computing `now` once, resolving the counterpart relative to the caller, and returning `serverTime` as UTC ISO | Counterpart is the other participant; `meta.count` equals the returned item count |
| 5 | Add `GET /reading-sessions/upcoming` controller route with JWT + Swagger, declared before `:id` | `/reading-sessions/upcoming` is not captured by the `:id` route |
| 6 | Add unit/e2e tests for filtering, authorization, sorting, counterpart resolution, meta and query validation | `npm run test`, `npm run typecheck` and `npm run lint` pass |

## Decisions / risks

- Counterpart user shape follows the notification payload convention: `fullName` for the name and the existing `photo` object (`{ id, path } | null`) for the avatar, plus `role` derived from the user's `role.name`.
- Soft-deleted sessions are not filtered out, matching the existing reading-session list query; the query is already bounded to the next 24 hours by default.
- In-progress sessions are included because the lower bound is only `endedAt >= now`.
- `withinHours` is capped at 168 (7 days) and `limit` at 50 to keep the endpoint bounded.
