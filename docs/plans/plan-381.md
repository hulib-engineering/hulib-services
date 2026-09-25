# Plan: feat: Remind Hubers without time slots every 5 days

Issue: #381
Branch: feat/381-remind-hubers-without-time-slots-every-5-days

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Add a nullable per-user `lastTimeSlotReminderAt` field through a Prisma migration and regenerate the Prisma client, without changing the `timeSlot` model | Migration applies cleanly and the field can be read and written for a user |
| 2 | Add a dedicated `timeSlotReminder` notification type to the enum, seed/lookup data, and notification classification, plus an awaitable delivery path | The type is accepted and persisted without a reading-session `relatedEntityId`, and the scheduler can tell whether creation succeeded; `other` is not reused |
| 3 | Implement the eligible-Huber scan and send flow: select active official Hubers with no `timeSlot` rows and whose last reminder is null or at least five days old, send once, then update `lastTimeSlotReminderAt` only after successful persistence | A no-slot Huber is selected, a Huber with any slot row is skipped, failed sends do not advance the timestamp, and concurrent runs cannot produce two sends |
| 4 | Register one recurring global scheduler/queue job that runs every five days and invokes the scan, with restart-safe deduplication and retry behavior | The job runs once per five-day cycle, survives process restarts, and does not resend an already-processed user in the same cycle |
| 5 | Add unit tests and run verification | Tests cover no-slot users, users with slots, five-day deduplication, permanent skipping after a schedule exists, failure/retry, and scheduler invocation; `npm test`, `npm run lint`, and `npm run typecheck` pass |

## Decisions / risks

- Treat the existence of at least one `timeSlot` row as the permanent "schedule is defined" signal; do not add `timeSlotDefinedAt` and do not use `huberSince`. The current `createMany` flow replaces rows and rejects an empty array, so a Huber who has filled a schedule remains excluded.
- This row-existence rule depends on the current API never allowing all slots to be cleared; if that changes, a permanent marker will be required.
- The first global scan runs five days after deployment, so existing no-slot Hubers receive their first reminder on that cycle and newly eligible Hubers wait until the next cycle.
- `NotificationsService.pushNoti` is currently fire-and-forget; the scheduler must use an awaitable persistence path and update the per-user timestamp only after success.
- A dedicated notification type is required because the existing `other` type is validated as a reading-session notification and requires a valid session ID.
- Multiple application instances or a retried job could race; use an atomic claim or a deterministic Bull job ID before sending.
- The current admin lookup returns the first Admin account; handle the no-Admin case with logging and a retry rather than silently losing the reminder.
