Result: feat: allow reader role to manage own educations and works

What changed

- `src/auth/auth.controller.ts`: the six education/work routes under `me` now use `@Roles(RoleEnum.humanBook, RoleEnum.reader)`. `PATCH me/topics` still uses `@AuthRoles(RoleEnum.humanBook)`.
- `src/users/users.service.ts`: dropped the `roleId !== RoleEnum.humanBook` check from `addEducation` and `addWork`, along with the now-unused `ForbiddenException` import. The user-not-found `NotFoundException` is unchanged.
- `src/users/users.service.ts`: owner references renamed from `huberId` to `userId` in the education/work create payloads and the four owner-scoped lookups.
- `prisma/schema.prisma`: `education.userId` and `work.userId` (both `@map("huberId")`), relations renamed to `UserEducation` / `UserWork` on both sides.
- `prisma/migrations/20261010120000_rename_education_work_owner_fk/migration.sql`: drops and recreates `education_huberId_fkey` / `work_huberId_fkey` as `education_userId_fkey` / `work_userId_fkey`.
- `prisma/seed.ts`: seed writes `userId` for education and work.
- `src/auth/auth.controller.spec.ts`: new `profile route roles` block drives the real `RolesGuard` over the controller prototype and asserts reader and humanBook are allowed on all six routes, guest is rejected on all six, and reader is rejected on `PATCH me/topics`.
- `src/users/users.service.spec.ts`: the two "only allow human books" cases became reader-success cases; expectations use `userId`.

What was done

A reader can now create, edit and delete their own education and work entries, and `PATCH /api/v1/auth/me` already worked for them. Two things were blocking it: the `@Roles` guard on the route, and a second `ForbiddenException` raised inside the service on create, so both had to go. Topics of interest stay Huber-only and now have a test that fails if anyone widens that route. Since readers can own these rows, the `huberId` column name no longer described what it holds, so it was renamed to `userId` in the Prisma schema while the physical column stays `huberId` via `@map`.

Notes / follow-up

- Owner scoping was already enforced by `where: { id, userId }` on update and delete, so no change was needed there and a reader still cannot touch another user's row.
- The migration was hand-written because no local Postgres was reachable for `prisma migrate diff`. It is metadata only — no data movement — but worth running `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script` against CI once a database is available, to confirm no drift.
- `npx prisma generate` is required after pulling this branch, otherwise the client still exposes `huberId`.
- `timeSlot.huberId` and `huberFavorite.huberId` were left alone; the latter genuinely means "the favorited Huber".
- Verification: `npm run typecheck` clean, eslint clean on `src/auth` and `src/users`, full unit suite 486/486 passing. No e2e coverage exists for these routes, so a reader token should be exercised manually against a running server before release.