# Skill: pull-and-plan

Trigger keyword: `plan`
Args: issue=<number>

## AI flow

Full development flow (write issue is step 0):

| Step | Skill | Trigger | Output |
| ---- | ----- | ------- | ------ |
| 0 | write-issue | `brainstorm-issue` / `new-task` | GitHub issue |
| 1 | pull-and-plan | `plan` | Branch from `develop` + `docs/plans/plan-<issue>.md` (after confirm) |
| 2 | implement-plan | `implement` | `docs/results/result-<issue>.md` |
| 3 | create-pr | `pr` / `submit` | Pull request (closes issue) |

This skill is step 1. It must not run until step 0 (the issue) exists.

## Steps

1. Run `gh issue view <issue> --json title,body` to pull issue content.
2. Break the issue requirements into sub-tasks:
   - Each sub-task is small, testable, has a clear done-condition.
   - Order them into implementation order (dependencies first, one task per unit of change).
   - Note edge cases / risks that apply to each sub-task where relevant.
3. Derive the conventional branch name from the issue title (naming rules in `README.md`).
4. Present the proposed plan (sub-tasks + branch name) to the user for confirmation (see output format below).
5. STOP. Do NOT create the branch or write any file yet. Wait for the user's confirmation.
6. Only after the user confirms, create the branch forked from `develop`: `git fetch origin develop && git checkout -b <branch> origin/develop`.
7. Write the plan file to `docs/plans/plan-<issue>.md` (NOT directly under `docs/`).
8. Output the plan file path and branch name to the user.

## Output to user (ask before writing the file)

Show this, then wait for confirmation:

```
Plan for #<issue>
<issue title>

Branch to create (forked from develop):
<type>/<issue>-<kebab-slug>

Sub-tasks to confirm (in order):
1. <sub-task> — done when: <condition>
2. <sub-task> — done when: <condition>

Decisions / risks:
- <item>
- <item>

Confirm to create branch and write docs/plans/plan-<issue>.md
```

## Output format (docs/plans/plan-<issue>.md)

```
# Plan: <issue title>

Issue: #<issue>
Branch: <type>/<issue>-<kebab-slug>

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | <sub-task> | <condition> |
| 2 | <sub-task> | <condition> |

## Decisions / risks
- <item>
- <item>
```