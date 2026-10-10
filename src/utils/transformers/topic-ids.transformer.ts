import { TransformFnParams } from 'class-transformer/types/interfaces';

type TopicLike = number | string | { id?: number | string } | null;

/**
 * Accepts `[{ id: 1 }]`, `[1]` and `['1']` and normalizes them to `[{ id: 1 }]`.
 * Invalid entries are dropped so the repository never receives `NaN`.
 */
export const topicIdsTransformer = (
  params: TransformFnParams,
): { id: number }[] | undefined => {
  const value = params.value as TopicLike[] | undefined;

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((item) => (item !== null && typeof item === 'object' ? item.id : item))
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0)
    .map((id) => ({ id }));
};
