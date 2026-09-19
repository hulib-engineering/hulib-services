# Skill: write-issue

Trigger keyword: `brainstorm-issue` or `new-task`
Args: background=, requirement=

## Steps

1. Read `background` and `requirement` from user input.
2. Think with a product mindset: what problem are we solving, who is it for, what's the smallest useful version.
3. Write issue content, simple and clear:
   - Title: short, action-based, with a Conventional Commits type prefix — `type: short description` (e.g. `feat: Add CSV export to reports`). Common types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
   - Background: 2-4 sentences, why this is needed
   - Requirement: bullet list, what must be true when done
   - Out of scope: 1-2 lines (optional)
4. Push to GitHub using `gh issue create --title "..." --body "..."`
5. Output the issue number and URL to the user.

## Output format (issue body)

```
## Background
<text>

## Requirement
- <item>
- <item>

## Out of scope
- <item>
```
