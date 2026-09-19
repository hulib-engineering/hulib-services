# HuLib BE Repo

![image](https://res.cloudinary.com/doyfmg4kx/image/upload/v1748573381/Hulib_gnt6jm.png)

## Description <!-- omit in toc -->

HuLib backend service repository
[Full documentation here](/docs/readme.md)

## Table of Contents <!-- omit in toc -->

- [AI First](#ai-first)
- [Features](#features)
- [Contributors](#contributors)

## AI First

This project is AI-first. Planning, specs, and implementation workflows are driven by AI tools (see `.ai/skills/`). Before starting work, every developer must set up their AI tool.

### Prerequisites: install GitHub CLI

Install the [GitHub CLI](https://cli.github.com/) (`gh`) and authenticate:

```sh
gh auth login
```

The workflows create issues and pull requests through `gh`, so it must be available and signed in.

### Setup `.ai/models.md`

Create/complete the `.ai/models.md` file and fill in the AI tool you use, e.g.:

```md
AI_TOOL=claude
```

Supported values for `AI_TOOL`:

| Value       | Tool                                                        |
| ----------- | ----------------------------------------------------------- |
| `claude`    | Claude (Claude Code)                                        |
| `codex`     | OpenAI Codex                                                |
| `opencode`  | OpenCode                                                    |
| `antigravity` | Antigravity                                               |

If `AI_TOOL` is empty or the file does not exist, the AI assistant will stop and ask which tool you are using before continuing.

Skills are triggered by keywords in your message (e.g. `brainstorm-issue`/`new-task`, `plan`, `implement`, `pr`) and follow the instructions in `.ai/skills/<name>.md`. Task docs live in `.ai/tasks/TASK-<id>.md`.

### Issue title prefix (Conventional Commits)

Issue titles created via the `brainstorm-issue`/`new-task` skill must use a type prefix in Conventional Commits style: `type: short description`.

```text
feat: Add CSV export to reports
fix: Correct timezone on booking dates
refactor: Split user service into modules
```

Common types:

| Type        | Use when                                                        |
| ----------- | ---------------------------------------------------------------- |
| `feat`      | New feature                                                      |
| `fix`       | Bug fix                                                          |
| `refactor`  | Code change that fixes nothing and adds nothing                  |
| `docs`      | Documentation changes                                            |
| `test`      | Adding/updating tests                                            |
| `chore`     | Maintenance, dependencies, build, tooling                        |

### Conventions

#### Branch naming

- Pattern: `<type>/<issue-number>-<kebab-case-slug>`
- Derived from the issue title, which carries the Conventional Commits type prefix above (e.g. `feat: Add CSV export` → `feat/42-add-csv-export`).
- The slug is the short description in kebab-case.
- Branches are always forked from `develop`.

#### Commit messages

- Format: `<type>: <short description>` with the issue number in the body, e.g. `feat: Add CSV export` / body `refs #42`.
- One commit per sub-task. Never bundle multiple sub-tasks into a single commit.

#### File locations

| Purpose                     | Path                              |
| --------------------------- | --------------------------------- |
| Plan files                  | `docs/plans/plan-<issue>.md`      |
| Implementation results      | `docs/results/result-<issue>.md`  |

### Implementation guide (AI flow)

Full development flow, step by step. Write issue is step 0.

| Step | Skill          | Trigger                    | Action                                                                                                  | Output                                  |
| ---- | -------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 0    | write-issue    | `brainstorm-issue`/`new-task` | Write issue (background, requirement, out of scope) and create it on GitHub                          | GitHub issue                            |
| 1    | pull-and-plan  | `plan`                     | Pull issue, break requirements into sub-tasks, present plan for confirmation, then create branch from `develop` and write plan file | Branch + `docs/plans/plan-<issue>.md` |
| 2    | implement-plan | `implement`                | Read plan, implement sub-task by sub-task, one commit per sub-task, then write result file               | `docs/results/result-<issue>.md`        |
| 3    | create-pr      | `pr`/`submit`              | Read plan + result, push branch, create PR that closes the issue                                         | Pull request                            |

Detailed steps:

**Step 0 - Write issue** (`.ai/skills/write-issue.md`)
Think product-first (problem, audience, smallest useful version), then create the GitHub issue with `gh issue create`. The issue title must use a Conventional Commits type prefix, since the type is reused for the branch name.

**Step 1 - Pull and plan** (`.ai/skills/pull-and-plan.md`)
Pull the issue, break requirements into small testable sub-tasks with done-conditions, derive the branch name, and show the plan to the user. STOP and wait for confirmation — nothing is created before the user confirms. After confirmation, fork the branch from `develop` and write the plan.

**Step 2 - Implement** (`.ai/skills/implement-plan.md`)
Implement each sub-task in order, commit each completed sub-task separately, then write the result file.

**Step 3 - Create PR** (`.ai/skills/create-pr.md`)
Read plan and result, push the branch, create a PR using the Summary/Feature/API/Database/Testing/Notes/Checklist body format with `Closes #<issue>`.

## Features

- [x] Database. Support [Prisma](https://www.npmjs.com/package/@prisma/client).
- [x] Seeding.
- [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
- [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer)).
- [x] Sign in and sign up via email.
- [x] Social sign in (Facebook, Google).
- [x] Admin, Huber and Liber roles.
- [x] Internationalization/Translations (I18N) ([nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n)).
- [x] File uploads. Support local and Amazon S3 drivers.
- [x] Swagger.
- [x] E2E and units tests.
- [x] Docker.
- [x] CI (GitHub Actions).
- [x] TBA

## Contributors

TBA