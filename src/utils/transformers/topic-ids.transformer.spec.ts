import { topicIdsTransformer } from './topic-ids.transformer';

describe('topicIdsTransformer', () => {
  it('should keep object ids untouched', () => {
    expect(
      topicIdsTransformer({ value: [{ id: 2 }, { id: 3 }] } as never),
    ).toEqual([{ id: 2 }, { id: 3 }]);
  });

  it('should normalize plain numbers and numeric strings', () => {
    expect(topicIdsTransformer({ value: [2, '3'] } as never)).toEqual([
      { id: 2 },
      { id: 3 },
    ]);
  });

  it('should drop invalid entries so prisma never receives NaN', () => {
    expect(
      topicIdsTransformer({
        value: [undefined, null, {}, 'abc', 0, -1, 1.5, 7],
      } as never),
    ).toEqual([{ id: 7 }]);
  });

  it('should return undefined when no array is given', () => {
    expect(topicIdsTransformer({ value: undefined } as never)).toBeUndefined();
    expect(topicIdsTransformer({ value: 'nope' } as never)).toBeUndefined();
  });
});
