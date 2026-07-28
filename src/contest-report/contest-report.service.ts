import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StoriesService } from '@stories/stories.service';
import { ContestUser } from './domain/contest-report';
import * as ExcelJS from 'exceljs';
import { ContestReportRepository } from './infrastructure/persistence/contest-report.repository';

@Injectable()
export class ContestReportService {
  private readonly logger = new Logger(ContestReportService.name);
  private readonly MAX_EXPORT_ROWS =
    Number(process.env.CONTEST_REPORT_MAX_ROWS) || 10000;

  constructor(
    private readonly storiesService: StoriesService,
    private readonly contestReportRepository: ContestReportRepository,
  ) {}

  @Cron(process.env.CONTEST_REPORT_CRON || CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyReport() {
    this.logger.log('Starting daily contest report generation...');
    const filename = await this.generate();
    this.logger.log(`Daily report saved: ${filename}`);
  }

  private sanitizeTopicName(topicName: string): string {
    return (
      topicName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\u0111/g, 'd')
        .replace(/\u0110/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 30) || 'topic'
    );
  }

  async generate(topicName = 'Khoảnh khắc'): Promise<string> {
    const contestParticipants =
      await this.storiesService.getContestParticipants(topicName);
    const users = Array.isArray(contestParticipants)
      ? contestParticipants
      : contestParticipants.data;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hulib System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Contest Participants');

    sheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Phone', key: 'phoneNumber', width: 18 },
      { header: 'Bio', key: 'bio', width: 50 },
      { header: 'Story ID', key: 'storyId', width: 10 },
      { header: 'Story Title', key: 'storyTitle', width: 35 },
      { header: 'Story Abstract', key: 'storyAbstract', width: 60 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Likes', key: 'likeCount', width: 10 },
      { header: 'Shares', key: 'shareCount', width: 10 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.alignment = { horizontal: 'center' };

    const rows = (users as ContestUser[])
      .slice(0, this.MAX_EXPORT_ROWS)
      .flatMap((user) => {
        if (user.stories.length === 0) {
          return [
            {
              fullName: user.fullName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              bio: user.bio,
            },
          ];
        }
        return user.stories.map((story) => ({
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
          storyId: story.id,
          storyTitle: story.title,
          storyAbstract: story.abstract,
          createdAt: story.createdAt
            ? new Date(story.createdAt)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ')
            : '',
          likeCount: story.likeCount,
          shareCount: story.shareCount,
        }));
      });
    sheet.addRows(rows);

    const today = new Date().toISOString().slice(0, 10);
    const safeTopic = this.sanitizeTopicName(topicName);
    const filename = `contest-report-${today}-${safeTopic}.xlsx`;
    await this.contestReportRepository.save(filename, workbook);
    return filename;
  }

  getLatestFilename(topicName = 'Khoảnh khắc'): string {
    const safeTopic = this.sanitizeTopicName(topicName);
    const filename = this.contestReportRepository.findLatestFilename(safeTopic);
    if (!filename) {
      throw new NotFoundException('No report files found');
    }
    return filename;
  }

  getFilePath(filename: string): string {
    const filePath = this.contestReportRepository.getFilePath(filename);
    if (!filePath) {
      throw new NotFoundException(`Report file not found: ${filename}`);
    }
    return filePath;
  }
}
