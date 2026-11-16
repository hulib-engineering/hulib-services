# Plan: Allow reader to submit post-session feedback for Huber

Issue: #413
Branch: feat/413-allow-reader-to-submit-post-session-feedback-for-huber

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Add feedback fields to `readingSession` in Prisma schema and create a migration: `feedbackSubmittedAt DateTime?`, `feelingRating Int?`, `satisfactionRating Int?`, `sessionContent String?`, `huberRating Int?`, `huberContent String?`, `huberFeedbackSkipped Boolean @default(false)` | Migration applies cleanly and `prisma generate` succeeds |
| 2 | Expose the new fields on `ReadingSession` domain, map them in `readingSessionToDomain`, and persist them in `ReadingSessionRepository.update()` | `GET /reading-sessions/{id}` returns all seven fields (null/false before submission) |
| 3 | Add the seven fields to `ReadingSessionResponseDto` with Swagger and validation decorators | Swagger documents them and response serialization passes |
| 4 | Create `SubmitFeedbackDto` with nested `huber: { rating?, content?, skipped }`; enforce integer ratings 1..5 and require `huber.rating` unless `skipped=true` | Invalid payloads (0, 6, non-integer, missing Huber rating when not skipped) return 400 |
| 5 | Implement `submitFeedback(id, userId, dto)` in `ReadingSessionsService`: 404 when missing, 403 when caller is not `readerId`, 422 when status is not `finished`; persist fields and set `feedbackSubmittedAt`; sync the reader-to-Huber `feedback` row; make repeat calls no-ops that return the current state | Unit tests cover success, skip, validation, forbidden caller, non-finished session, and idempotent repeat |
| 6 | Add `POST /reading-sessions/{id}/feedback` to the controller with JWT + reader role guard and Swagger annotations, returning the updated session detail | E2E succeeds for reader on finished session and is blocked for Huber/non-finished sessions |
| 7 | Add unit and e2e coverage for the endpoint and repository mapping | `npm test` and the reading-sessions e2e suite pass |
| 8 | Write `docs/plans/plan-413.md` (this file) and `docs/results/result-413.md` during implementation | Both docs exist and match the delivered changes |

## Decisions / risks

- `feedback` has no `readingSessionId`, so a reader-to-Huber pair with multiple sessions cannot be matched reliably. Recommendation: add nullable `readingSessionId` plus relation in the same migration and set it in `usersService.addFeedback`; fall back to the latest pair row for legacy rows.
- Idempotency means "already submitted → return existing state without overwriting", because editing after submission is out of scope.
- On skip (`{ "huber": { "skipped": true } }`) store `huberFeedbackSkipped=true`, clear `huberRating`/`huberContent`, and leave the existing feedback row rating unchanged.
- `feedbackSubmittedAt` is set to server time only on the first successful submission.
- `GET /reading-sessions/{id}` currently has no ownership check; this task only adds the new fields and does not change its auth behavior.
