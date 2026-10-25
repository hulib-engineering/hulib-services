# Plan: fix: Accept topic ids as plain values in story payloads

Issue: #394
Branch: fix/394-accept-topic-ids-as-plain-values

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Add `topicIdsTransformer` in `src/utils/transformers/` that normalizes `[{ id }]`, `[2]` and `['2']` to `[{ id: number }]` and drops invalid entries | Unit tests cover the object, number, string, invalid-entry and non-array shapes |
| 2 | Apply `@Transform(topicIdsTransformer)` to `topics` in `CreateStoryDto` (inherited by `UpdateStoryDto` through `PartialType`) | An update payload with `topics: [2, 3]` reaches `StoriesService.update` as `[{ id: 2 }, { id: 3 }]` |
| 3 | Guard `TopicsRepository.findByIds`: filter to positive integers, dedupe, short-circuit to `[]` when nothing valid remains | No Prisma query is ever issued with `NaN`, `null` or `undefined` ids |
| 4 | Verify an empty `topics` list still clears the story's topics (`deleteMany` + `create: []`) | `StoriesService.update` with `topics: []` attaches no topics |
| 5 | Run `npm run typecheck`, `eslint` and the unit test suites | All green |

## Decisions / risks

- Invalid topic ids are silently dropped rather than rejected with a 400, so a typo'd topic id results in no topics attached instead of an error response.
- The transformer lives in `src/utils/transformers/` to match the existing `lowerCaseTransformer` convention.
- `findByIds` is the last line of defence and also hardens every other caller of the repository.