# Skill: create-pr

Trigger keyword: `pr` or `submit`
Args: issue=<number>

## Steps

1. Read `docs/plan-<issue>.md` and `docs/result-<issue>.md`.
2. Push current branch.
3. Create PR using `gh pr create` with the format below.
4. Link the issue so it auto-closes on merge.

## Output format (PR body)

Summary

<1-3 sentences, what this PR does>

Related issue

Closes #<issue>

Changes
<change>
<change>
How to test
<step>
<step> 5. Output PR URL to user.
