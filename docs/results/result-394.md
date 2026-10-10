Result: fix: Accept topic ids as plain values in story payloads

Issue: #394
Branch: fix/394-accept-topic-ids-as-plain-values

## What changed

- src/utils/transformers/topic-ids.transformer.ts: new transformer that accepts `[{ id }]`, `[2]` and `['2']`, normalizes them to `[{ id: number }]` and drops invalid entries.
- src/utils/transformers/topic-ids.transformer.spec.ts: unit tests for the object, number, string, invalid-entry and non-array shapes.
- src/stories/dto/create-story.dto.ts: `topics` now runs through `@Transform(topicIdsTransformer)`; `UpdateStoryDto` inherits it via `PartialType`.
- src/topics/topics.repository.ts: `findByIds` keeps only positive integers, dedupes them and returns `[]` without hitting Prisma when nothing valid is left.
- src/stories/stories.service.spec.ts: covers topic resolution on update, clearing topics with `[]`, and leaving topics untouched when omitted.

## What was done

The frontend was sending `topics: [2, 3]` instead of `[{ id: 2 }, { id: 3 }]`. The service mapped `topic.id` over that array, got `undefined`, and `Number(undefined)` became `NaN`, which Prisma rejected with a validation error and a 500. Topic ids are now normalized at the DTO boundary and filtered again in the repository, so no shape the client sends can produce a `NaN` id in a query.

## Notes / follow-up

- Invalid topic ids are dropped silently rather than rejected with a 400. Worth revisiting if the API should tell the client which ids were wrong.
- The frontend can keep sending plain values, but sending `[{ id }]` remains the documented shape in the Swagger example.
- `npm run typecheck`, `eslint` and all 493 unit tests pass. E2E suites were not run (they need a live database).