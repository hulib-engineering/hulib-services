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