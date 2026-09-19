# AGENTS.md — Shared Entry Point for All AI Coding Tools

This file is the single source of truth for how any AI assistant (Claude, Codex, OpenCode, Antigravity, etc.) should behave in this repo. Read this file first, every session.

## 1. Model / Tool Assignment

Read `.ai/models.md`. If `AI_TOOL` is empty or the file doesn't exist, stop and ask: "Which AI tool are you using? (claude/codex/opencode/antigravity)" — then write it to `.ai/models.md`.

## 2. Skill Routing Rule

This repo does not rely on native "/slash-command" support. Instead, skills are triggered by **keyword detection** in the user's message.

**Rule:** If the user's message contains one of the trigger keywords below, STOP and:

1. Open the matching file in `.ai/skills/<name>.md`
2. Follow its instructions exactly, using any arguments the user provided (e.g. `specs=`, `background=`, `requirement=`, `issue=`, `plan=`)
3. Produce the output format defined in that skill file (github issue, plan doc, updated task doc, or PR)
4. Do not improvise steps outside what the skill file defines

| Keyword                         | Skill file                     |
| ------------------------------- | ------------------------------ |
| `brainstorm-issue` / `new-task` | `.ai/skills/write-issue.md`    |
| `plan`                          | `.ai/skills/pull-and-plan.md`  |
| `implement`                     | `.ai/skills/implement-plan.md` |
| `pr` / `submit`                 | `.ai/skills/create-pr.md`      |

## 3. Task Documents

All task-related planning/progress docs live in `.ai/tasks/TASK-<id>.md`. Skills read/update this file — never create ad-hoc docs elsewhere.

## 4. General Behavior

- Always check `.ai/tasks/` for existing task doc before starting new work
- Never skip a skill's defined steps, even if the tool "already knows how"
- If no keyword matches, behave as a normal assistant (no forced skill)
