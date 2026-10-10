# Plan: feat: allow reader role to manage own educations and works

Issue: #392
Branch: feat/392-allow-reader-to-manage-own-profile

## Sub-tasks

| #  | Sub-task | Done condition |
| -- | -------- | -------------- |
| 1  | Widen `@Roles` on the 6 education/work routes in `src/auth/auth.controller.ts` to `@Roles(RoleEnum.humanBook, RoleEnum.reader)` | No education/work route is gated on `humanBook` alone; `auth.controller.spec.ts` still passes |
| 2  | Remove the `roleId !== RoleEnum.humanBook` check from `UsersService.addEducation` and `UsersService.addWork` | A reader can `POST /me/educations` and `POST /me/works` without `ForbiddenException` |
| 3  | Rename `education.huberId` / `work.huberId` to `userId` in `prisma/schema.prisma` (`@map("huberId")`), generate the migration, update all references | Migration is non-destructive, DB column name unchanged, `users.service.ts` and specs use `userId` |
| 4  | Add tests: reader succeeds on education/work, reader still rejected on `PATCH /me/topics`, guest rejected everywhere | Each new case fails if the corresponding guard is reverted |
| 5  | Run lint, typecheck and affected suites | All green |

## Implementation order

1. Guard widening (sub-task 1)
2. Service role-check removal (sub-task 2) — depends on 1, otherwise dead code
3. FK rename (sub-task 3) — independent, can land in the same branch
4. Tests (sub-task 4) — covers 1 and 2
5. Verification (sub-task 5)

## Reference: current state

| Route | Line (`auth.controller.ts`) | Current guard |
| ----- | --------------------------- | ------------- |
| `POST   /me/educations`         | 322 | `@Roles(RoleEnum.humanBook)` |
| `PATCH  /me/works/:id`          | 383 | `@Roles(RoleEnum.humanBook)` |
| `PATCH  /me/educations/:id`     | 358 | `@Roles(RoleEnum.humanBook)` |
| `DELETE /me/educations/:id`     | 408 | `@Roles(RoleEnum.humanBook)` |
| `POST   /me/works`              | 347 | `@Roles(RoleEnum.humanBook)` |
| `DELETE /me/works/:id`          | 423 | `@Roles(RoleEnum.humanBook)` |
| `PATCH  /me/topics`             | 332 | `@AuthRoles(RoleEnum.humanBook)` — **stays** |

Service-level blockers (`src/users/users.service.ts`):

- 675-682 `addEducation` — `onlyHumanBooksCanAddEducation`
- 781-788 `addWork` — `onlyHumanBooksCanAddWork`

Already owner-scoped, no change needed: `updateEducation` (715), `updateWork` (817),
`deleteEducation` (855), `deleteWork` (878).

## Decisions / risks

- **The 403 has two sources.** Widening guards alone still returns 403 because
  `addEducation`/`addWork` throw `ForbiddenException` in the service. Sub-task 2 is mandatory.
- `PATCH /me/topics` intentionally stays Huber-only. A test pins this so the rule is not
  widened by accident.
- `guest` (role 4) remains rejected on every route.
- `@map("huberId")` keeps the physical column name, so the migration only changes the Prisma
  schema, not the database. Safe to roll out without a data migration.
- `timeSlot.huberId` and `huberFavorite.huberId` are untouched — the latter genuinely means
  "the favorited Huber".
- Readers will own rows in tables whose columns read `huberId`; that is now consistent after
  the rename rather than misleading.
- No e2e coverage exists for these routes. Verification is unit tests plus one manual
  reader-token call against a running server.