# Skill: implement-plan

Trigger keyword: `implement`
Args: plan=docs/plan-<issue>.md

## Steps

1. Read the plan file.
2. Implement step by step, in order.
3. Write clean code, minimal comments (only where logic isn't obvious).
4. After finishing, write result file to `docs/result-<issue>.md`.

## Output format (docs/result-<issue>.md)

Result: <issue title>
What changed
<file>: <short description>
<file>: <short description>
What was done

<short summary, plain language>

Notes / follow-up
<anything left, anything to check> 5. Tell user: implementation done, result saved at `docs/result-<issue>.md`.
