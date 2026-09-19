# Skill: pull-and-plan

Trigger keyword: `plan`
Args: issue=<number>

## Steps

1. Run `gh issue view <issue> --json title,body` to pull issue content.
2. Brainstorm: list possible solutions, pick the simplest one that meets requirements.
3. List problems/risks that could come up (edge cases, dependencies, breaking changes).
4. Write plan file to `docs/plan-<issue>.md`.

## Output format (docs/plan-<issue>.md)
