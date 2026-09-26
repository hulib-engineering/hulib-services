# Plan: feat: Remind Hubers without time slots every 5 days

Issue: #381
Branch: feat/381-remind-hubers-without-time-slots-every-5-days

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Add a dedicated `timeSlotReminder` value to the static `NotificationTypeEnum` and notification classification, with an awaitable creation path | The type is accepted and persisted without a reading-session `relatedEntityId`, and the caller can tell whether creation succeeded; `other` is not reused |
| 2 | Implement the eligible-Huber scan and send flow using the existing `timeSlot` relation: select active official Hubers with no `timeSlot` rows and send one in-app reminder to each | Hubers with any slot row are skipped, eligible Hubers receive one reminder, and a failed notification does not abort the remaining scan |
| 3 | Register one global recurring scheduler that runs the scan at 18:00 Vietnam time on days 5, 10, 15, 20, 25 and 30 of every month | The scheduler invokes the scan on the five-day calendar cadence and does not add per-user reminder state or change the time-slot model |
| 4 | Send the notifications in batches of 10 with a 30s pause between batches, using a reusable batching helper | 50 recipients are notified as 10, pause, 10, pause, 10, pause, 10, pause, 10; one failed recipient does not stop its batch or the remaining batches |
| 5 | Add unit tests and run verification | Tests cover no-slot users, users with slots, inactive/non-Huber users, notification failure handling, batching and scheduler invocation; `npm test`, `npm run lint`, and `npm run typecheck` pass |

## Decisions / risks

- Treat the existence of at least one `timeSlot` row as the permanent "schedule is defined" signal; do not add `lastTimeSlotReminderAt`, `timeSlotDefinedAt`, or use `huberSince`.
- The scheduler relies on the current `createMany` behavior, which replaces rows and rejects an empty array; if a future API allows clearing all slots, the row-existence rule will need a separate permanent marker.
- The five-day cadence is a fixed calendar schedule (`0 18 5,10,15,20,25,30 * *` with `timeZone: 'Asia/Ho_Chi_Minh'`) rather than a rolling interval, so restarts never shift or skip a run; it assumes a single running application instance, since multiple instances would each run the scan. `waitForCompletion` is enabled so a slow batched run cannot overlap with itself.
- Batching lives in the reusable `processInBatches` helper (`src/utils/process-in-batches.ts`) because the same fetch-then-send-in-batches pattern will be reused; the sleep function is injectable so tests do not wait 30s.
- The current admin lookup returns the first Admin account; if no Admin exists, log the problem and skip the scan rather than sending an invalid notification.
- A dedicated notification type is required because the existing `other` type is validated as a reading-session notification and requires a valid session ID.
- `notification.notificationType` is a plain `String @db.VarChar` column with no relation to the legacy `notificationType` lookup table, so the type only needs to exist in the static enum; no seed row and no migration are required.
- The scheduler uses the existing notification persistence path so it only reports a successful send when the database record is created.
