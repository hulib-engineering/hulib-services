Result: Allow reader to submit post-session feedback for Huber

What changed

- `prisma/schema.prisma`: Added `feedbackSubmittedAt`, `feelingRating`, `satisfactionRating`, `sessionContent`, `huberRating`, `huberContent`, and `huberFeedbackSkipped` to `readingSession`; linked `feedback` rows to a reading session.
- `prisma/migrations/20261104120000_add_reading_session_feedback/migration.sql`: Migration for the new columns and the `feedback.readingSessionId` foreign key.
- `src/reading-sessions/domain/reading-session.ts`: Exposed the feedback fields on the domain model.
- `src/reading-sessions/reading-session.repository.ts`: Mapped the new fields from Prisma and persisted them through `update()`.
- `src/reading-sessions/dto/reading-session/reading-session-response.dto.ts`: Returned the new fields in session responses.
- `src/reading-sessions/dto/reading-session/submit-feedback.dto.ts`: Added the submit-feedback payload with 1..5 rating validation and skip support.
- `src/reading-sessions/reading-sessions.service.ts`: Added `submitFeedback` with reader/finished checks, idempotency, and reader-to-Huber feedback row sync.
- `src/reading-sessions/reading-sessions.controller.ts`: Added `POST /reading-sessions/:id/feedback` for readers.
- `src/users/users.service.ts`: Allowed the presurvey feedback row to be linked to its reading session.
- `src/reading-sessions/*.spec.ts`, `test/reading-sessions/reading-sessions.e2e-spec.ts`: Added unit and e2e coverage.

What was done

Readers can now submit post-call feedback once for a finished session. `GET /reading-sessions/{id}` includes `feedbackSubmittedAt`, `feelingRating`, `satisfactionRating`, `sessionContent`, `huberRating`, `huberContent`, and `huberFeedbackSkipped`. `POST /reading-sessions/{id}/feedback` accepts ratings from 1 to 5, optional written content, and either Huber feedback or `{ "huber": { "skipped": true } }`. Repeating the request returns the already-stored state without creating duplicate feedback rows. The reader-to-Huber feedback record is created or updated in sync.

Notes / follow-up

- Run `prisma migrate deploy` (or `migrate dev`) before deploying; the migration was validated with `prisma validate`/`generate` but not applied to a database here.
- Global validation returns `422` for invalid ratings (not `400`), matching the repo's `ValidationPipe` configuration.
- The e2e spec was added but not executed here because it needs the full test database/server stack. Unit suites (`reading-sessions`, `users`) pass, and `lint`/`typecheck` pass.
- Legacy feedback rows with no `readingSessionId` are adopted by the most recent reader-to-Huber pair row; rows created after this change are linked directly.
