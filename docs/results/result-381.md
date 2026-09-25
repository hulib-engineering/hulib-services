Result: feat: Remind Hubers without time slots every 5 days

What changed
src/time-slots/time-slots-reminder.service.ts: new service that selects active official Hubers with no timeSlot rows and sends each one an in-app reminder, guarded by a 5-day global @Interval schedule
src/time-slots/time-slots.module.ts: register the reminder service and import NotificationsModule
src/notifications/notifications.service.ts: add pushNotiAndWait so callers can await persistence and know whether the notification was created; share the list-refetch emitter between pushNoti and the new path
src/notifications/notification-type.enum.ts: add the dedicated timeSlotReminder value to the static enum
src/notifications/notifications.controller.ts: document timeSlotReminder in the create-notification Swagger summary
src/time-slots/time-slots-reminder.service.spec.ts: tests for admin lookup, eligible-Huber query, per-recipient failure isolation, and scheduled invocation
src/notifications/notifications.service.spec.ts: tests for timeSlotReminder creation and pushNotiAndWait results

What was done

Implemented the reminder as a single global scan with no new per-user state. Every five days the scheduler queries users where role is humanBook, status is active, deletedAt is null, and the timeSlots relation has no rows, then sends one in-app notification per match using the first Admin account as sender. A Huber with at least one slot row is never selected, and a failure while notifying one recipient is logged and does not stop the remaining scan. Verified with `npm test` (27 suites, 425 tests), `npm run lint`, and `npm run typecheck` — all pass.

Notes / follow-up
- No schema change or migration is needed: `notification.notificationType` is a plain `String @db.VarChar` column with no relation to the legacy `notificationType` lookup table, so the type lives only in the static enum and needs no seed row.
- No `lastTimeSlotReminderAt` / `timeSlotDefinedAt` column was added; the row-existence rule depends on the current API rejecting empty slot arrays. If clearing all slots becomes possible, a separate permanent marker will be needed.
- The five-day cadence assumes a single running application instance; multiple instances would each run the scan.
- If no Admin account exists the scan logs a warning and sends nothing; the message text is a fixed English `extraNote` that the frontend may want to localize.
- The first run happens five days after the app starts rather than on a fixed calendar day.
