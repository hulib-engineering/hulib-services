Result: feat: Remind Hubers without time slots every 5 days

What changed
src/time-slots/time-slots-reminder.service.ts: new service that selects active official Hubers with no timeSlot rows and sends each one an in-app reminder, scheduled at 18:00 Vietnam time on the 10th of every month, in batches of 10 with a 30s pause between batches
src/utils/process-in-batches.ts: reusable fetch-then-send helper that processes items in fixed batches, waits between batches, and isolates per-item failures
src/utils/process-in-batches.spec.ts: tests for batch splitting, wait behaviour, failure isolation and invalid batch size
src/time-slots/time-slots.module.ts: register the reminder service and import NotificationsModule
src/notifications/notifications.service.ts: add pushNotiAndWait so callers can await persistence and know whether the notification was created; share the list-refetch emitter between pushNoti and the new path
src/notifications/notification-type.enum.ts: add the dedicated timeSlotReminder value to the static enum
src/notifications/notifications.controller.ts: document timeSlotReminder in the create-notification Swagger summary
src/time-slots/time-slots-reminder.service.spec.ts: tests for admin lookup, eligible-Huber query, per-recipient failure isolation, batching, cron configuration and scheduled invocation
src/notifications/notifications.service.spec.ts: tests for timeSlotReminder creation and pushNotiAndWait results

What was done

Implemented the reminder as a single global scan with no new per-user state. At 18:00 Vietnam time (UTC+7) on the 10th of every month the scheduler queries users where role is humanBook, status is active, deletedAt is null, and the timeSlots relation has no rows, then notifies every match using the first Admin account as sender. Recipients are processed in batches of 10 with a 30 second pause between batches, so 50 Hubers are notified as 10, pause, 10, pause, 10, pause, 10, pause, 10 instead of 50 back-to-back calls. A Huber with at least one slot row is never selected, and a failure while notifying one recipient is logged and does not stop the rest of its batch or the remaining batches. Verified with `npm test`, `npm run lint`, and `npm run typecheck` — all pass.

Notes / follow-up
- No schema change or migration is needed: `notification.notificationType` is a plain `String @db.VarChar` column with no relation to the legacy `notificationType` lookup table, so the type lives only in the static enum and needs no seed row.
- No `lastTimeSlotReminderAt` / `timeSlotDefinedAt` column was added; the row-existence rule depends on the current API rejecting empty slot arrays. If clearing all slots becomes possible, a separate permanent marker will be needed.
- The cadence assumes a single running application instance; multiple instances would each run the scan. `waitForCompletion` is enabled so a slow batched run cannot overlap with itself.
- The cron is pinned to `timeZone: 'Asia/Ho_Chi_Minh'` explicitly, so it fires at 18:00 Vietnam time even if the server timezone changes; the rest of the app's schedulers still use the server timezone.
- The issue title still says "every 5 days" but the agreed cadence is now once a month on the 10th, so the issue wording should be updated to match.
- A run over many Hubers is intentionally slow: 500 recipients means 50 batches and roughly 25 minutes of pauses.
- If no Admin account exists the scan logs a warning and sends nothing; the message text is a fixed English `extraNote` that the frontend may want to localize.
