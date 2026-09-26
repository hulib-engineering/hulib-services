export interface ProcessInBatchesOptions<T> {
  batchSize: number;
  delayMs: number;
  sleep?: (ms: number) => Promise<void>;
  onItemError?: (error: unknown, item: T) => void;
  onBatchStart?: (batchIndex: number, items: T[]) => void;
}

export interface ProcessInBatchesResult<R> {
  total: number;
  batchCount: number;
  succeeded: R[];
  failed: number;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const processInBatches = async <T, R>(
  items: T[],
  handler: (item: T) => Promise<R>,
  options: ProcessInBatchesOptions<T>,
): Promise<ProcessInBatchesResult<R>> => {
  const { batchSize, delayMs, sleep = defaultSleep } = options;

  if (batchSize <= 0) {
    throw new Error('batchSize must be greater than 0');
  }

  const batchCount = Math.ceil(items.length / batchSize);
  const succeeded: R[] = [];
  let failed = 0;

  for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
    const start = batchIndex * batchSize;
    const batch = items.slice(start, start + batchSize);

    options.onBatchStart?.(batchIndex, batch);

    for (const item of batch) {
      try {
        succeeded.push(await handler(item));
      } catch (error) {
        failed += 1;
        options.onItemError?.(error, item);
      }
    }

    if (batchIndex < batchCount - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return { total: items.length, batchCount, succeeded, failed };
};
