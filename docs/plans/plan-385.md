# Plan: feat: Add huber no-show and pending auto-cancel session notifications

Issue: #385
Branch: feat/385-huber-no-show-auto-cancel

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Add nullable `huberJoinedAt` / `readerJoinedAt` `DateTime` columns to `readingSession` in `prisma/schema.prisma` plus a Prisma migration, and expose both as nullable `@ApiProperty` fields on the `ReadingSession` domain class (`src/reading-sessions/domain/reading-session.ts`) | The migration applies cleanly with no backfill, and both fields are exposed as nullable on the domain class |
| 2 | Add `POST /reading-sessions/:id/attend` with `AuthGuard('jwt')` + `RolesGuard` (matching `create` at `src/reading-sessions/reading-sessions.controller.ts:54`) and a `markAttendance(id, userId)` service method | `404` when the session is missing, `403` when the caller is neither `readerId` nor `humanBookId`, the matching column is stamped, and a second call does not overwrite the original timestamp |
| 3 | Add `huberNoShowReadingSession` and `autoCancelReadingSession` to `NotificationTypeEnum` and register both in `readingSessionRelatedNotiTypes` (`src/notifications/notifications.service.ts:24`) | Both types are persisted and `relatedEntity` resolves to the reading session for each |
| 4 | Add a private copy helper rendering `startTime - endTime` plus a localized `sessionDate`, using neutral wording for the no-show message and substituting `{huberName}` for the auto-cancel message, returned through `extraNote` | Both strings match the agreed wording and follow the `startTime - endTime` / `sessionDate` format already used by the booking and reminder emails |
| 5 | Auto-cancel stale `pending` sessions inside the existing 30-minute `@Cron` (`src/reading-sessions/reading-sessions.service.ts:361`): query `sessionStatus = pending` with `startedAt < now`, set `canceled` + `rejectReason`, soft-delete the reminder notification, then notify the reader | A past `pending` session ends as `canceled` with a `rejectReason`, its reminder notification is soft-deleted, and the reader is notified exactly once |
| 6 | Rework `markOverdueSessionsAsMissed()` to detect a no-show from `huberJoinedAt === null` instead of `rating === 0`, then notify the huber with `huberNoShowReadingSession` and the reader with the existing `missReadingSession` | An `approved` past session with `huberJoinedAt = null` becomes `missed` and notifies both parties, while a stamped `huberJoinedAt` is left untouched |
| 7 | Guard `updateSession` so `approved` / `rejected` transitions are refused on sessions already in a terminal state (`canceled`, `missed`, `finished`, `rejected`) | Approving a session that was auto-cancelled is rejected instead of flipping its status back, and a late reject on a terminal session is rejected |
| 8 | Add unit tests to `src/reading-sessions/reading-sessions.service.spec.ts` and run verification | Tests cover attendance stamping and the non-participant `403`, the auto-cancel path, attendance-based missed detection (both branches), and the terminal-state guard; `npm test`, `npm run lint`, and `npm run typecheck` pass |

## Decisions / risks

- No-show detection is based on explicit attendance, not ratings. Ratings are a reader action that happens after the call, so `rating = 0` cannot prove the huber was absent; detecting on it would falsely accuse Hubers who attended and simply went unrated.
- Attendance is recorded by the client calling `POST /reading-sessions/:id/attend` after it successfully joins the Agora channel. This is a hard frontend dependency: until that call ships, every approved session looks like a no-show, so the feature must not be enabled before it lands.
- `markOverdueSessionsAsMissed()` changes behaviour beyond the original issue text: an attended but unrated session no longer becomes `missed`. This is the intent of the fix, but it also changes the existing post-session rating-prompt flow.
- Agora is not used as the attendance source. All RTC tokens are issued with uid `0` (`src/web-rtc/web-rtc.service.ts:33`, `src/agora/web-rtc.service.ts:66`), so Agora cannot distinguish the two participants, and the user-list REST endpoint would additionally require polling during the call. Cloud recording is also rejected as a signal because it is client-triggered via `POST /agora/recording/start` with a client-supplied channel (`src/agora/agora.controller.ts:36`).
- The 30-minute cron interval is retained, so a no-show is detected 0-30 minutes after `endedAt` and an auto-cancel fires 0-30 minutes after `startedAt`. The latency is documented in a code comment rather than changing the schedule, which is out of scope.
- Idempotency needs no dedupe column: once a session becomes `canceled` or `missed` it no longer matches either query, so each notification fires at most once per session.
- The migration is additive (two nullable columns) and needs no backfill, so it is safe to apply to a live database.
- Sender for both new notifications is the admin id from `getAdminId()`, matching the existing `missReadingSession` and `sessionFinish` patterns; when no Admin exists the send is skipped rather than emitting an invalid notification.
- `notification.notificationType` is a plain `String @db.VarChar` column unrelated to the legacy `notificationType` lookup table, so the new types need only exist in the static enum; no seed row is required.
