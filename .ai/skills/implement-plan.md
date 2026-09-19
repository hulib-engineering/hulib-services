# Skill: implement-plan

Trigger keyword: `implement`
Args: plan=docs/plans/plan-<issue>.md

## AI flow

This skill is step 2. It runs after `plan` (step 1) wrote `docs/plans/plan-<issue>.md`.

## Steps

1. Read the plan file `docs/plans/plan-<issue>.md`.
2. Implement sub-task by sub-task, in order, following the plan.
3. Write clean code, minimal comments (only where logic isn't obvious).
4. For each completed sub-task, commit it separately with a commit message matching the sub-task, e.g. `feat: <sub-task description>` (see repo style in `git log`). Do not bundle multiple sub-tasks into one commit.
5. After finishing all sub-tasks, write result file to `docs/results/result-<issue>.md` (NOT directly under `docs/`).
6. Tell user: implementation done, result saved at `docs/results/result-<issue>.md`.

## Output format (docs/results/result-<issue>.md)

Result: <issue title>
What changed
<file>: <short description>
<file>: <short description>
What was done

<short summary, plain language>

Notes / follow-up
<anything left, anything to check>
