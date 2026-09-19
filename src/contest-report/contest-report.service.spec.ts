import { NotFoundException } from '@nestjs/common';
import { ContestReportService } from './contest-report.service';
import { ContestReportRepository } from './contest-report.repository';
import { StoriesService } from '@stories/stories.service';

describe('ContestReportService', () => {
  let service: ContestReportService;
  let storiesService: { getContestParticipants: jest.Mock };
  let repository: { save: jest.Mock; findLatestFilename: jest.Mock; getFilePath: jest.Mock };

  beforeEach(() => {
    storiesService = { getContestParticipants: jest.fn() };
    repository = {
      save: jest.fn(),
      findLatestFilename: jest.fn(),
      getFilePath: jest.fn(),
    };
    service = new ContestReportService(
      storiesService as unknown as StoriesService,
      repository as never,
    );
  });

  describe('generate', () => {
    it('should build a workbook and save it with a sanitized topic filename', async () => {
      storiesService.getContestParticipants.mockResolvedValue([
        {
          fullName: 'A',
          email: 'a@b.com',
          phoneNumber: '123',
          bio: 'bio',
          stories: [
            {
              id: 1,
              title: 'T',
              abstract: 'Abs',
              createdAt: '2026-01-01T00:00:00Z',
              likeCount: 3,
              shareCount: 1,
            },
          ],
        },
      ]);

      const filename = await service.generate('Khoảnh khắc Đẹp!');

      expect(filename).toContain('contest-report-');
      expect(filename).toContain('khoanh_khac_dep');
      expect(repository.save).toHaveBeenCalledWith(
        filename,
        expect.any(Object),
      );
    });

    it('should write a single row per story and a bare row for storyless users', async () => {
      storiesService.getContestParticipants.mockResolvedValue([
        { fullName: 'No Story', email: 'x@x.com', phoneNumber: '', bio: '', stories: [] },
        {
          fullName: 'With Story',
          email: 'y@y.com',
          phoneNumber: '',
          bio: '',
          stories: [{ id: 9, title: 'S', abstract: '', createdAt: null, likeCount: 0, shareCount: 0 }],
        },
      ]);

      await service.generate('Topic');

      const workbook = repository.save.mock.calls[0][1];
      const sheet = workbook.getWorksheet('Contest Participants');
      expect(sheet.rowCount).toBe(3);
      expect(sheet.getRow(2).getCell(1).value).toBe('No Story');
      expect(sheet.getRow(3).getCell(5).value).toBe(9);
    });
  });

  describe('getLatestFilename', () => {
    it('should throw NotFound when no report file matches', async () => {
      repository.findLatestFilename.mockReturnValue(null);

      expect(() => service.getLatestFilename('Khoảnh khắc')).toThrow(
        NotFoundException,
      );
    });

    it('should return the latest matching filename', () => {
      repository.findLatestFilename.mockReturnValue('contest-report-2026-01-01.xlsx');

      expect(service.getLatestFilename('Khoảnh khắc')).toBe(
        'contest-report-2026-01-01.xlsx',
      );
    });
  });

  describe('getFilePath', () => {
    it('should throw NotFound when the file does not exist', () => {
      repository.getFilePath.mockReturnValue(null);

      expect(() => service.getFilePath('nope.xlsx')).toThrow(NotFoundException);
    });

    it('should return the resolved file path', () => {
      repository.getFilePath.mockReturnValue('C:/reports/a.xlsx');

      expect(service.getFilePath('a.xlsx')).toBe('C:/reports/a.xlsx');
    });
  });
});