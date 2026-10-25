import { ReadingSessionRepository } from './reading-session.repository';
import { ReadingSessionStatus } from './domain';

describe('ReadingSessionRepository', () => {
  let repository: ReadingSessionRepository;
  let prisma: {
    readingSession: { findMany: jest.Mock; count: jest.Mock };
    $transaction: jest.Mock;
  };

  const filters = { userId: 5 } as never;

  beforeEach(() => {
    prisma = {
      readingSession: { findMany: jest.fn(), count: jest.fn() },
      $transaction: jest.fn(),
    };
    // `$transaction` just runs its queries; the assertions are on the args.
    prisma.$transaction.mockImplementation((queries: unknown[]) =>
      Promise.all(queries),
    );
    prisma.readingSession.findMany.mockResolvedValue([]);
    prisma.readingSession.count.mockResolvedValue(0);
    repository = new ReadingSessionRepository(prisma as never);
  });

  const findArgs = () => prisma.readingSession.findMany.mock.calls[0][0];
  const whereOf = () => findArgs().where;

  describe('findManyWithPagination', () => {
    it('should derive take from limit instead of hardcoding it', async () => {
      await repository.findManyWithPagination({
        filterOptions: filters,
        paginationOptions: { page: 1, limit: 12 },
      });

      expect(findArgs().take).toBe(12);
    });

    it('should default take to 12 when no pagination options are given', async () => {
      await repository.findManyWithPagination({ filterOptions: filters });

      expect(findArgs().take).toBe(12);
    });

    it('should compute skip from the page and limit', async () => {
      await repository.findManyWithPagination({
        filterOptions: filters,
        paginationOptions: { page: 3, limit: 10 },
      });

      expect(findArgs().skip).toBe(20);
    });

    it('should never cap the result at a single row', async () => {
      await repository.findManyWithPagination({
        filterOptions: filters,
        paginationOptions: { page: 1, limit: 40 },
      });

      expect(findArgs().take).toBe(40);
    });

    it('should order by startedAt then id so pages do not overlap', async () => {
      await repository.findManyWithPagination({ filterOptions: filters });

      expect(findArgs().orderBy).toEqual([
        { startedAt: 'desc' },
        { id: 'desc' },
      ]);
    });

    it('should scope the query to sessions the caller participates in', async () => {
      await repository.findManyWithPagination({ filterOptions: filters });

      expect(whereOf().OR).toEqual([{ humanBookId: 5 }, { readerId: 5 }]);
    });

    it('should count with the same where as the page query', async () => {
      await repository.findManyWithPagination({ filterOptions: filters });

      expect(prisma.readingSession.count).toHaveBeenCalledWith({
        where: whereOf(),
      });
    });
  });

  describe('status filter', () => {
    it('should default to the default statuses when none are given', async () => {
      await repository.findManyWithPagination({ filterOptions: filters });

      expect(whereOf().sessionStatus.in).toEqual(
        expect.arrayContaining(['pending', 'approved', 'missed', 'finished']),
      );
    });

    it('should filter by the requested statuses', async () => {
      await repository.findManyWithPagination({
        filterOptions: {
          ...(filters as object),
          sessionStatuses: [ReadingSessionStatus.PENDING],
        } as never,
      });

      expect(whereOf().sessionStatus).toEqual({ in: ['pending'] });
    });

    it('should accept a multi-select of statuses', async () => {
      await repository.findManyWithPagination({
        filterOptions: {
          ...(filters as object),
          sessionStatuses: [
            ReadingSessionStatus.FINISHED,
            ReadingSessionStatus.MISSED,
          ],
        } as never,
      });

      expect(whereOf().sessionStatus).toEqual({ in: ['finished', 'missed'] });
    });
  });

  describe('date params', () => {
    it('should AND startedAt and endedAt together', async () => {
      await repository.findManyWithPagination({
        filterOptions: {
          ...(filters as object),
          startedAt: '2024-05-01T00:00:00.000Z',
          endedAt: '2024-05-31T00:00:00.000Z',
        } as never,
      });

      expect(whereOf().AND).toEqual([
        { startedAt: { gte: new Date('2024-05-01T00:00:00.000Z') } },
        { startedAt: { lte: new Date('2024-05-31T00:00:00.000Z') } },
      ]);
    });

    it('should apply no date constraint when neither param is sent', async () => {
      await repository.findManyWithPagination({ filterOptions: filters });

      expect(whereOf().AND).toBeUndefined();
    });

    it('should apply a status filter alongside the date range', async () => {
      await repository.findManyWithPagination({
        filterOptions: {
          ...(filters as object),
          sessionStatuses: [ReadingSessionStatus.PENDING],
          startedAt: '2024-05-01T00:00:00.000Z',
        } as never,
      });

      expect(whereOf().sessionStatus).toEqual({ in: ['pending'] });
      expect(whereOf().AND).toHaveLength(1);
    });
  });

  describe('countByFilterOption', () => {
    it('should return a count for every filter option', async () => {
      const counts = await repository.countByFilterOption(filters);

      expect(counts).toEqual({
        all: 0,
        approved: 0,
        pending: 0,
        finished: 0,
        missed: 0,
      });
    });

    it('should count each tab by its own status', async () => {
      await repository.countByFilterOption(filters);

      const statusFilters = prisma.readingSession.count.mock.calls.map(
        (call) => call[0].where.sessionStatus,
      );

      expect(statusFilters).toEqual([
        expect.objectContaining({
          in: expect.arrayContaining([
            'pending',
            'approved',
            'missed',
            'finished',
          ]),
        }),
        { in: ['approved'] },
        { in: ['pending'] },
        { in: ['finished'] },
        { in: ['missed'] },
      ]);
    });

    it('should scope every count to the caller', async () => {
      await repository.countByFilterOption(filters);

      for (const call of prisma.readingSession.count.mock.calls) {
        expect(call[0].where.OR).toEqual([{ humanBookId: 5 }, { readerId: 5 }]);
      }
    });
  });
});
