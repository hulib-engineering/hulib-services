Result: fix(reading-sessions): pagination is silently ignored on GET /api/v1/reading-sessions

What changed

- `src/reading-sessions/dto/reading-session/find-all-reading-sessions-query.dto.ts`: exported `DEFAULT_READING_SESSIONS_LIMIT = 12`, `DEFAULT_READING_SESSIONS_OFFSET`, and `DEFAULT_READING_SESSIONS_PAGE`. `limit` / `offset` / `page` are now optional and documented with defaults and precedence. `sessionStatuses` accepts a repeated param, a comma-separated list, or a single value so a client multi-select works whichever way it sends it.
- `src/reading-sessions/reading-sessions.service.ts`: replaced the `if (limit && offset)` truthiness guard with a `resolvePage` helper using explicit `undefined` checks. Accepts `page` and `offset` together, `offset` winning. Returns the paginated envelope with `meta.counts`.
- `src/reading-sessions/reading-session.repository.ts`: extracted `buildScope` for ownership and id scoping, `buildSessionWhere` for status and date filtering. `take` now derives only from `limit`, `orderBy` is `startedAt` then `id`, and the `startedAt` / `endedAt` params compose through `where.AND` instead of overwriting each other. Added `countByFilterOption` returning per-tab counts.
- `src/utils/dto/pagination-response.dto.ts`: added `ReadingSessionPageResponseDto`, the standard envelope plus a `counts` breakdown in `meta`.
- `src/reading-sessions/reading-sessions.controller.ts`: documents the new response envelope.
- `src/reading-sessions/reading-sessions.service.spec.ts`: rewrote the stale `findAllSessions` tests and added coverage for the default page size, `offset=0`, `page` alone, `page` + `offset` precedence, the envelope, and the counts.
- `src/reading-sessions/reading-session.repository.spec.ts`: new file covering `take`, `skip`, deterministic ordering, caller scoping, status filtering and multi-select, date-param composition, and the counts breakdown.

What was done

Pagination now actually applies. The original guard required both `limit` and `offset` to be truthy, and since `0` is falsy in JavaScript the most common request — page one — returned every matching row instead of the first twelve. The endpoint now defaults to 12 per page, accepts either `page` or `offset`, and returns totals plus per-tab counts so the client can render pagination controls and filter badges.

While making pagination real, three latent filter bugs surfaced and were fixed. The `upcoming` path hardcoded `take: 1`, which would have silently overridden the page size. It also overwrote `sessionStatus`, making it impossible to combine with `sessionStatuses`. And the explicit `startedAt` / `endedAt` params all wrote to the same `where.startedAt` key, so only the last one applied. The filter builder is now structured around an `AND` array so these compose instead of clobbering each other.

Time-frame filtering was proposed and then dropped at the user's request — "Right now" and "Upcoming" are derived client-side, so the backend does not model them. That also removed the `timeFrame` param and the `upcoming` boolean.

Verification: full suite 473 passed across 29 suites, `npx tsc --noEmit` clean, eslint clean on all touched files.

Notes / follow-up

- **The response envelope is a breaking change for the frontend.** The endpoint returned a bare array and now returns `{ data, meta }`. The client must read `res.data.data` instead of `res.data`, and must handle `meta.counts`. This has to ship in the same release as the client change.
- **`upcoming` was removed rather than deprecated.** The user initially asked for it to be kept as an alias, then chose to drop time-frame filtering entirely, which made it moot. Any caller still sending `upcoming=true` now gets a `422` from the global whitelist pipe. Confirm no other consumer calls this endpoint.
- **`orderBy` is new.** Results now come back `startedAt` desc instead of in unspecified database order. Any client relying on insertion order will see a difference; it is required for pagination correctness when start times tie.
- **`countByFilterOption` issues five `count` queries per request** alongside the page query. They cannot collapse into one grouped query without changing what `all` means. Worth revisiting if this endpoint gets hot.
- `src/hubers/dto/huber-feedback.dto.ts` and `trigger-reading-session-cron.ts` were untracked in the working tree before this work started and are unrelated; they were left alone and are not part of any commit here.