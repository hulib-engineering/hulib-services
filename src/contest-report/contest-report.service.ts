import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { SAFE_TOPIC_REGEX } from './constants';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';

@Injectable()
export class ContestReportService {
  private readonly logger = new Logger(ContestReportService.name);
  private readonly reportsDir = join(process.cwd(), 'reports');

  constructor(private readonly prisma: PrismaService) {
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  @Cron(process.env.CONTEST_REPORT_CRON || CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyReport() {
    this.logger.log('Starting daily contest report generation...');
    const filename = await this.generate();
    this.logger.log(`Daily report saved: ${filename}`);
  }

  private sanitizeTopicName(topicName: string): string {
    return topicName.replace(SAFE_TOPIC_REGEX, '_').substring(0, 30);
  }

  async generate(topicName: string = 'Khoảnh khắc'): Promise<string> {
    const topicFilter = { name: { startsWith: topicName } };

    const users = await this.prisma.user.findMany({
      where: {
        stories: {
          some: {
            topics: {
              some: { topic: topicFilter },
            },
          },
        },
      },
      select: {
        fullName: true,
        email: true,
        bio: true,
        phoneNumber: true,
        stories: {
          where: {
            topics: {
              some: { topic: topicFilter },
            },
          },
          select: {
            id: true,
            title: true,
            abstract: true,
            createdAt: true,
          },
        },
      },
    });

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
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.alignment = { horizontal: 'center' };

    const rows = users.flatMap((user) => {
      if (user.stories.length === 0) {
        return [{
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
        }];
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
          ? new Date(story.createdAt).toISOString().slice(0, 19).replace('T', ' ')
          : '',
      }));
    });
    sheet.addRows(rows);

    const today = new Date().toISOString().slice(0, 10);
    const safeTopic = this.sanitizeTopicName(topicName);
    const filename = `contest-report-${today}-${safeTopic}.xlsx`;
    const filePath = join(this.reportsDir, filename);
    await workbook.xlsx.writeFile(filePath);
    return filename;
  }

  getLatestFilename(topicName: string = 'Khoảnh khắc'): string {
    if (!existsSync(this.reportsDir)) {
      throw new NotFoundException('No reports directory found');
    }
    const safeTopic = this.sanitizeTopicName(topicName);
    const prefix = `contest-report-`;
    const files = readdirSync(this.reportsDir)
      .filter((f) => f.startsWith(prefix) && f.endsWith('.xlsx') && f.includes(safeTopic))
      .sort()
      .reverse();
    if (files.length === 0) {
      throw new NotFoundException('No report files found');
    }
    return files[0];
  }

  getFilePath(filename: string): string {
    const filePath = join(this.reportsDir, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException(`Report file not found: ${filename}`);
    }
    return filePath;
  }
}
