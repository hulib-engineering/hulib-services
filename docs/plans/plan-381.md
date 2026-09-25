# Plan: feat: Remind Hubers without time slots every 5 days

Issue: #381
Branch: feat/381-remind-hubers-without-time-slots-every-5-days

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Add a dedicated `timeSlotReminder` notification type to the enum, seed/lookup data, and notification classification, with an awaitable creation path | The type is accepted and persisted without a reading-session `relatedEntityId`, and the caller can tell whether creation succeeded; `other` is not reused |
| 2 | Implement the eligible-Huber scan and send flow using the existing `timeSlot` relation: select active official Hubers with no `timeSlot` rows and send one in-app reminder to each | Hubers with any slot row are skipped, eligible Hubers receive one reminder, and a failed notification does not abort the remaining scan |
| 3 | Register one global recurring scheduler that runs the scan once every five days | The scheduler invokes the scan on the five-day cadence and does not add per-user reminder state or change the time-slot model |
| 4 | Add unit tests and run verification | Tests cover no-slot users, users with slots, inactive/non-Huber users, notification failure handling, and scheduler invocation; `npm test`, `npm run lint`, and `npm run typecheck` pass |

## Decisions / risks

- Treat the existence of at least one `timeSlot` row as the permanent "schedule is defined" signal; do not add `lastTimeSlotReminderAt`, `timeSlotDefinedAt`, or use `huberSince`.
- The scheduler relies on the current `createMany` behavior, which replaces rows and rejects an empty array; if a future API allows clearing all slots, the row-existence rule will need a separate permanent marker.
- The five-day cadence is implemented as one global scan, so it assumes a single running application instance; multiple instances could execute the scan more than once.
- The current admin lookup returns the first Admin account; if no Admin exists, log the problem and skip the scan rather than sending an invalid notification.
- A dedicated notification type is required because the existing `other` type is validated as a reading-session notification and requires a valid session ID.
- The scheduler uses the existing notification persistence path so it only reports a successful send when the database record is created.
