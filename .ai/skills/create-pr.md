# Skill: create-pr

Trigger keyword: `pr` or `submit`
Args: issue=<number>

## Steps

1. Read `docs/plans/plan-<issue>.md` and `docs/results/result-<issue>.md`.
2. Push current branch.
3. Create PR using `gh pr create` with the body format below.
4. Link the issue so it auto-closes on merge (`Closes #<issue>`).
5. Output PR URL to user.

## Output format (PR body)

Replace every placeholder with content derived from the plan and result files.

```
## Summary

### Feature

* What feature is implemented?
* What problem does it solve?
* What is the expected behavior?

### Changes

* [ ] Add / update API endpoints
* [ ] Add / update business logic
* [ ] Add / update database schema
* [ ] Add / update validation
* [ ] Other: <specify>

### API

* `METHOD /api/...` — Description
* `METHOD /api/...` — Description

### Database

* Changes to schema/migrations: <describe>
* Data migration or seed required: Yes / No

### Testing

* Unit tests: <describe>
* Integration / E2E tests: <describe>
* Manual testing: <describe>

### Notes

* Important implementation details
* Breaking changes
* Dependencies or configuration changes

### Checklist

* [ ] Tests pass
* [ ] Lint passes
* [ ] Migration created/applied
* [ ] API/documentation updated if needed
* [ ] No unrelated changes

Closes #<issue>
```
