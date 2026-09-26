import { processInBatches } from './process-in-batches';

describe('processInBatches', () => {
  it('should process every item and return the results', async () => {
    const handler = jest.fn((item: number) => Promise.resolve(item * 2));

    const result = await processInBatches([1, 2, 3], handler, {
      batchSize: 2,
      delayMs: 0,
    });

    expect(result).toEqual({
      total: 3,
      batchCount: 2,
      succeeded: [2, 4, 6],
      failed: 0,
    });
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('should wait between batches but not after the last one', async () => {
    const sleep = jest.fn(() => Promise.resolve());
    const batches: number[][] = [];

    await processInBatches(
      [1, 2, 3, 4, 5, 6, 7],
      (item: number) => Promise.resolve(item),
      {
        batchSize: 3,
        delayMs: 30_000,
        sleep,
        onBatchStart: (_index, items) => batches.push(items),
      },
    );

    expect(batches).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(30_000);
  });

  it('should not sleep when everything fits in one batch', async () => {
    const sleep = jest.fn(() => Promise.resolve());

    await processInBatches([1, 2], (item: number) => Promise.resolve(item), {
      batchSize: 10,
      delayMs: 30_000,
      sleep,
    });

    expect(sleep).not.toHaveBeenCalled();
  });

  it('should keep processing after an item fails', async () => {
    const onItemError = jest.fn();
    const handler = jest.fn((item: number) =>
      item === 2
        ? Promise.reject(new Error('send failed'))
        : Promise.resolve(item),
    );

    const result = await processInBatches([1, 2, 3], handler, {
      batchSize: 2,
      delayMs: 0,
      onItemError,
    });

    expect(result.succeeded).toEqual([1, 3]);
    expect(result.failed).toBe(1);
    expect(onItemError).toHaveBeenCalledWith(expect.any(Error), 2);
  });

  it('should reject an invalid batch size', async () => {
    await expect(
      processInBatches([1], (item: number) => Promise.resolve(item), {
        batchSize: 0,
        delayMs: 0,
      }),
    ).rejects.toThrow('batchSize must be greater than 0');
  });
});
