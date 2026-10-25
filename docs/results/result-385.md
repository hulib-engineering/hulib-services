Result: feat: Add huber no-show and pending auto-cancel session notifications

Issue: #385
Branch: feat/385-huber-no-show-auto-cancel
Plan: docs/plans/plan-385.md

## What changed

- `prisma/schema.prisma`: added nullable `huberJoinedAt` and `readerJoinedAt` `DateTime` columns to `readingSession`.
- `prisma/migrations/20261003120000_add_reading_session_attendance/migration.sql`: new migration adding the two columns. Generated with `prisma migrate diff` between the pre-change and current schema, so it contains only the `ALTER TABLE` and was never applied to any database.
- `src/reading-sessions/domain/reading-session.ts`: exposed both new columns as nullable `@ApiProperty` fields.
- `src/reading-sessions/reading-session.repository.ts`: mapped the new columns onto the domain, and added `markAttendance(id, role)` which stamps one column through `updateMany` guarded on that column still being `null`, making a repeat call a no-op.
- `src/reading-sessions/reading-sessions.controller.ts`: added `POST /reading-sessions/:id/attend` behind `AuthGuard('jwt')` + `RolesGuard`, returning `204`.
- `src/reading-sessions/reading-sessions.service.ts`: added `markAttendance(id, userId)` with `404` for a missing session and `403 notSessionParticipant` for anyone who is not the `readerId` or `humanBookId`; added `formatSessionWhen` / `buildHuberNoShowNote` / `buildAutoCancelNote`; added `autoCancelStalePendingSessions(now)` to the existing cron; reworked `markOverdueSessionsAsMissed(now)` to key off `huberJoinedAt: null` instead of `rating: 0`, and to notify the huber as well as the reader; added a terminal-state guard in `updateSession`.
- `src/notifications/notification-type.enum.ts`: added `huberNoShowReadingSession` and `autoCancelReadingSession`.
- `src/notifications/notifications.service.ts`: registered both types in `readingSessionRelatedNotiTypes` so `relatedEntity` resolves to the reading session.
- `src/notifications/notifications.controller.ts`: added both types to the documented `NotificationTypeEnum` list on the find-all endpoint.
- `src/reading-sessions/reading-sessions.service.spec.ts`: 16 new tests covering attendance stamping, the non-participant `403`, the auto-cancel scan, attendance-based missed detection in both directions, the missing-admin path, and the terminal-state guard.

## What was done

Attendance is now recorded explicitly instead of being inferred from ratings. The client reports a join through `POST /reading-sessions/:id/attend`, and the service stamps only the caller's own column, only if it is still empty, so the first join time wins and a third party is rejected.

Two cron scans were added or reworked on the existing 30-minute schedule. A `pending` session whose start time has passed is now auto-cancelled with an audit `rejectReason`, its stale reminder notification is soft-deleted, and the reader is told which huber never responded — this needs no attendance data because an unanswered request is already proof. A past `approved` session with `huberJoinedAt` still `null` is marked `missed` and now notifies the huber with neutral wording as well as the reader.

Because the old missed detection relied on `rating: 0`, an attended but unrated session used to be recorded as missed. It no longer is; that was the point of the change.

## Notes / follow-up

- **Blocking: the client must call `POST /reading-sessions/:id/attend` after joining the Agora channel.** Until that ships, every approved session has `huberJoinedAt = null` and every huber will receive the no-show message. Do not deploy the cron behaviour before the client change is live.
- The migration was never applied to any database, as requested. Apply it with `npx prisma migrate deploy` on the server. Until it runs, both the `attend` endpoint and the `huberJoinedAt: null` cron query will fail at runtime.
- Local database drift exists independently of this change: the local DB records `20260731163104_init`, which is absent from `prisma/migrations/`, and four repo migrations are unapplied locally. `prisma migrate dev` would offer to reset and wipe local data, which is why `migrate diff` was used instead. Worth reconciling separately.
- Notification copy lives in `notification.extraNote` because notification text is not i18n-backed in this codebase; only email templates have `src/i18n` files. The copy is currently English-only and hardcoded in the service. If Vietnamese is needed, the helpers are the place to localise.
- Detection latency is up to one cron interval: a no-show is reported 0-30 minutes after `endedAt`, and an auto-cancel fires 0-30 minutes after `startedAt`. Changing the interval was out of scope.
- The 30-minute schedule assumes a single running application instance, since multiple instances would each run all three scans.
- Verification: `npm test` 448 passed / 28 suites, `npm run lint` clean, `npm run typecheck` clean, `npx prisma validate` valid, Prettier clean.
